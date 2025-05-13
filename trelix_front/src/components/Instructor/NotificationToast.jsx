"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"

const NotificationToast = ({ show, message, type = "success", duration = 5000, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    setIsVisible(show)

    if (show && duration) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onDismiss) onDismiss()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, onDismiss])

  if (!isVisible) return null

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-green-100",
          borderColor: "border-green-500",
          textColor: "text-green-800",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        }
      case "error":
        return {
          bgColor: "bg-red-100",
          borderColor: "border-red-500",
          textColor: "text-red-800",
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        }
      case "info":
      default:
        return {
          bgColor: "bg-blue-100",
          borderColor: "border-blue-500",
          textColor: "text-blue-800",
          icon: <Info className="h-5 w-5 text-blue-500" />,
        }
    }
  }

  const { bgColor, borderColor, textColor, icon } = getTypeStyles()

  return (
    <div
      className={`fixed top-5 right-5 max-w-md p-4 rounded-lg shadow-lg border-l-4 ${borderColor} ${bgColor} animate-fade-in-right z-50`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            if (onDismiss) onDismiss()
          }}
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default NotificationToast
