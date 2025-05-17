/**
 * Room service using localStorage for cross-tab communication
 */

const RoomService = {
  // Create a new room
  createRoom: (roomId, instructorId, instructorName) => {
    try {
      // Check if room already exists
      const existingRoom = localStorage.getItem(`room_${roomId}`)
      if (existingRoom) {
        console.log(`Room ${roomId} already exists`)
        return { success: false, error: "Room already exists" }
      }

      // Create the room
      const roomData = {
        instructorId,
        instructorName,
        createdAt: new Date().toISOString(),
      }

      // Store in localStorage
      localStorage.setItem(`room_${roomId}`, JSON.stringify(roomData))

      console.log(`Room ${roomId} created by instructor ${instructorName}`)
      return { success: true }
    } catch (e) {
      console.error("Error creating room:", e)
      return { success: false, error: e.message }
    }
  },

  // Check if a room exists
  roomExists: (roomId) => {
    try {
      return localStorage.getItem(`room_${roomId}`) !== null
    } catch (e) {
      console.error("Error checking room existence:", e)
      return false
    }
  },

  // Get room info
  getRoomInfo: (roomId) => {
    try {
      const roomData = localStorage.getItem(`room_${roomId}`)
      return roomData ? JSON.parse(roomData) : null
    } catch (e) {
      console.error("Error getting room info:", e)
      return null
    }
  },

  // Send emotion from student to instructor
  sendEmotion: (roomId, studentId, studentName, instructorId, emotion) => {
    try {
      // Get existing emotions for this room
      let roomEmotions = {}
      const storedEmotions = localStorage.getItem(`emotions_${roomId}`)
      if (storedEmotions) {
        roomEmotions = JSON.parse(storedEmotions)
      }

      // Add/update this student's emotion
      roomEmotions[studentId] = {
        id: studentId,
        name: studentName,
        emotion: emotion,
        timestamp: new Date().toISOString(),
        instructorId: instructorId,
      }

      // Store back in localStorage
      localStorage.setItem(`emotions_${roomId}`, JSON.stringify(roomEmotions))
      console.log(`Student ${studentName} sent emotion ${emotion} to instructor`)
      return { success: true }
    } catch (e) {
      console.error("Error sending emotion:", e)
      return { success: false, error: e.message }
    }
  },

  // Get all student emotions for a specific instructor
  getStudentEmotions: (roomId, instructorId) => {
    try {
      const storedEmotions = localStorage.getItem(`emotions_${roomId}`)
      if (!storedEmotions) {
        return {}
      }

      const allEmotions = JSON.parse(storedEmotions)

      // Filter emotions for this instructor
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
      localStorage.removeItem(`emotions_${roomId}`)
    } catch (e) {
      console.error("Error clearing emotions:", e)
    }
  },

  // For debugging - list all rooms
  listAllRooms: () => {
    try {
      const rooms = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("room_")) {
          const roomId = key.replace("room_", "")
          const roomData = JSON.parse(localStorage.getItem(key))
          rooms.push({
            roomId,
            ...roomData,
          })
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
