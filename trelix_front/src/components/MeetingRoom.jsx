"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"

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
  
  // Mock emotions for testing when webcam is not available
  const mockEmotions = ["happy", "sad", "angry", "surprised", "neutral", "fearful", "disgusted"]

  const fetchEmotion = async (retryCount = 0) => {
    if (!autoDetectActive) return
    
    setLoading(true)
    setError(null)

    try {
      // If in mock mode, return a random emotion
      if (mockMode) {
        const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)]
        handleEmotionDetected(randomEmotion)
        return
      }
      
      const response = await axios.get("http://127.0.0.1:8001/api/emotion")
      console.log("API Response:", response.data)
      
      // Check if the API returned an errorcd
      if (response.data.error) {
        if (response.data.error === 'Failed to access webcam') {
          setWebcamError(true)
          setError("Failed to access webcam. Please check your camera permissions.")
          
          // If we have fewer than 3 retries, try again after a delay
          if (retryCount < 3) {
            const retryDelay = 2000 * (retryCount + 1) // Exponential backoff
            console.log(`Retrying webcam access in ${retryDelay/1000} seconds...`)
            
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
        }
        return
      }
      
      // Reset webcam error state if we successfully get a response
      if (webcamError) {
        setWebcamError(false)
      }
      
      // If we have an emotion property, use it
      if (response.data.emotion) {
        handleEmotionDetected(response.data.emotion)
      } else {
        setError("No emotion detected in API response")
      }
    } catch (err) {
      setError(`Error fetching emotion data: ${err.message}`)
      console.error("Emotion detection error:", err)
    } finally {
      setLoading(false)
    }
  }
  
  // Helper function to handle detected emotions
  const handleEmotionDetected = (detectedEmotion) => {
    setEmotion(detectedEmotion)
    
    // Update emotion statistics
    setEmotionStats(prevStats => {
      const newStats = { ...prevStats }
      newStats[detectedEmotion] = (newStats[detectedEmotion] || 0) + 1
      return newStats
    })
    
    setLoading(false)
  }

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
  Object.keys(emotionStats).forEach(emotion => {
    emotionPercentages[emotion] = ((emotionStats[emotion] / totalDetections) * 100).toFixed(1)
  })

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://meet.jit.si/external_api.js" // Jitsi Meet API
    script.onload = () => {
      const domain = "meet.jit.si"
      const options = {
        roomName: roomId,
        width: "100%",
        height: "100%",
        parentNode: videoContainerRef.current,
        configOverwrite: { startWithAudioMuted: true },
        interfaceConfigOverwrite: { filmStripOnly: false },
      }
      const api = new window.JitsiMeetExternalAPI(domain, options)
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
    }
  }, [roomId])

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
          maxWidth: "350px",
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
            {autoDetectActive ? "Stop Auto Detection" : "Start Auto Detection"}
          </button>
          
          {webcamError && (
            <button
              onClick={() => setMockMode(!mockMode)}
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
          )}
        </div>
        
        {/* Detection Interval Settings */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
            Detection Interval: {detectionInterval} seconds
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {[15, 30, 60].map(seconds => (
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
          <div style={{ 
            backgroundColor: "#fff5f5", 
            padding: "10px", 
            borderRadius: "6px", 
            marginBottom: "10px",
            border: "1px solid #ffc9c9"
          }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "500", color: "#e03131" }}>
              Webcam Access Error
            </p>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px" }}>
              The emotion detection API cannot access your webcam. Please check your camera permissions.
            </p>
            <p style={{ margin: "0", fontSize: "13px" }}>
              You can enable mock mode to test with simulated emotions.
            </p>
          </div>
        )}
        
        {error && !webcamError && (
          <div style={{ fontSize: "14px", color: "#e03131", margin: "5px 0", padding: "8px", backgroundColor: "#fff5f5", borderRadius: "4px" }}>
            <p style={{ margin: "0" }}>{error}</p>
          </div>
        )}
        
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
              <strong>Current Emotion:</strong> {emotion} {mockMode && "(Mock)"}
            </p>
          </div>
        )}
        
        {/* Current Statistics */}
        {Object.keys(emotionStats).length > 0 && (
          <div style={{ marginTop: "15px" }}>
            <h4 style={{ fontSize: "14px", margin: "0 0 8px 0" }}>Current Session Stats:</h4>
            <div style={{ 
              maxHeight: "150px", 
              overflowY: "auto", 
              backgroundColor: "#f8f9fa", 
              borderRadius: "6px", 
              padding: "8px" 
            }}>
              {Object.keys(emotionStats).map(emotion => (
                <div key={emotion} style={{ marginBottom: "8px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{emotion}:</span>
                    <span>{emotionStats[emotion]} ({emotionPercentages[emotion]}%)</span>
                  </div>
                  <div style={{ 
                    height: "6px", 
                    backgroundColor: "#dee2e6", 
                    borderRadius: "3px", 
                    marginTop: "3px" 
                  }}>
                    <div style={{ 
                      width: `${emotionPercentages[emotion]}%`, 
                      height: "100%", 
                      backgroundColor: getEmotionColor(emotion),
                      borderRadius: "3px"
                    }} />
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
                {Object.keys(emotionStats).map(emotion => (
                  <div key={emotion} style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <strong>{emotion || "undefined"}:</strong> 
                      <span>{emotionStats[emotion]} times ({emotionPercentages[emotion]}%)</span>
                    </div>
                    <div style={{ 
                      height: "20px", 
                      backgroundColor: "#e9ecef", 
                      borderRadius: "4px", 
                      overflow: "hidden" 
                    }}>
                      <div style={{ 
                        width: `${emotionPercentages[emotion]}%`, 
                        height: "100%", 
                        backgroundColor: getEmotionColor(emotion),
                        transition: "width 0.5s ease-in-out"
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No emotions detected yet.</p>
            )}
            
            <p style={{ marginTop: "20px", textAlign: "center" }}>
              Redirecting to home in a few seconds...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to get color for each emotion
function getEmotionColor(emotion) {
  const colors = {
    happy: "#40c057",    // Green
    sad: "#4dabf7",      // Blue
    angry: "#fa5252",    // Red
    surprised: "#fab005", // Yellow
    neutral: "#868e96",  // Gray
    fearful: "#be4bdb",  // Purple
    disgusted: "#fd7e14", // Orange
  }
  
  return colors[emotion.toLowerCase()] || "#4dabf7" // Default to blue if emotion not found
}