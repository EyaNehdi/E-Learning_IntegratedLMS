"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import RoomServiceSupabase from "./room-service.js"
import "./d.css"

export default function JoinRoom() {
  const [roomId, setRoomId] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [userId, setUserId] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // Generate or retrieve user ID on component mount
  useEffect(() => {
    try {
      // Check if we already have a user ID
      const storedId = localStorage.getItem("userId")
      if (storedId) {
        setUserId(storedId)
      } else {
        // Generate a new unique ID
        const newId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem("userId", newId)
        setUserId(newId)
      }
    } catch (err) {
      console.error("Error generating user ID:", err)
    }
  }, [])

  // Modify the handleSubmit function to be more permissive with room checking
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Validate room ID
      if (!roomId.trim()) {
        setError("Please enter a valid room ID")
        return
      }

      // Check if room exists - but we'll be more permissive now
      // We'll attempt to join even if the room isn't found in the database
      const roomExists = await RoomServiceSupabase.roomExists(roomId)

      // Get room info to verify instructor
      const roomInfo = await RoomServiceSupabase.getRoomInfo(roomId)
      if (!roomInfo) {
        setError("Invalid room information. Please try again.")
        return
      }

      // Save the display name and room info to localStorage
      localStorage.setItem("isHost", "false")
      localStorage.setItem("displayName", displayName)
      localStorage.setItem("currentRoomId", roomId)
      localStorage.setItem("instructorId", roomInfo.instructor_id || "unknown_instructor")
      localStorage.setItem("instructorName", roomInfo.instructor_name || "Instructor")

      // Navigate to the meeting room
      navigate(`/room/${roomId}`)
    } catch (err) {
      console.error("Error joining room:", err)
      setError("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Join Meeting Room</h1>
          <p className="mt-2 text-gray-600">Enter the room ID provided by your instructor</p>
          {userId && <p className="mt-2 text-xs text-gray-500">Student ID: {userId.substring(0, 8)}...</p>}
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
                placeholder="Enter the room ID"
              />
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
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Join Meeting
            </button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            Your emotions will be shared with the instructor to help improve the learning experience
          </p>
        </div>
      </div>
    </div>
  )
}
