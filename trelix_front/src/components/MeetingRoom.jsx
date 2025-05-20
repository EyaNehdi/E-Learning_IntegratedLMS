"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import RoomServiceSupabase from "./room-service.js"

// Helper functions for emotion colors
const getEmotionColor = (emotion) => {
  const colors = {
    happy: "#40c057",
    sad: "#4dabf7",
    angry: "#fa5252",
    surprised: "#fab005",
    neutral: "#868e96",
    fearful: "#be4bdb",
    disgusted: "#fd7e14",
    unknown: "#adb5bd",
  }
  return colors[emotion?.toLowerCase()] || "#adb5bd"
}

const getEmotionBackgroundColor = (emotion) => {
  const colors = {
    happy: "#ebfbee",
    sad: "#e7f5ff",
    angry: "#fff5f5",
    surprised: "#fff9db",
    neutral: "#f8f9fa",
    fearful: "#f3f0ff",
    disgusted: "#fff4e6",
    unknown: "#f8f9fa",
  }
  return colors[emotion?.toLowerCase()] || "#f8f9fa"
}

const getEmotionTextColor = (emotion) => {
  const colors = {
    happy: "#2b8a3e",
    sad: "#0878b4",
    angry: "#c92a2a",
    surprised: "#e67700",
    neutral: "#343a40",
    fearful: "#7950f2",
    disgusted: "#d9480f",
    unknown: "#343a40",
  }
  return colors[emotion?.toLowerCase()] || "#343a40"
}

const getEmotionBorderColor = (emotion) => {
  const colors = {
    happy: "#94d8a2",
    sad: "#a5d8ff",
    angry: "#ffc9c9",
    surprised: "#ffe08a",
    neutral: "#ced4da",
    fearful: "#d0bfff",
    disgusted: "#ffbb91",
    unknown: "#ced4da",
  }
  return colors[emotion?.toLowerCase()] || "#ced4da"
}

const getEmotionFeedback = (emotion) => {
  if (!emotion) return "No emotion data available."

  const feedback = {
    happy: "Student is engaged and enjoying the class.",
    sad: "Student may need encouragement or support.",
    angry: "Student might be frustrated with the material.",
    surprised: "Student is reacting to new information.",
    neutral: "Student is attentive but not emotionally engaged.",
    fearful: "Student may be anxious about the material.",
    disgusted: "Student may be having a negative reaction.",
    unknown: "No emotion data available.",
  }
  return feedback[emotion.toLowerCase()] || "No feedback available."
}

export default function MeetingRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const videoContainerRef = useRef(null)

  // Jitsi state
  const [jitsiLoaded, setJitsiLoaded] = useState(false)
  const [jitsiError, setJitsiError] = useState(false)
  const jitsiApiRef = useRef(null)

  // Emotion detection state
  const [emotion, setEmotion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [autoDetectActive, setAutoDetectActive] = useState(false) // Start with detection off
  const [emotionStats, setEmotionStats] = useState({})
  const [webcamError, setWebcamError] = useState(false)
  const [mockMode, setMockMode] = useState(false)
  const [detectionInterval, setDetectionInterval] = useState(30)
  const [participantEmotions, setParticipantEmotions] = useState({})

  // Processed emotions cache to prevent duplicates
  const processedEmotions = useRef(new Set())

  // Refs for cleanup
  const intervalRef = useRef(null)
  const subscriptionRef = useRef(null)
  const pollIntervalRef = useRef(null)

  // User identification
  const [isHost, setIsHost] = useState(false)
  const [userId, setUserId] = useState("")
  const [displayName, setDisplayName] = useState("Participant")
  const [instructorId, setInstructorId] = useState("")

  // Debug state
  const [showDebug, setShowDebug] = useState(false)
  const [debugMessages, setDebugMessages] = useState([])

  // Function to add debug message
  const addDebugMessage = (message) => {
    console.log(`[DEBUG] ${message}`)
    setDebugMessages((prev) => {
      const newMessages = [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          message,
        },
      ]
      // Keep only the last 10 messages to prevent memory issues
      if (newMessages.length > 10) {
        return newMessages.slice(newMessages.length - 10)
      }
      return newMessages
    })
  }

  // Load user data from localStorage
  const ensureRoomExists = async () => {
    if (!roomId) return

    try {
      // Check if this room exists in our database
      const roomExists = await RoomServiceSupabase.roomExists(roomId)

      // If we're joining as a student and the room doesn't exist in our database
      if (!isHost) {
        addDebugMessage(`Joining room ${roomId}`)

        // Get the existing room info or create a placeholder
        const roomInfo = await RoomServiceSupabase.getRoomInfo(roomId)

        addDebugMessage(`Room info retrieved: ${roomInfo ? "success" : "failed"}`)
      }
    } catch (err) {
      console.error("Error ensuring room exists:", err)
      addDebugMessage(`Error ensuring room exists: ${err.message}`)
    }
  }

  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem("userId")
      const storedDisplayName = localStorage.getItem("displayName") || "Participant"
      const storedIsHost = localStorage.getItem("isHost") === "true"
      const storedInstructorId = localStorage.getItem("instructorId")

      setUserId(storedUserId || "")
      setDisplayName(storedDisplayName)
      setIsHost(storedIsHost)

      if (storedIsHost) {
        setInstructorId(storedUserId)
      } else {
        setInstructorId(storedInstructorId || "")
      }

      addDebugMessage(`Loaded user data - Role: ${storedIsHost ? "Instructor" : "Student"}, Name: ${storedDisplayName}`)

      // Debug: List all rooms
      RoomServiceSupabase.listAllRooms().then((allRooms) => {
        addDebugMessage(`Available rooms: ${JSON.stringify(allRooms.map((r) => r.room_id))}`)
      })

      // Add this line to ensure room exists in the database
      ensureRoomExists()
    } catch (err) {
      console.error("Error loading user data:", err)
    }
  }, [roomId])

  // Manual poll for emotions (for instructors)
  const manualPollEmotions = async () => {
    if (!isHost || !roomId || !userId) return

    addDebugMessage("Manually polling for emotions...")

    try {
      const emotions = await RoomServiceSupabase.getStudentEmotions(roomId, userId)
      const emotionCount = Object.keys(emotions).length

      addDebugMessage(`Manual poll retrieved ${emotionCount} emotions`)

      if (emotionCount > 0) {
        setParticipantEmotions(emotions)
      }
    } catch (err) {
      console.error("Error in manual emotion poll:", err)
      addDebugMessage(`Error polling emotions: ${err.message}`)
    }
  }

  // Set up polling for instructors as a fallback
  useEffect(() => {
    if (!isHost || !roomId || !userId) return

    // Set up a polling interval as a fallback
    pollIntervalRef.current = setInterval(manualPollEmotions, 10000) // Poll every 10 seconds

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [isHost, roomId, userId])

  // Mock data for testing
  const useMockData = () => {
    if (isHost && mockMode) {
      const mockStudents = {
        student1: {
          id: "student1",
          name: "John Smith",
          emotion: "happy",
          timestamp: new Date().toISOString(),
          instructorId: userId,
        },
        student2: {
          id: "student2",
          name: "Maria Garcia",
          emotion: "neutral",
          timestamp: new Date().toISOString(),
          instructorId: userId,
        },
      }
      setParticipantEmotions(mockStudents)
      addDebugMessage("Added mock student data for testing")
    }
  }

  // Function to fetch emotion from the API
  const fetchEmotion = async () => {
    if (!autoDetectActive) return

    setLoading(true)
    setError(null)

    try {
      // If in mock mode, generate random emotions
      if (mockMode) {
        const emotions = ["happy", "sad", "angry", "surprised", "neutral"]
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]

        // Simulate API response
        setTimeout(() => {
          handleEmotionDetected(randomEmotion)
          addDebugMessage(`Mock emotion detected: ${randomEmotion}`)
        }, 500)
        return
      }

      const response = await axios.get("https://facerecognition-qoya.onrender.com/api/emotion")
      console.log("API Response:", response.data)

      // Check if the API returned an error
      if (response.data.error) {
        if (response.data.error === "Failed to access webcam") {
          setWebcamError(true)
          setError("Failed to access webcam. Please check your camera permissions.")
          addDebugMessage("Webcam access error")
        } else {
          setError(`API Error: ${response.data.error}`)
          addDebugMessage(`API Error: ${response.data.error}`)
        }
        return
      }

      // Reset webcam error state if we successfully get a response
      if (webcamError) {
        setWebcamError(false)
      }

      // If we have an emotion property, use it
      if (response.data.emotion) {
        const detectedEmotion = response.data.emotion
        handleEmotionDetected(detectedEmotion)
      } else {
        setError("No emotion detected in API response")
        addDebugMessage("No emotion detected in API response")
      }
    } catch (err) {
      setError(`Error fetching emotion data: ${err.message}`)
      console.error("Emotion detection error:", err)
      addDebugMessage(`Error fetching emotion: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle detected emotion
  const handleEmotionDetected = (detectedEmotion) => {
    setEmotion(detectedEmotion)

    // Update emotion statistics
    setEmotionStats((prevStats) => {
      const newStats = { ...prevStats }
      newStats[detectedEmotion] = (newStats[detectedEmotion] || 0) + 1
      return newStats
    })

    // If we're a student, send our emotion to the instructor
    if (!isHost && userId && displayName && instructorId) {
      try {
        RoomServiceSupabase.sendEmotion(roomId, userId, displayName, instructorId, detectedEmotion).then((result) => {
          if (result.success) {
            addDebugMessage(`Sent emotion to instructor: ${detectedEmotion} (broadcast ID: ${result.broadcastId})`)
          } else {
            addDebugMessage(`Failed to send emotion: ${result.error}`)
          }
        })
      } catch (err) {
        console.error("Error sending emotion:", err)
        addDebugMessage(`Error sending emotion: ${err.message}`)
      }
    }
  }

  // Set up real-time subscription for instructors
  useEffect(() => {
    if (!isHost || !roomId || !userId) return

    addDebugMessage(`Setting up real-time subscription for instructor ${userId}`)

    // This will set up a Supabase real-time subscription
    const unsubscribe = RoomServiceSupabase.setupEmotionSubscription(roomId, userId, (emotions) => {
      addDebugMessage(`Received updated emotions, count: ${Object.keys(emotions).length}`)
      setParticipantEmotions(emotions)
    })

    subscriptionRef.current = unsubscribe

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current()
      }
    }
  }, [isHost, roomId, userId])

  // Initial fetch of student emotions for instructors
  useEffect(() => {
    if (!isHost || !roomId || !userId) return

    addDebugMessage(`Fetching initial student emotions as instructor ${userId} in room ${roomId}`)

    const fetchEmotions = async () => {
      try {
        const studentEmotions = await RoomServiceSupabase.getStudentEmotions(roomId, userId)
        const emotionCount = Object.keys(studentEmotions).length

        addDebugMessage(`Retrieved ${emotionCount} student emotions`)

        // Only update if we have emotions
        if (emotionCount > 0) {
          setParticipantEmotions(studentEmotions)
        }
      } catch (err) {
        console.error("Error fetching student emotions:", err)
        addDebugMessage(`Error fetching emotions: ${err.message}`)
      }
    }

    fetchEmotions()
  }, [isHost, roomId, userId])

  // Start automatic emotion detection
  useEffect(() => {
    if (autoDetectActive) {
      // Initial detection
      fetchEmotion()

      // Set up interval for detection
      intervalRef.current = setInterval(() => {
        fetchEmotion()
      }, detectionInterval * 1000)
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoDetectActive, mockMode, detectionInterval])

  // Update interval when detection interval changes
  const updateDetectionInterval = (seconds) => {
    setDetectionInterval(seconds)

    // Reset the interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (autoDetectActive) {
      intervalRef.current = setInterval(() => {
        fetchEmotion()
      }, seconds * 1000)
    }
  }

  const goToHome = () => {
    // Stop automatic detection
    setAutoDetectActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (subscriptionRef.current) {
      subscriptionRef.current()
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }

    // Navigate to home
    navigate("/")
  }

  // Calculate total detections and percentages
  const totalDetections = Object.values(emotionStats).reduce((sum, count) => sum + count, 0) || 1
  const emotionPercentages = {}
  Object.keys(emotionStats).forEach((emotion) => {
    emotionPercentages[emotion] = ((emotionStats[emotion] / totalDetections) * 100).toFixed(1)
  })

  // Initialize Jitsi Meet
  useEffect(() => {
    let scriptElement = null
    let isMounted = true

    const initializeJitsi = () => {
      try {
        if (!videoContainerRef.current || !window.JitsiMeetExternalAPI) {
          console.error("Cannot initialize Jitsi: container ref or API not available")
          if (isMounted) {
            setJitsiError(true)
          }
          return
        }

        const domain = "meet.jit.si"
        const options = {
          roomName: roomId,
          width: "100%",
          height: "100%",
          parentNode: videoContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "fullscreen",
              "hangup",
              "profile",
              "chat",
              "settings",
              "raisehand",
              "videoquality",
              "filmstrip",
              "tileview",
            ],
          },
          userInfo: {
            displayName: displayName,
          },
        }

        console.log("Initializing Jitsi with options:", options)

        // Initialize the Jitsi Meet API
        const api = new window.JitsiMeetExternalAPI(domain, options)
        jitsiApiRef.current = api

        if (isMounted) {
          setJitsiLoaded(true)
        }

        console.log("Jitsi initialized successfully")
      } catch (err) {
        console.error("Error initializing Jitsi:", err)
        if (isMounted) {
          setJitsiError(true)
          setError("Failed to initialize video conference: " + err.message)
        }
      }
    }

    const loadJitsiScript = () => {
      scriptElement = document.createElement("script")
      scriptElement.src = "https://meet.jit.si/external_api.js"
      scriptElement.async = true
      scriptElement.onload = () => {
        console.log("Jitsi script loaded")
        if (isMounted) {
          // Add a small delay to ensure DOM is ready
          setTimeout(initializeJitsi, 100)
        }
      }
      scriptElement.onerror = (err) => {
        console.error("Error loading Jitsi script:", err)
        if (isMounted) {
          setJitsiError(true)
          setError("Failed to load video conference script")
        }
      }

      document.body.appendChild(scriptElement)
    }

    // Load the script
    loadJitsiScript()

    // Cleanup function
    return () => {
      isMounted = false

      if (scriptElement && scriptElement.parentNode) {
        document.body.removeChild(scriptElement)
      }

      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose()
        } catch (err) {
          console.error("Error disposing Jitsi:", err)
        }
      }
    }
  }, [roomId, displayName])

  // Class engagement summary component
  const ClassEngagementSummary = ({ participants }) => {
    const students = Object.values(participants)

    if (students.length === 0) {
      return <p style={{ fontSize: "13px" }}>No students have joined yet.</p>
    }

    // Count emotions
    const emotionCounts = {}
    students.forEach((student) => {
      if (student.emotion) {
        emotionCounts[student.emotion] = (emotionCounts[student.emotion] || 0) + 1
      }
    })

    // Calculate engagement metrics
    const engagedEmotions = ["happy", "surprised", "neutral"]
    const disengagedEmotions = ["sad", "angry", "fearful", "disgusted"]

    let engagedCount = 0
    let disengagedCount = 0

    Object.keys(emotionCounts).forEach((emotion) => {
      if (engagedEmotions.includes(emotion.toLowerCase())) {
        engagedCount += emotionCounts[emotion]
      } else if (disengagedEmotions.includes(emotion.toLowerCase())) {
        disengagedCount += emotionCounts[emotion]
      }
    })

    const totalWithEmotions = engagedCount + disengagedCount
    const engagementPercentage = totalWithEmotions > 0 ? Math.round((engagedCount / totalWithEmotions) * 100) : 0

    // Generate summary text
    let summaryText = ""
    if (engagementPercentage >= 75) {
      summaryText = "Class is highly engaged! Most students are focused."
    } else if (engagementPercentage >= 50) {
      summaryText = "Class is moderately engaged. Some students may need attention."
    } else if (engagementPercentage >= 25) {
      summaryText = "Class engagement is low. Consider changing activities."
    } else {
      summaryText = "Class is disengaged. Immediate intervention recommended."
    }

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>
              Class Engagement: {engagementPercentage}%
            </div>
            <div
              style={{
                height: "8px",
                backgroundColor: "#dee2e6",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${engagementPercentage}%`,
                  height: "100%",
                  backgroundColor: engagementPercentage >= 50 ? "#40c057" : "#fa5252",
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>
          <div
            style={{
              marginLeft: "12px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: engagementPercentage >= 50 ? "#d3f9d8" : "#ffe3e3",
              color: engagementPercentage >= 50 ? "#2b8a3e" : "#c92a2a",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {engagementPercentage}%
          </div>
        </div>

        <p style={{ fontSize: "13px", margin: "8px 0" }}>{summaryText}</p>

        <div style={{ fontSize: "12px", color: "#495057" }}>
          <div>Total students: {students.length}</div>
          <div>Engaged students: {engagedCount}</div>
          <div>Disengaged students: {disengagedCount}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: "relative", height: "calc(100vh - 200px)", width: "100%", margin: "20px 0" }}>
      {/* Video container */}
      <div
        ref={videoContainerRef}
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />

      {/* Loading or error message */}
      {!jitsiLoaded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            zIndex: 10,
          }}
        >
          {jitsiError ? (
            <div style={{ textAlign: "center", maxWidth: "80%" }}>
              <h2 style={{ color: "#e03131", marginBottom: "20px" }}>Failed to load video conference</h2>
              <p style={{ marginBottom: "20px" }}>
                {error || "There was a problem loading the video conference. Please try again."}
              </p>
              <button
                onClick={goToHome}
                style={{
                  backgroundColor: "#2b6cb0",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Return to Home
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <h2 style={{ marginBottom: "20px" }}>Loading video conference...</h2>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "5px solid #f3f3f3",
                  borderTop: "5px solid #3498db",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}
        </div>
      )}

      {/* Home Button */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={goToHome}
          style={{
            backgroundColor: "#2b6cb0",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          Return to Home
        </button>
      </div>

      {/* Manual Refresh Button for Instructors */}
      {isHost && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "180px",
            zIndex: 1000,
          }}
        >
          <button
            onClick={manualPollEmotions}
            style={{
              backgroundColor: "#4dabf7",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            }}
          >
            Refresh Emotions
          </button>
        </div>
      )}

      {/* Emotion Detection UI */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          zIndex: 1000,
          maxWidth: isHost ? "400px" : "300px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "600" }}>
          {isHost ? "Instructor Dashboard" : "Emotion Detection"} {autoDetectActive ? "(Auto)" : "(Stopped)"}
        </h3>

        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          <button
            onClick={() => setAutoDetectActive(!autoDetectActive)}
            style={{
              backgroundColor: autoDetectActive ? "#e03131" : "#4dabf7",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "14px",
              cursor: "pointer",
              flex: "1",
            }}
          >
            {autoDetectActive ? "Stop Detection" : "Start Detection"}
          </button>

          <button
            onClick={() => {
              setMockMode(!mockMode)
              if (!mockMode && isHost) {
                setTimeout(useMockData, 500)
              }
            }}
            style={{
              backgroundColor: mockMode ? "#2b8a3e" : "#868e96",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "14px",
              cursor: "pointer",
              flex: "1",
            }}
          >
            {mockMode ? "Mock: ON" : "Use Mock"}
          </button>
        </div>

        {/* Debug Toggle */}
        <div style={{ marginBottom: "10px", textAlign: "right" }}>
          <button
            onClick={() => setShowDebug(!showDebug)}
            style={{
              backgroundColor: "transparent",
              color: "#666",
              border: "none",
              fontSize: "12px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {showDebug ? "Hide Debug" : "Show Debug"}
          </button>
        </div>

        {/* Debug Messages */}
        {showDebug && (
          <div
            style={{
              marginBottom: "15px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              padding: "8px",
              maxHeight: "150px",
              overflowY: "auto",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          >
            {debugMessages.length === 0 ? (
              <div style={{ color: "#666" }}>No debug messages yet</div>
            ) : (
              debugMessages.map((msg, i) => (
                <div key={i} style={{ marginBottom: "4px" }}>
                  <span style={{ color: "#666" }}>[{msg.time}]</span> {msg.message}
                </div>
              ))
            )}
          </div>
        )}

        {/* Detection Interval Settings */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
            Detection Interval: {detectionInterval} seconds
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {[15, 30, 60].map((seconds) => (
              <button
                key={seconds}
                onClick={() => updateDetectionInterval(seconds)}
                style={{
                  backgroundColor: detectionInterval === seconds ? "#4dabf7" : "#e9ecef",
                  color: detectionInterval === seconds ? "white" : "#495057",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  fontSize: "12px",
                  cursor: "pointer",
                  flex: "1",
                }}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>

        {loading && <p style={{ fontSize: "14px", margin: "5px 0" }}>Analyzing...</p>}

        {webcamError && !mockMode && (
          <div
            style={{
              backgroundColor: "#fff5f5",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "10px",
              border: "1px solid #ffc9c9",
            }}
          >
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "500", color: "#e03131" }}>
              Webcam Access Error
            </p>
            <p style={{ margin: "0", fontSize: "13px" }}>Enable mock mode to test with simulated emotions.</p>
          </div>
        )}

        {error && !webcamError && (
          <div
            style={{
              fontSize: "14px",
              color: "#e03131",
              margin: "5px 0",
              padding: "8px",
              backgroundColor: "#fff5f5",
              borderRadius: "4px",
            }}
          >
            <p style={{ margin: "0" }}>{error}</p>
          </div>
        )}

        {/* Current Emotion (for students) */}
        {!isHost && emotion && (
          <div
            style={{
              backgroundColor: "#e7f5ff",
              padding: "10px",
              borderRadius: "6px",
              marginTop: "5px",
            }}
          >
            <p style={{ margin: "0", fontSize: "14px" }}>
              <strong>Your Emotion:</strong> {emotion} {mockMode && "(Mock)"}
            </p>
            <p style={{ margin: "5px 0 0 0", fontSize: "12px", fontStyle: "italic", color: "#495057" }}>
              Your emotion is being shared with the instructor.
            </p>
          </div>
        )}

        {/* Instructor View - Participants Emotions */}
        {isHost && (
          <div style={{ marginTop: "15px" }}>
            <h4
              style={{
                fontSize: "16px",
                margin: "0 0 12px 0",
                fontWeight: "600",
                borderBottom: "2px solid #e9ecef",
                paddingBottom: "8px",
              }}
            >
              Student Emotions
            </h4>

            {Object.keys(participantEmotions).length === 0 ? (
              <div
                style={{
                  padding: "15px",
                  textAlign: "center",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  color: "#495057",
                }}
              >
                <p style={{ margin: "0", fontSize: "14px" }}>No students have joined yet.</p>
                <button
                  onClick={useMockData}
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#4dabf7",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Load Sample Data
                </button>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  padding: "12px",
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: "500", fontSize: "14px" }}>
                    Total Students: {Object.keys(participantEmotions).length}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      backgroundColor: "#4dabf7",
                      color: "white",
                    }}
                  >
                    {mockMode ? "Mock Data" : "Live Updates"}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "10px",
                    maxHeight: "300px",
                    overflowY: "auto",
                    padding: "5px",
                  }}
                >
                  {Object.values(participantEmotions).map((participant) => (
                    <div
                      key={participant.id}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        border: `1px solid ${getEmotionBorderColor(participant.emotion)}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: getEmotionColor(participant.emotion),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "16px",
                          }}
                        >
                          {participant.name ? participant.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div style={{ overflow: "hidden" }}>
                          <div
                            style={{
                              fontWeight: "600",
                              fontSize: "14px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {participant.name || "Unknown Student"}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: getEmotionBackgroundColor(participant.emotion),
                          padding: "8px",
                          borderRadius: "6px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "500",
                            fontSize: "15px",
                            color: getEmotionTextColor(participant.emotion),
                          }}
                        >
                          {participant.emotion ? participant.emotion.toUpperCase() : "UNKNOWN"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Class Engagement Summary */}
            {Object.keys(participantEmotions).length > 0 && (
              <div style={{ marginTop: "15px" }}>
                <h4 style={{ fontSize: "14px", margin: "0 0 8px 0", fontWeight: "600" }}>Class Engagement:</h4>
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "6px",
                    padding: "10px",
                  }}
                >
                  <ClassEngagementSummary participants={participantEmotions} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
