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
  const dashboardRef = useRef(null)

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

  // Dashboard UI state
  const [dashboardPosition, setDashboardPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dashboardMinimized, setDashboardMinimized] = useState(false)
  const [dashboardView, setDashboardView] = useState("emotions") // "emotions" or "stats"
  const [dashboardSize, setDashboardSize] = useState("medium") // "small", "medium", "large"

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

  // Load dashboard position from localStorage
  useEffect(() => {
    try {
      const savedPosition = localStorage.getItem("dashboardPosition")
      if (savedPosition) {
        setDashboardPosition(JSON.parse(savedPosition))
      }

      const savedMinimized = localStorage.getItem("dashboardMinimized")
      if (savedMinimized !== null) {
        setDashboardMinimized(savedMinimized === "true")
      }

      const savedSize = localStorage.getItem("dashboardSize")
      if (savedSize) {
        setDashboardSize(savedSize)
      }

      const savedView = localStorage.getItem("dashboardView")
      if (savedView) {
        setDashboardView(savedView)
      }
    } catch (err) {
      console.error("Error loading dashboard settings:", err)
    }
  }, [])

  // Save dashboard position to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("dashboardPosition", JSON.stringify(dashboardPosition))
    } catch (err) {
      console.error("Error saving dashboard position:", err)
    }
  }, [dashboardPosition])

  // Save dashboard minimized state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("dashboardMinimized", dashboardMinimized.toString())
    } catch (err) {
      console.error("Error saving dashboard minimized state:", err)
    }
  }, [dashboardMinimized])

  // Save dashboard size to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("dashboardSize", dashboardSize)
    } catch (err) {
      console.error("Error saving dashboard size:", err)
    }
  }, [dashboardSize])

  // Save dashboard view to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("dashboardView", dashboardView)
    } catch (err) {
      console.error("Error saving dashboard view:", err)
    }
  }, [dashboardView])

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (dashboardRef.current && e.target.closest(".dashboard-header")) {
      setIsDragging(true)
      const rect = dashboardRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // Ensure dashboard stays within viewport
      const maxX = window.innerWidth - (dashboardRef.current?.offsetWidth || 300)
      const maxY = window.innerHeight - (dashboardRef.current?.offsetHeight || 200)

      setDashboardPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      })
    }
  }

  // Handle mouse up for dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add event listeners for dragging
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

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

  // Get dashboard width based on size
  const getDashboardWidth = () => {
    switch (dashboardSize) {
      case "small":
        return "280px"
      case "large":
        return "450px"
      case "medium":
      default:
        return "350px"
    }
  }

  // Get dashboard max height based on size
  const getDashboardMaxHeight = () => {
    switch (dashboardSize) {
      case "small":
        return "400px"
      case "large":
        return "700px"
      case "medium":
      default:
        return "550px"
    }
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

      {/* Student Emotion UI */}
      {!isHost && (
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
            maxWidth: "300px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "600" }}>
            Emotion Detection {autoDetectActive ? "(Auto)" : "(Stopped)"}
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
          {emotion && (
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
        </div>
      )}

      {/* Instructor Dashboard */}
      {isHost && (
        <>
          {/* Minimized Dashboard Button */}
          {dashboardMinimized && (
            <div
              style={{
                position: "absolute",
                top: dashboardPosition.y,
                left: dashboardPosition.x,
                zIndex: 1000,
                backgroundColor: "#4dabf7",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
              onClick={() => setDashboardMinimized(false)}
            >
              <span style={{ color: "white", fontSize: "24px" }}>👁️</span>
            </div>
          )}

          {/* Full Dashboard */}
          {!dashboardMinimized && (
            <div
              ref={dashboardRef}
              style={{
                position: "absolute",
                top: dashboardPosition.y,
                left: dashboardPosition.x,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                zIndex: 1000,
                width: getDashboardWidth(),
                maxHeight: getDashboardMaxHeight(),
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                cursor: isDragging ? "grabbing" : "auto",
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Dashboard Header */}
              <div
                className="dashboard-header"
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#4dabf7",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "grab",
                  userSelect: "none",
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "16px" }}>Instructor Dashboard</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {/* Size Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const sizes = ["small", "medium", "large"]
                      const currentIndex = sizes.indexOf(dashboardSize)
                      const nextIndex = (currentIndex + 1) % sizes.length
                      setDashboardSize(sizes[nextIndex])
                    }}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "16px",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                    }}
                  >
                    {dashboardSize === "small" ? "🔍" : dashboardSize === "medium" ? "📊" : "📋"}
                  </button>

                  {/* Minimize Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDashboardMinimized(true)
                    }}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "16px",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                    }}
                  >
                    —
                  </button>
                </div>
              </div>

              {/* Dashboard Tabs */}
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid #e9ecef",
                }}
              >
                <button
                  onClick={() => setDashboardView("emotions")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor: dashboardView === "emotions" ? "#e7f5ff" : "transparent",
                    border: "none",
                    borderBottom: dashboardView === "emotions" ? "2px solid #4dabf7" : "none",
                    cursor: "pointer",
                    fontWeight: dashboardView === "emotions" ? "600" : "normal",
                    color: dashboardView === "emotions" ? "#4dabf7" : "#495057",
                  }}
                >
                  Student Emotions
                </button>
                <button
                  onClick={() => setDashboardView("stats")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor: dashboardView === "stats" ? "#e7f5ff" : "transparent",
                    border: "none",
                    borderBottom: dashboardView === "stats" ? "2px solid #4dabf7" : "none",
                    cursor: "pointer",
                    fontWeight: dashboardView === "stats" ? "600" : "normal",
                    color: dashboardView === "stats" ? "#4dabf7" : "#495057",
                  }}
                >
                  Class Stats
                </button>
              </div>

              {/* Dashboard Content */}
              <div
                style={{
                  padding: "15px",
                  overflowY: "auto",
                  maxHeight: "calc(100% - 100px)",
                }}
              >
                {/* Controls */}
                <div style={{ marginBottom: "15px" }}>
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
                      onClick={manualPollEmotions}
                      style={{
                        backgroundColor: "#4dabf7",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        cursor: "pointer",
                        flex: "1",
                      }}
                    >
                      Refresh Data
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    

                    <button
                      onClick={() => setShowDebug(!showDebug)}
                      style={{
                        backgroundColor: showDebug ? "#fd7e14" : "#adb5bd",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        cursor: "pointer",
                        flex: "1",
                      }}
                    >
                      {showDebug ? "Hide Debug" : "Show Debug"}
                    </button>
                  </div>
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

                {/* Student Emotions View */}
                {dashboardView === "emotions" && (
                  <div>
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
                            gridTemplateColumns:
                              dashboardSize === "small" ? "1fr" : "repeat(auto-fill, minmax(150px, 1fr))",
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
                  </div>
                )}

                {/* Class Stats View */}
                {dashboardView === "stats" && (
                  <div>
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
                        }}
                      >
                        <ClassEngagementSummary participants={participantEmotions} />

                        {/* Emotion Distribution */}
                        <div style={{ marginTop: "20px" }}>
                          <h4 style={{ fontSize: "14px", margin: "0 0 10px 0", fontWeight: "600" }}>
                            Emotion Distribution
                          </h4>

                          {/* Count emotions */}
                          {(() => {
                            const emotionCounts = {}
                            Object.values(participantEmotions).forEach((student) => {
                              if (student.emotion) {
                                emotionCounts[student.emotion] = (emotionCounts[student.emotion] || 0) + 1
                              }
                            })

                            return Object.keys(emotionCounts).length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {Object.entries(emotionCounts).map(([emotion, count]) => (
                                  <div key={emotion} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div
                                      style={{
                                        width: "16px",
                                        height: "16px",
                                        borderRadius: "4px",
                                        backgroundColor: getEmotionColor(emotion),
                                      }}
                                    ></div>
                                    <div style={{ flex: 1, fontSize: "14px" }}>
                                      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                                    </div>
                                    <div style={{ fontSize: "14px", fontWeight: "500" }}>
                                      {count} ({Math.round((count / Object.keys(participantEmotions).length) * 100)}%)
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: "14px", color: "#666" }}>No emotion data available</p>
                            )
                          })()}
                        </div>

                        {/* Recommendations */}
                        <div style={{ marginTop: "20px" }}>
                          <h4 style={{ fontSize: "14px", margin: "0 0 10px 0", fontWeight: "600" }}>
                            Teaching Recommendations
                          </h4>

                          {(() => {
                            // Count emotions
                            const emotionCounts = {}
                            Object.values(participantEmotions).forEach((student) => {
                              if (student.emotion) {
                                emotionCounts[student.emotion] = (emotionCounts[student.emotion] || 0) + 1
                              }
                            })

                            // Find dominant emotion
                            let dominantEmotion = null
                            let maxCount = 0
                            Object.entries(emotionCounts).forEach(([emotion, count]) => {
                              if (count > maxCount) {
                                dominantEmotion = emotion
                                maxCount = count
                              }
                            })

                            // Generate recommendations based on dominant emotion
                            let recommendations = []
                            if (dominantEmotion === "happy") {
                              recommendations = [
                                "Students are engaged! Continue with current teaching style.",
                                "Consider introducing more challenging material.",
                                "Good time for group activities and discussions.",
                              ]
                            } else if (dominantEmotion === "sad") {
                              recommendations = [
                                "Students may need encouragement. Try positive reinforcement.",
                                "Consider a short break or energizing activity.",
                                "Simplify complex concepts and provide more examples.",
                              ]
                            } else if (dominantEmotion === "angry") {
                              recommendations = [
                                "Students may be frustrated. Check for understanding.",
                                "Slow down and review difficult concepts.",
                                "Consider changing teaching approach or topic.",
                              ]
                            } else if (dominantEmotion === "surprised") {
                              recommendations = [
                                "Students are reacting to new information. Pause for questions.",
                                "Provide context and connect to familiar concepts.",
                                "Check for understanding before moving on.",
                              ]
                            } else if (dominantEmotion === "neutral") {
                              recommendations = [
                                "Students are attentive but not emotionally engaged.",
                                "Try incorporating interactive elements or real-world examples.",
                                "Consider asking thought-provoking questions.",
                              ]
                            } else if (dominantEmotion === "fearful") {
                              recommendations = [
                                "Students may be anxious. Provide reassurance.",
                                "Break down complex topics into smaller steps.",
                                "Consider one-on-one check-ins after class.",
                              ]
                            } else if (dominantEmotion === "disgusted") {
                              recommendations = [
                                "Students may be having a negative reaction to the material.",
                                "Consider changing topics or approach.",
                                "Ask for feedback on what would help improve the class.",
                              ]
                            } else {
                              recommendations = [
                                "Monitor student engagement closely.",
                                "Try different teaching approaches to gauge response.",
                                "Consider asking for direct feedback.",
                              ]
                            }

                            return (
                              <ul style={{ margin: "0", paddingLeft: "20px" }}>
                                {recommendations.map((rec, index) => (
                                  <li key={index} style={{ fontSize: "13px", marginBottom: "6px" }}>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            )
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
