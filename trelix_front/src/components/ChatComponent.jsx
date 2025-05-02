"use client"

import { useState, useEffect } from "react"
import { db } from "./FirebaseConfig"
import { ref, set, onValue, remove, update } from "firebase/database"
import "../App.css"
import { censorBadWords } from "../utils/content-filter"

function ChatComponent() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [editingMessage, setEditingMessage] = useState(null)
  const [editedText, setEditedText] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)

  // Send message with rate limiting (10 per minute) and bad word filtering
  const handleSendMessage = async () => {
    if (isFiltering) return // Prevent multiple submissions while filtering

    const now = Date.now()

    // Get timestamp history from localStorage
    const storedTimestamps = JSON.parse(localStorage.getItem("messageTimestamps")) || []
    const oneMinuteAgo = now - 60000

    // Keep only those from the last minute
    const recentTimestamps = storedTimestamps.filter((ts) => ts > oneMinuteAgo)

    // Check the limit
    if (recentTimestamps.length >= 10) {
      alert("⛔ You've reached the limit of 10 messages per minute.")
      return
    }

    if (message.trim()) {
      setIsFiltering(true)
      try {
        // Filter bad words before sending
        const filteredMessage = await censorBadWords(message)

        const timestamp = now
        const messageRef = ref(db, "messages/" + timestamp)
        await set(messageRef, {
          text: filteredMessage,
          timestamp: timestamp,
          edited: false,
          originalText: message, // Optional: store original for admin review
        })

        localStorage.setItem("messageTimestamps", JSON.stringify([...recentTimestamps, now]))
        setMessage("")
      } catch (error) {
        console.error("Error sending message:", error)
      } finally {
        setIsFiltering(false)
      }
    }
  }

  const handleDeleteMessage = (messageId) => {
    const messageRef = ref(db, "messages/" + messageId)
    remove(messageRef)
      .then(() => {
        console.log("Message deleted")
      })
      .catch((error) => {
        console.error("Delete error:", error)
      })
  }

  // Update a message (only once) with bad word filtering
  const handleUpdateMessage = async (messageId) => {
    if (editedText.trim()) {
      setIsFiltering(true)
      try {
        // Filter bad words before updating
        const filteredMessage = await censorBadWords(editedText)

        const messageRef = ref(db, "messages/" + messageId)
        await update(messageRef, {
          text: filteredMessage,
          edited: true,
          originalText: editedText, // Optional: store original for admin review
        })

        console.log("Message updated")
        setEditingMessage(null)
        setEditedText("")
      } catch (error) {
        console.error("Update error:", error)
      } finally {
        setIsFiltering(false)
      }
    }
  }

  // Read messages in real-time
  useEffect(() => {
    const messagesRef = ref(db, "messages")
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      const loadedMessages = []
      for (const id in data) {
        loadedMessages.push({ id, ...data[id] })
      }

      // Sort messages by timestamp
      loadedMessages.sort((a, b) => a.timestamp - b.timestamp)
      setMessages(loadedMessages)
    })
  }, [])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isChatOpen) {
      const messagesContainer = document.querySelector(".messages-container")
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }
    }
  }, [messages, isChatOpen])

  // Toggle chat display
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  // Handle Enter key to send message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="chat-container-wrapper">
      {/* Floating chat bubble */}
      <div className={`chat-bubble ${isChatOpen ? "active" : ""}`} onClick={toggleChat}>
        {isChatOpen ? (
          <svg className="chat-bubble-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg className="chat-bubble-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
        )}
      </div>

      {/* Chat interface */}
      <div className={`chat-container ${isChatOpen ? "open" : ""}`}>
        <div className="chat-header">
          <h2 className="chat-title">Group Chat</h2>
          <button className="close-button" onClick={toggleChat}>
            <svg className="close-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className="message-item">
              <div className="message-content">
                <p className="message-text">{msg.text}</p>
                <div className="message-meta">
                  <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  {msg.edited && <span className="edited-tag">edited</span>}
                </div>
              </div>

              <div className="message-actions">
                {editingMessage === msg.id ? (
                  <div className="edit-container">
                    <input
                      type="text"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="edit-input"
                      placeholder="Edit your message"
                    />
                    <div className="edit-buttons">
                      <button className="cancel-button" onClick={() => setEditingMessage(null)}>
                        Cancel
                      </button>
                      <button
                        className="update-button"
                        onClick={() => handleUpdateMessage(msg.id)}
                        disabled={isFiltering}
                      >
                        {isFiltering && editingMessage === msg.id ? "Filtering..." : "Update"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="action-buttons">
                    {!msg.edited && (
                      <button
                        className="edit-button"
                        onClick={() => {
                          setEditingMessage(msg.id)
                          setEditedText(msg.text)
                        }}
                      >
                        Update
                      </button>
                    )}
                    <button className="delete-button" onClick={() => handleDeleteMessage(msg.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="input-container">
          <input
            className="message-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isFiltering}
          />
          <button
            className={`send-button ${message.trim() === "" || isFiltering ? "disabled" : ""}`}
            onClick={handleSendMessage}
            disabled={message.trim() === "" || isFiltering}
          >
            {isFiltering ? "..." : "➤"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatComponent
