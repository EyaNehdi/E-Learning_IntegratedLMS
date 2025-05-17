"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"

// Direct communication system between students and instructors
const EMOTION_MESSENGER = {
  // Send emotion from student to instructor
  sendEmotion: (roomId, studentId, studentName, instructorId, emotion) => {
    try {
      // Get existing emotions for this room
      let roomEmotions = {}
      try {
        const storedEmotions = localStorage.getItem(`room_${roomId}_emotions`)
        if (storedEmotions) {
          roomEmotions = JSON.parse(storedEmotions)
        }
      } catch (e) {
        console.error("Error loading emotions:", e)
      }

      // Add/update this student's emotion
      roomEmotions[studentId] = {
        id: studentId,
        name: studentName,
        emotion: emotion,
        timestamp: new Date().toISOString(),
        instructorId: instructorId, // Track which instructor this is for
      }

      // Store back in localStorage
      localStorage.setItem(`room_${roomId}_emotions`, JSON.stringify(roomEmotions))
      console.log(`Student ${studentName} (${studentId}) sent emotion ${emotion} to instructor ${instructorId}`)
      return true
    } catch (e) {
      console.error("Error sending emotion:", e)
      return false
    }
  },

  // Get all student emotions for a specific instructor
  getStudentEmotions: (roomId, instructorId) => {
    try {
      // Get all emotions for this room
      const storedEmotions = localStorage.getItem(`room_${roomId}_emotions`)
      if (!storedEmotions) return {}

      const allEmotions = JSON.parse(storedEmotions)

      // Filter to only include emotions for this instructor
      const instructorEmotions = {}
      Object.keys(allEmotions).forEach((studentId) => {
        const emotion = allEmotions[studentId]
        if (emotion.instructorId === instructorId) {
          instructorEmotions[studentId] = emotion
        }
      })

      return instructorEmotions
    } catch (e) {
      console.error("Error getting emotions:", e)
      return {}
    }
  },

  // Clear emotions for a room
  clearRoomEmotions: (roomId) => {
    try {
      localStorage.removeItem(`room_${roomId}_emotions`)
    } catch (e) {
      console.error("Error clearing emotions:", e)
    }
  },
}

export default function MeetingRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const videoContainerRef = useRef(null)
  const [emotion, setEmotion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [autoDetectActive, setAutoDetectActive] = useState(true)
  const [emotionStats, setEmotionStats] = useState({})
  const [showStats, setShowStats] = useState(false)
  const [webcamError, setWebcamError] = useState(false)
  const [mockMode, setMockMode] = useState(false)
  const [detectionInterval, setDetectionInterval] = useState(30) // Default to 30 seconds
  const intervalRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const jitsiApiRef = useRef(null)
  const pollingRef = useRef(null)

  // User identification - now loaded from localStorage
  const [isHost, setIsHost] = useState(false)
  const [userId, setUserId] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [instructorId, setInstructorId] = useState("")
  const [participantEmotions, setParticipantEmotions] = useState({})

  // For debugging - to see if messages are being sent/received
  const [debugMessages, setDebugMessages] = useState([])
  const [showDebug, setShowDebug] = useState(false)

  // Load user data from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    const storedDisplayName = localStorage.getItem("displayName") || "Participant"
    const storedIsHost = localStorage.getItem("isHost") === "true"
    const storedInstructorId = localStorage.getItem("instructorId")

    setUserId(storedUserId || "")
    setDisplayName(storedDisplayName)
    setIsHost(storedIsHost)

    if (storedIsHost) {
      // If we're the host, our ID is the instructor ID
      setInstructorId(storedUserId)
    } else {
      // If we're a student, use the stored instructor ID
      setInstructorId(storedInstructorId || "")
    }

    addDebugMessage(
      `Loaded user data - ID: ${storedUserId?.substring(0, 8)}..., Role: ${storedIsHost ? "Instructor" : "Student"}`,
    )
    if (!storedIsHost && storedInstructorId) {
      addDebugMessage(`Instructor ID: ${storedInstructorId.substring(0, 8)}...`)
    }
  }, [])

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
      // Keep only the last 20 messages
      if (newMessages.length > 20) {
        return newMessages.slice(newMessages.length - 20)
      }
      return newMessages
    })
  }

  // Mock data for testing when no students are connected
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
        student3: {
          id: "student3",
          name: "Alex Johnson",
          emotion: "sad",
          timestamp: new Date().toISOString(),
          instructorId: userId,
        },
        student4: {
          id: "student4",
          name: "Sarah Williams",
          emotion: "surprised",
          timestamp: new Date().toISOString(),
          instructorId: userId,
        },
      }
      setParticipantEmotions(mockStudents)
      addDebugMessage("Added mock student data for testing")
    }
  }

  // Function to fetch emotion from the API
  const fetchEmotion = async (retryCount = 0) => {
    if (!autoDetectActive) return

    setLoading(true)
    setError(null)

    try {
      // If in mock mode, generate random emotions
      if (mockMode) {
        const emotions = ["happy", "sad", "angry", "surprised", "neutral", "fearful", "disgusted"]
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
      addDebugMessage(`API Response: ${JSON.stringify(response.data)}`)

      // Check if the API returned an error
      if (response.data.error) {
        if (response.data.error === "Failed to access webcam") {
          setWebcamError(true)
          setError("Failed to access webcam. Please check your camera permissions.")
          addDebugMessage("Webcam access error")

          // If we have fewer than 3 retries, try again after a delay
          if (retryCount < 3) {
            const retryDelay = 2000 * (retryCount + 1) // Exponential backoff
            console.log(`Retrying webcam access in ${retryDelay / 1000} seconds...`)

            // Clear any existing retry timeout
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current)
            }

            // Set a new retry timeout
            retryTimeoutRef.current = setTimeout(() => {
              fetchEmotion(retryCount + 1)
            }, retryDelay)
          }
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
      // Send emotion directly to the instructor using our messenger system
      EMOTION_MESSENGER.sendEmotion(roomId, userId, displayName, instructorId, detectedEmotion)
      addDebugMessage(`Sent emotion to instructor ${instructorId.substring(0, 8)}...: ${detectedEmotion}`)
    }
  }

  // Poll for student emotions (for instructors)
  useEffect(() => {
    if (!isHost || !roomId || !userId) return

    addDebugMessage(`Starting to poll for student emotions as instructor ${userId.substring(0, 8)}...`)

    const pollEmotions = () => {
      try {
        const studentEmotions = EMOTION_MESSENGER.getStudentEmotions(roomId, userId)

        // Update our state with the student emotions
        if (Object.keys(studentEmotions).length > 0) {
          setParticipantEmotions(studentEmotions)
          addDebugMessage(`Retrieved ${Object.keys(studentEmotions).length} student emotions`)
        }
      } catch (err) {
        console.error("Error polling student emotions:", err)
      }
    }

    // Poll every 2 seconds
    pollEmotions() // Initial poll
    pollingRef.current = setInterval(pollEmotions, 2000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [isHost, roomId, userId])

  // Start automatic emotion detection
  useEffect(() => {
    if (autoDetectActive) {
      // Initial detection
      fetchEmotion()

      // Set up interval for detection
      intervalRef.current = setInterval(fetchEmotion, detectionInterval * 1000)
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
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
      intervalRef.current = setInterval(fetchEmotion, seconds * 1000)
    }
  }

  const goToHome = () => {
    // Stop automatic detection
    setAutoDetectActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    // Show statistics before navigating
    setShowStats(true)

    // Delay navigation to show stats
    setTimeout(() => {
      navigate("/")
    }, 5000) // Show stats for 5 seconds before navigating
  }

  // Calculate total detections and percentages
  const totalDetections = Object.values(emotionStats).reduce((sum, count) => sum + count, 0) || 1
  const emotionPercentages = {}
  Object.keys(emotionStats).forEach((emotion) => {
    emotionPercentages[emotion] = ((emotionStats[emotion] / totalDetections) * 100).toFixed(1)
  })

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://meet.jit.si/external_api.js" // Jitsi Meet API
    script.async = true

    script.onload = () => {
      const domain = "meet.jit.si"
      const options = {
        roomName: roomId,
        width: "100%",
        height: "100%",
        parentNode: videoContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          filmStripOnly: false,
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "closedcaptions",
            "desktop",
            "fullscreen",
            "fodeviceselection",
            "hangup",
            "profile",
            "chat",
            "recording",
            "livestreaming",
            "etherpad",
            "sharedvideo",
            "settings",
            "raisehand",
            "videoquality",
            "filmstrip",
            "invite",
            "feedback",
            "stats",
            "shortcuts",
            "tileview",
            "videobackgroundblur",
            "download",
            "help",
            "mute-everyone",
            "security",
          ],
        },
        userInfo: {
          displayName: displayName,
          email: isHost ? "host@example.com" : "student@example.com",
        },
      }

      // Initialize the Jitsi Meet API
      const api = new window.JitsiMeetExternalAPI(domain, options)
      jitsiApiRef.current = api

      // Set up event listeners
      api.addEventListeners({
        // When we join the conference
        videoConferenceJoined: (event) => {
          console.log("I joined the conference!", event)
          addDebugMessage(`Joined conference with ID: ${event.id}`)

          // If we're the host, set a special display name to identify us
          if (isHost) {
            api.executeCommand("displayName", `${displayName} (Instructor)`)
          }
        },

        // Handle display name changes
        displayNameChange: (event) => {
          console.log("Display name changed:", event)
          addDebugMessage(`Display name changed to: ${event.displayname}`)

          // Update our local state
          setDisplayName(event.displayname)
        },
      })
    }

    document.body.appendChild(script)

    // Cleanup function
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose()
      }
    }
  }, [roomId, displayName, isHost])

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <div ref={videoContainerRef} style={{ height: "100%", width: "100%" }} />

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
            transition: "background-color 0.3s ease, transform 0.2s ease",
            width: "150px",
            height: "50px",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#1a4971")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#2b6cb0")}
        >
          Return to Home
        </button>
      </div>

      {/* User ID Display (for debugging) */}
      {showDebug && (
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "20px",
            zIndex: 1000,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          {isHost ? "Instructor" : "Student"} ID: {userId.substring(0, 8)}...
          {!isHost && instructorId && <div>Instructor ID: {instructorId.substring(0, 8)}...</div>}
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
          maxWidth: isHost ? "450px" : "350px",
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
            {autoDetectActive ? "Stop Auto Detection" : "Start Auto Detection"}
          </button>

          <button
            onClick={() => {
              setMockMode(!mockMode)
              if (!mockMode && isHost) {
                // Add mock data when enabling mock mode as host
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
            {mockMode ? "Mock Mode: ON" : "Use Mock Data"}
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
            <p style={{ margin: "0 0 8px 0", fontSize: "13px" }}>
              The emotion detection API cannot access your webcam. Please check your camera permissions.
            </p>
            <p style={{ margin: "0", fontSize: "13px" }}>You can enable mock mode to test with simulated emotions.</p>
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
              Student Emotions Dashboard
            </h4>

            {Object.keys(participantEmotions).length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  color: "#495057",
                }}
              >
                <p style={{ margin: "0", fontSize: "14px" }}>
                  No students have joined yet or no emotion data available.
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: "13px" }}>
                  Students' emotions will appear here once they join and their emotions are detected.
                </p>
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
                        transition: "all 0.3s ease",
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
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            Last update:{" "}
                            {participant.timestamp
                              ? new Date(participant.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
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

                      <div
                        style={{
                          fontSize: "12px",
                          marginTop: "8px",
                          fontStyle: "italic",
                          color: "#495057",
                          lineHeight: "1.3",
                        }}
                      >
                        {getEmotionFeedback(participant.emotion)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Class Engagement Summary */}
            {Object.keys(participantEmotions).length > 0 && (
              <div style={{ marginTop: "15px" }}>
                <h4 style={{ fontSize: "14px", margin: "0 0 8px 0", fontWeight: "600" }}>Class Engagement Summary:</h4>
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "6px",
                    padding: "10px",
                  }}
                >
                  {getClassEngagementSummary(participantEmotions)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Statistics */}
        {Object.keys(emotionStats).length > 0 && (
          <div style={{ marginTop: "15px" }}>
            <h4 style={{ fontSize: "14px", margin: "0 0 8px 0" }}>Your Session Stats:</h4>
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
                padding: "8px",
              }}
            >
              {Object.keys(emotionStats).map((emotion) => (
                <div key={emotion} style={{ marginBottom: "8px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{emotion}:</span>
                    <span>
                      {emotionStats[emotion]} ({emotionPercentages[emotion]}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      backgroundColor: "#dee2e6",
                      borderRadius: "3px",
                      marginTop: "3px",
                    }}
                  >
                    <div
                      style={{
                        width: `${emotionPercentages[emotion]}%`,
                        height: "100%",
                        backgroundColor: getEmotionColor(emotion),
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Statistics Modal */}
      {showStats && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "15px",
              maxWidth: "500px",
              width: "90%",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Emotion Detection Statistics</h2>
            <p>Total detections: {totalDetections}</p>

            {Object.keys(emotionStats).length > 0 ? (
              <div>
                {Object.keys(emotionStats).map((emotion) => (
                  <div key={emotion} style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <strong>{emotion || "undefined"}:</strong>
                      <span>
                        {emotionStats[emotion]} times ({emotionPercentages[emotion]}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: "20px",
                        backgroundColor: "#e9ecef",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${emotionPercentages[emotion]}%`,
                          height: "100%",
                          backgroundColor: getEmotionColor(emotion),
                          transition: "width 0.5s ease-in-out",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No emotions detected yet.</p>
            )}

            <p style={{ marginTop: "20px", textAlign: "center" }}>Redirecting to home in a few seconds...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to get color for each emotion
function getEmotionColor(emotion) {
  const colors = {
    happy: "#40c057", // Green
    sad: "#4dabf7", // Blue
    angry: "#fa5252", // Red
    surprised: "#fab005", // Yellow
    neutral: "#868e96", // Gray
    fearful: "#be4bdb", // Purple
    disgusted: "#fd7e14", // Orange
    unknown: "#adb5bd", // Light Gray
  }

  return colors[emotion?.toLowerCase()] || "#adb5bd" // Default to light gray if emotion not found
}

// Helper function to get background color for emotion cards
function getEmotionBackgroundColor(emotion) {
  const colors = {
    happy: "#ebfbee", // Light Green
    sad: "#e7f5ff", // Light Blue
    angry: "#fff5f5", // Light Red
    surprised: "#fff9db", // Light Yellow
    neutral: "#f8f9fa", // Light Gray
    fearful: "#f3f0ff", // Light Purple
    disgusted: "#fff4e6", // Light Orange
    unknown: "#f8f9fa", // Light Gray
  }

  return colors[emotion?.toLowerCase()] || "#f8f9fa" // Default to light gray if emotion not found
}

// Helper function to get text color for emotion cards
function getEmotionTextColor(emotion) {
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

// Helper function to get border color for emotion cards
function getEmotionBorderColor(emotion) {
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

// Helper function to get feedback based on emotion
function getEmotionFeedback(emotion) {
  if (!emotion) return null

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

// Helper function to generate class engagement summary
function getClassEngagementSummary(participants) {
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
        <div>No emotion data: {students.length - totalWithEmotions}</div>
      </div>
    </div>
  )
}
