"use client"

import { useState, useEffect } from "react"
import { FileText, Video, File, X } from "lucide-react"

const FilePreview = ({ file, type, onRemove }) => {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!file) return

    if (type === "video" && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file)
      setPreview(url)

      return () => URL.revokeObjectURL(url)
    }

    if (type === "pdf" && file.type === "application/pdf") {
      const url = URL.createObjectURL(file)
      setPreview(url)

      return () => URL.revokeObjectURL(url)
    }
  }, [file, type])

  if (!file) return null

  return (
    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {type === "pdf" ? (
            <FileText className="h-8 w-8 text-red-500 mr-3" />
          ) : type === "video" ? (
            <Video className="h-8 w-8 text-blue-500 mr-3" />
          ) : (
            <File className="h-8 w-8 text-gray-500 mr-3" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button onClick={onRemove} className="text-gray-400 hover:text-gray-600" aria-label="Remove file">
          <X className="h-5 w-5" />
        </button>
      </div>

      {preview && type === "video" && (
        <div className="mt-3 rounded-md overflow-hidden">
          <video controls className="w-full h-auto max-h-40 object-cover" src={preview}>
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {preview && type === "pdf" && (
        <div className="mt-3">
          <a
            href={preview}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            <FileText className="h-4 w-4 mr-1" />
            Preview PDF
          </a>
        </div>
      )}
    </div>
  )
}

export default FilePreview
