import { supabase } from "./utils/supabase-client"

/**
 * Room service using Supabase for cross-browser communication
 */
const RoomServiceSupabase = {
  // Helper function to generate a unique ID
  generateUniqueId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Create a new room
  createRoom: async (roomId, instructorId, instructorName) => {
    try {
      // Check if room already exists
      const { data: existingRoom } = await supabase.from("rooms").select("*").eq("room_id", roomId).single()

      if (existingRoom) {
        if (existingRoom.is_placeholder) {
          console.log(`Found placeholder room ${roomId}, replacing with real room data`)
          // This is a placeholder, so we can update it with real data
          const { error } = await supabase
            .from("rooms")
            .update({
              instructor_id: instructorId,
              instructor_name: instructorName,
              is_placeholder: false,
              last_updated: new Date().toISOString(),
            })
            .eq("room_id", roomId)

          if (error) throw error
        } else {
          console.log(`Room ${roomId} already exists`)
          return { success: false, error: "Room already exists" }
        }
      } else {
        // Create the room
        const { error } = await supabase.from("rooms").insert({
          room_id: roomId,
          instructor_id: instructorId,
          instructor_name: instructorName,
          is_placeholder: false,
          last_updated: new Date().toISOString(),
        })

        if (error) throw error
      }

      console.log(`Room ${roomId} created by instructor ${instructorName}`)

      // Also create a heartbeat entry for this room
      await RoomServiceSupabase.updateRoomHeartbeat(roomId)

      return { success: true }
    } catch (e) {
      console.error("Error creating room:", e)
      return { success: false, error: e.message }
    }
  },

  // Check if a room exists
  roomExists: async (roomId) => {
    try {
      const { data, error } = await supabase.from("rooms").select("room_id").eq("room_id", roomId).single()

      if (error) {
        // If not found in database, we'll still try to join
        console.log(`Room ${roomId} not found in database, but will attempt to join anyway`)
        return true
      }

      return !!data
    } catch (e) {
      console.error("Error checking room existence:", e)
      return false
    }
  },

  // Get room info
  getRoomInfo: async (roomId) => {
    try {
      const { data, error } = await supabase.from("rooms").select("*").eq("room_id", roomId).single()

      if (error || !data) {
        // If room data isn't found, create a placeholder with minimal required info
        console.log(`Creating placeholder room info for ${roomId}`)
        const placeholderRoom = {
          room_id: roomId,
          instructor_id: "unknown_instructor",
          instructor_name: "Instructor",
          created_at: new Date().toISOString(),
          is_placeholder: true,
          last_updated: new Date().toISOString(),
        }

        // Save the placeholder
        await supabase.from("rooms").insert(placeholderRoom)

        return placeholderRoom
      }

      return data
    } catch (e) {
      console.error("Error getting room info:", e)
      return null
    }
  },

  // Update the room heartbeat
  updateRoomHeartbeat: async (roomId) => {
    try {
      const { error } = await supabase
        .from("rooms")
        .update({ last_updated: new Date().toISOString() })
        .eq("room_id", roomId)

      if (error) throw error
    } catch (e) {
      console.error("Error updating room heartbeat:", e)
    }
  },

  // Send emotion from student to instructor
  sendEmotion: async (roomId, studentId, studentName, instructorId, emotion) => {
    try {
      // Generate a unique broadcast ID for this emotion
      const broadcastId = RoomServiceSupabase.generateUniqueId()
      const timestamp = new Date().toISOString()

      // Create the emotion data
      const emotionData = {
        room_id: roomId,
        student_id: studentId,
        student_name: studentName,
        emotion: emotion,
        instructor_id: instructorId,
        broadcast_id: broadcastId,
        timestamp: timestamp,
      }

      console.log("Sending emotion data:", emotionData)

      // Check if an emotion already exists for this student in this room
      const { data: existingEmotion } = await supabase
        .from("emotions")
        .select("*")
        .eq("room_id", roomId)
        .eq("student_id", studentId)
        .single()

      if (existingEmotion) {
        // Update the existing emotion
        const { error } = await supabase
          .from("emotions")
          .update({
            emotion: emotion,
            broadcast_id: broadcastId,
            timestamp: timestamp,
          })
          .eq("room_id", roomId)
          .eq("student_id", studentId)

        if (error) throw error
      } else {
        // Insert a new emotion
        const { error } = await supabase.from("emotions").insert(emotionData)

        if (error) throw error
      }

      console.log(`Student ${studentName} sent emotion ${emotion} to instructor (broadcast ID: ${broadcastId})`)

      // Update the room's last_updated timestamp
      await RoomServiceSupabase.updateRoomHeartbeat(roomId)

      return { success: true, broadcastId: broadcastId }
    } catch (e) {
      console.error("Error sending emotion:", e)
      return { success: false, error: e.message }
    }
  },

  // Get all student emotions for a specific instructor
  getStudentEmotions: async (roomId, instructorId) => {
    try {
      console.log(`Fetching emotions for room ${roomId} and instructor ${instructorId}`)

      const { data, error } = await supabase
        .from("emotions")
        .select("*")
        .eq("room_id", roomId)
        .eq("instructor_id", instructorId)

      if (error) throw error

      console.log(`Retrieved ${data?.length || 0} emotions from database:`, data)

      // Format the data to match the expected structure
      const emotions = {}
      if (data) {
        data.forEach((emotion) => {
          emotions[emotion.student_id] = {
            id: emotion.student_id,
            name: emotion.student_name,
            emotion: emotion.emotion,
            timestamp: emotion.timestamp,
            instructorId: emotion.instructor_id,
            broadcastId: emotion.broadcast_id,
          }
        })
      }

      return emotions
    } catch (e) {
      console.error("Error getting student emotions:", e)
      return {}
    }
  },

  // Set up a real-time subscription for emotion updates
  setupEmotionSubscription: (roomId, instructorId, callback) => {
    console.log(`Setting up real-time subscription for room ${roomId} and instructor ${instructorId}`)

    // First, fetch current emotions
    RoomServiceSupabase.getStudentEmotions(roomId, instructorId).then((emotions) => {
      if (callback && Object.keys(emotions).length > 0) {
        console.log(`Initial emotions loaded: ${Object.keys(emotions).length}`)
        callback(emotions)
      }
    })

    // Subscribe to changes in the emotions table for this room
    const channel = supabase
      .channel(`room-${roomId}-emotions`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emotions",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("Received real-time update:", payload)

          // When an emotion is updated, fetch all emotions for this instructor
          RoomServiceSupabase.getStudentEmotions(roomId, instructorId).then((emotions) => {
            console.log(`Fetched updated emotions: ${Object.keys(emotions).length}`)
            if (callback) {
              callback(emotions)
            }
          })
        },
      )
      .subscribe((status) => {
        console.log(`Subscription status for room ${roomId}:`, status)
      })

    // Set up a polling fallback in case real-time doesn't work
    const pollInterval = setInterval(() => {
      RoomServiceSupabase.getStudentEmotions(roomId, instructorId).then((emotions) => {
        if (callback && Object.keys(emotions).length > 0) {
          console.log(`Polled emotions: ${Object.keys(emotions).length}`)
          callback(emotions)
        }
      })
    }, 5000) // Poll every 5 seconds

    // Return a function to unsubscribe
    return () => {
      console.log(`Unsubscribing from room ${roomId} emotions`)
      channel.unsubscribe()
      clearInterval(pollInterval)
    }
  },

  // Clear all room data (useful for debugging and resetting)
  clearAllRoomData: async () => {
    try {
      // Delete all emotions first (due to foreign key constraint)
      const { error: emotionsError } = await supabase.from("emotions").delete().neq("room_id", "dummy_value") // Delete all rows

      if (emotionsError) throw emotionsError

      // Then delete all rooms
      const { error: roomsError } = await supabase.from("rooms").delete().neq("room_id", "dummy_value") // Delete all rows

      if (roomsError) throw roomsError

      console.log("Cleared all room-related data from database")
      return { success: true, count: "all" }
    } catch (e) {
      console.error("Error clearing room data:", e)
      return { success: false, error: e.message }
    }
  },

  // For debugging - list all rooms
  listAllRooms: async () => {
    try {
      const { data, error } = await supabase.from("rooms").select("*")

      if (error) throw error

      return data || []
    } catch (e) {
      console.error("Error listing rooms:", e)
      return []
    }
  },
}

export default RoomServiceSupabase
