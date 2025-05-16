"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function HostSetup() {
  const [roomId, setRoomId] = useState("")
  const [displayName, setDisplayName] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    // Save the host status and display name to localStorage
    localStorage.setItem("isHost", "true")
    localStorage.setItem("displayName", displayName)

    // Navigate to the meeting room with the host parameter
    navigate(`/room/${roomId}?host=true`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Meeting Room</h1>
          <p className="mt-2 text-gray-600">Set up a new meeting room as an instructor</p>
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
