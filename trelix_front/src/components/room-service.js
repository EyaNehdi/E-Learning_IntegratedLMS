/**
 * Room service using localStorage and sessionStorage for cross-browser communication
 */

const RoomService = {
  // Helper function to generate a unique ID
  generateUniqueId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Create a new room
  createRoom: (roomId, instructorId, instructorName) => {
    try {
      // Create a unique room key that will be used by all browsers
      const globalRoomKey = `global_room_${roomId}`

      // Check if room already exists in this browser's localStorage
      const existingRoom = localStorage.getItem(globalRoomKey)

      if (existingRoom) {
        // Check if this is a placeholder room
        const roomData = JSON.parse(existingRoom)

        if (roomData.isPlaceholder) {
          console.log(`Found placeholder room ${roomId}, replacing with real room data`)
          // This is a placeholder, so we can replace it with real data
        } else {
          console.log(`Room ${roomId} already exists`)
          return { success: false, error: "Room already exists" }
        }
      }

      // Create the room
      const roomData = {
        roomId,
        instructorId,
        instructorName,
        createdAt: new Date().toISOString(),
        isPlaceholder: false,
        emotions: {},
        lastUpdated: Date.now(),
      }

      // Store in localStorage using the global key
      localStorage.setItem(globalRoomKey, JSON.stringify(roomData))

      // Also store in regular key for backward compatibility
      localStorage.setItem(`room_${roomId}`, JSON.stringify(roomData))

      console.log(`Room ${roomId} created by instructor ${instructorName}`)

      // Also create a heartbeat entry for this room
      RoomService.updateRoomHeartbeat(roomId)

      return { success: true }
    } catch (e) {
      console.error("Error creating room:", e)
      return { success: false, error: e.message }
    }
  },

  // Check if a room exists
  roomExists: (roomId) => {
    try {
      // First check with the global key
      const globalRoomKey = `global_room_${roomId}`
      const globalRoom = localStorage.getItem(globalRoomKey)

      if (globalRoom !== null) {
        return true
      }

      // Then check with the regular key for backward compatibility
      const localRoom = localStorage.getItem(`room_${roomId}`)
      if (localRoom !== null) {
        return true
      }

      // If not found in local storage, we'll still try to join
      console.log(`Room ${roomId} not found in local storage, but will attempt to join anyway`)
      return true
    } catch (e) {
      console.error("Error checking room existence:", e)
      return false
    }
  },

  // Get room info
  getRoomInfo: (roomId) => {
    try {
      const globalRoomKey = `global_room_${roomId}`
      const globalRoomData = localStorage.getItem(globalRoomKey)

      if (globalRoomData) {
        return JSON.parse(globalRoomData)
      }

      // Check regular key for backward compatibility
      const roomData = localStorage.getItem(`room_${roomId}`)

      if (roomData) {
        // If found in regular key but not global, upgrade it to global
        const parsedData = JSON.parse(roomData)
        localStorage.setItem(globalRoomKey, roomData)
        return parsedData
      } else {
        // If room data isn't found, create a placeholder with minimal required info
        console.log(`Creating placeholder room info for ${roomId}`)
        const placeholderRoom = {
          roomId,
          instructorId: "unknown_instructor",
          instructorName: "Instructor",
          createdAt: new Date().toISOString(),
          isPlaceholder: true,
          emotions: {},
          lastUpdated: Date.now(),
        }

        // Save the placeholder to both keys
        localStorage.setItem(globalRoomKey, JSON.stringify(placeholderRoom))
        localStorage.setItem(`room_${roomId}`, JSON.stringify(placeholderRoom))

        return placeholderRoom
      }
    } catch (e) {
      console.error("Error getting room info:", e)
      return null
    }
  },

  // Update the room heartbeat
  updateRoomHeartbeat: (roomId) => {
    try {
      const heartbeatKey = `heartbeat_room_${roomId}`
      localStorage.setItem(heartbeatKey, Date.now().toString())
    } catch (e) {
      console.error("Error updating room heartbeat:", e)
    }
  },

  // Send emotion from student to instructor
  sendEmotion: (roomId, studentId, studentName, instructorId, emotion) => {
    try {
      // Generate a unique broadcast ID for this emotion
      const broadcastId = RoomService.generateUniqueId()
      const timestamp = new Date().toISOString()

      // Create the emotion data
      const emotionData = {
        id: studentId,
        name: studentName,
        emotion: emotion,
        timestamp: timestamp,
        instructorId: instructorId,
        broadcastId: broadcastId,
      }

      // Store in a global emotion key that all browsers can access
      const globalEmotionKey = `global_emotion_${roomId}_${studentId}`
      localStorage.setItem(globalEmotionKey, JSON.stringify(emotionData))

      // Create a broadcast message
      const broadcastKey = `broadcast_${broadcastId}`
      const broadcastData = {
        type: "emotion",
        roomId: roomId,
        studentId: studentId,
        studentName: studentName,
        emotion: emotion,
        instructorId: instructorId,
        timestamp: timestamp,
        broadcastId: broadcastId,
        expires: Date.now() + 60000, // Expire after 1 minute
      }

      // Store the broadcast
      localStorage.setItem(broadcastKey, JSON.stringify(broadcastData))

      console.log(`Student ${studentName} sent emotion ${emotion} to instructor (broadcast ID: ${broadcastId})`)

      // Update the global room data too
      const globalRoomKey = `global_room_${roomId}`
      const roomDataStr = localStorage.getItem(globalRoomKey)

      if (roomDataStr) {
        try {
          const roomData = JSON.parse(roomDataStr)

          if (!roomData.emotions) {
            roomData.emotions = {}
          }

          roomData.emotions[studentId] = emotionData
          roomData.lastUpdated = Date.now()

          localStorage.setItem(globalRoomKey, JSON.stringify(roomData))
        } catch (e) {
          console.error("Error updating room data with emotion:", e)
        }
      }

      // Clean up old broadcasts (those older than 1 minute)
      RoomService.cleanupOldBroadcasts()

      return { success: true, broadcastId: broadcastId }
    } catch (e) {
      console.error("Error sending emotion:", e)
      return { success: false, error: e.message }
    }
  },

  // Clean up old broadcast messages
  cleanupOldBroadcasts: () => {
    try {
      const now = Date.now()
      const keysToRemove = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("broadcast_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key))
            if (data.expires && data.expires < now) {
              keysToRemove.push(key)
            }
          } catch (e) {
            // If we can't parse it, it's probably corrupted, so remove it
            keysToRemove.push(key)
          }
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key))
    } catch (e) {
      console.error("Error cleaning up old broadcasts:", e)
    }
  },

  // Get all student emotions for a specific instructor
  getStudentEmotions: (roomId, instructorId) => {
    try {
      const emotions = {}

      // First, check the global room data
      const globalRoomKey = `global_room_${roomId}`
      const roomDataStr = localStorage.getItem(globalRoomKey)

      if (roomDataStr) {
        try {
          const roomData = JSON.parse(roomDataStr)
          if (roomData.emotions) {
            // Filter emotions for this instructor
            Object.keys(roomData.emotions).forEach((studentId) => {
              const emotion = roomData.emotions[studentId]
              if (emotion.instructorId === instructorId) {
                emotions[studentId] = emotion
              }
            })
          }
        } catch (e) {
          console.error("Error parsing room data for emotions:", e)
        }
      }

      // Then check for any direct emotion entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(`global_emotion_${roomId}_`)) {
          try {
            const emotionData = JSON.parse(localStorage.getItem(key))
            if (emotionData && emotionData.instructorId === instructorId) {
              emotions[emotionData.id] = emotionData
            }
          } catch (e) {
            console.warn("Error parsing emotion data:", e)
          }
        }
      }

      // Finally, check for any recent broadcasts
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("broadcast_")) {
          try {
            const broadcastData = JSON.parse(localStorage.getItem(key))
            if (
              broadcastData &&
              broadcastData.type === "emotion" &&
              broadcastData.roomId === roomId &&
              broadcastData.instructorId === instructorId
            ) {
              emotions[broadcastData.studentId] = {
                id: broadcastData.studentId,
                name: broadcastData.studentName,
                emotion: broadcastData.emotion,
                timestamp: broadcastData.timestamp,
                instructorId: broadcastData.instructorId,
                broadcastId: broadcastData.broadcastId,
              }
            }
          } catch (e) {
            console.warn("Error parsing broadcast data:", e)
          }
        }
      }

      return emotions
    } catch (e) {
      console.error("Error getting student emotions:", e)
      return {}
    }
  },

  // Set up a broadcast listener
  setupBroadcastListener: (callback) => {
    const handleStorageChange = (event) => {
      // This will only fire for changes in other tabs of the same browser
      // but we'll keep it for tab-to-tab communication
      if (event.key && event.key.startsWith("broadcast_") && event.newValue) {
        try {
          const broadcastData = JSON.parse(event.newValue)
          if (callback && broadcastData) {
            callback(broadcastData)
          }
        } catch (e) {
          console.warn("Error handling storage event:", e)
        }
      }
    }

    // Add storage event listener
    window.addEventListener("storage", handleStorageChange)

    // Set up polling for broadcast messages
    const pollInterval = 2000 // Poll every 2 seconds
    const intervalId = setInterval(() => {
      RoomService.pollForBroadcasts(callback)
    }, pollInterval)

    // Return cleanup function
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(intervalId)
    }
  },

  // Poll for broadcast messages
  pollForBroadcasts: (callback) => {
    try {
      // This is needed for cross-browser communication
      const processed = new Set()

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("broadcast_")) {
          try {
            const broadcastData = JSON.parse(localStorage.getItem(key))

            // Skip already processed broadcasts using an in-memory set
            if (processed.has(broadcastData.broadcastId)) {
              continue
            }

            // Mark as processed
            processed.add(broadcastData.broadcastId)

            // Call the callback
            if (callback && broadcastData) {
              callback(broadcastData)
            }
          } catch (e) {
            console.warn("Error processing broadcast while polling:", e)
          }
        }
      }

      // Clean up old broadcasts
      RoomService.cleanupOldBroadcasts()
    } catch (e) {
      console.error("Error polling for broadcasts:", e)
    }
  },

  // Clear all room data (useful for debugging and resetting)
  clearAllRoomData: () => {
    try {
      // Find all keys that might be related to rooms
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          (key.startsWith("room_") ||
            key.startsWith("global_room_") ||
            key.startsWith("emotion_") ||
            key.startsWith("global_emotion_") ||
            key.startsWith("broadcast_") ||
            key.startsWith("heartbeat_"))
        ) {
          keysToRemove.push(key)
        }
      }

      // Remove all found keys
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      console.log(`Cleared ${keysToRemove.length} room-related items from storage`)
      return { success: true, count: keysToRemove.length }
    } catch (e) {
      console.error("Error clearing room data:", e)
      return { success: false, error: e.message }
    }
  },

  // For debugging - list all rooms
  listAllRooms: () => {
    try {
      const rooms = []

      // Check for global room keys first
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("global_room_")) {
          const roomId = key.replace("global_room_", "")
          try {
            const roomData = JSON.parse(localStorage.getItem(key))
            rooms.push({
              roomId,
              ...roomData,
              keyType: "global",
            })
          } catch (e) {
            console.warn(`Error parsing room data for key ${key}:`, e)
          }
        }
      }

      // Then check legacy room keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("room_")) {
          const roomId = key.replace("room_", "")

          // Skip if we already found this room in the global keys
          if (rooms.some((r) => r.roomId === roomId && r.keyType === "global")) {
            continue
          }

          try {
            const roomData = JSON.parse(localStorage.getItem(key))
            rooms.push({
              roomId,
              ...roomData,
              keyType: "legacy",
            })
          } catch (e) {
            console.warn(`Error parsing room data for key ${key}:`, e)
          }
        }
      }

      return rooms
    } catch (e) {
      console.error("Error listing rooms:", e)
      return []
    }
  },
}

export default RoomService
