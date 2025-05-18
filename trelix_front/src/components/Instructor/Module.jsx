"use client"

import React from "react"
import { useState } from "react"
import axios from "axios"
import { X } from 'lucide-react'

/**
 * Module Modal Component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onModuleAdded - Function called after a module is added
 */
function ModuleModal({ isOpen, onClose, onModuleAdded }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handle form submission
   * @param {React.FormEvent} e - Form event
   */
  const addModule = async (e) => {
    e.preventDefault()

    if (!name || !description || !startDate) {
      alert("All fields are required.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_PROXY}/module/addmodule`, {
        name,
        description,
        startDate,
      })

      if (response.status === 201) {
        alert("Module added successfully!")
        setName("")
        setDescription("")
        setStartDate("")
        onModuleAdded() // Refresh the modules list
        onClose() // Close the modal
      } else {
        alert("Failed to add module.")
      }
    } catch (error) {
      console.error("Error:", error)
      alert(error.response?.data?.message || "Failed to add module.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <h1 className="text-3xl font-bold text-center text-white mb-2">Add Module</h1>
        </div>

        <form onSubmit={addModule} className="space-y-6">
          {/* Module Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Module Name</label>
            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              name="name"
              placeholder="Enter module name"
              value={name}
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              name="description"
              placeholder="Enter description"
              value={description}
              rows={4}
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            ></textarea>
          </div>

          {/* Creation Date */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Creation Date</label>
            <input
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
              name="startDate"
              value={startDate}
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-start mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: "#0066ff",
                color: "white",
                borderRadius: "6px",
                padding: "8px 16px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "auto",
                minWidth: "140px",
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? (
                "Adding..."
              ) : (
                <>
                  <span style={{ marginRight: "4px", fontSize: "18px" }}>+</span>
                  <span>Add Module</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModuleModal