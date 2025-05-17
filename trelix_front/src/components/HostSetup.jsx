"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

// Shared database for room management
const ROOM_DB = {
  // Register a new room with instructor info
  createRoom: (roomId, instructorId, instructorName) => {
    try {
      // Store room info in localStorage
      localStorage.setItem(
        `room_${roomId}_info`,
        JSON.stringify({
          instructorId: instructorId,
          instructorName: instructorName,
          createdAt: new Date().toISOString(),
        }),
      )
      console.log(`Room ${roomId} created by instructor ${instructorName} (${instructorId})`)
      return true
    } catch (e) {
      console.error("Error creating room:", e)
      return false
    }
  },

  // Check if a room exists
  roomExists: (roomId) => {
    try {
      return localStorage.getItem(`room_${roomId}_info`) !== null
    } catch (e) {
      console.error("Error checking room:", e)
      return false
    }
  },
}

export default function HostSetup() {
  const [roomId, setRoomId] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [userId, setUserId] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // Generate or retrieve user ID on component mount
  useEffect(() => {
    // Check if we already have a user ID
    const storedId = localStorage.getItem("userId")
    if (storedId) {
      setUserId(storedId)
    } else {
      // Generate a new unique ID
      const newId = `instructor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("userId", newId)
      setUserId(newId)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate room ID
    if (!roomId.trim()) {
      setError("Please enter a valid room ID")
      return
    }

    // Check if room already exists
    if (ROOM_DB.roomExists(roomId)) {
      setError("This room ID already exists. Please choose a different one.")
      return
    }

    // Create the room with instructor info
    ROOM_DB.createRoom(roomId, userId, displayName)

    // Save the host status and display name to localStorage
    localStorage.setItem("isHost", "true")
    localStorage.setItem("displayName", displayName)
    localStorage.setItem("currentRoomId", roomId)

    // Navigate to the meeting room with the host parameter
    navigate(`/room/${roomId}?host=true`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Meeting Room</h1>
          <p className="mt-2 text-gray-600">Set up a new meeting room as an instructor</p>
          {userId && <p className="mt-2 text-xs text-gray-500">Instructor ID: {userId.substring(0, 8)}...</p>}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                Room ID
              </label>
              <input
                id="roomId"
                name="roomId"
                type="text"
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter a unique room ID"
              />
              <p className="mt-1 text-xs text-gray-500">Choose a unique name for your meeting room</p>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">{error}</div>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Create Room as Instructor
            </button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            Students will be able to join using the Room ID you create
          </p>
        </div>
      </div>
    </div>
  )
}
