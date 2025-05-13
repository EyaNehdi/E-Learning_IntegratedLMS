"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { useOutletContext } from "react-router-dom"
import { Search, Plus, Trash2, Edit, FileText, Video, Link2, Calendar } from "lucide-react"
import NotificationToast from "./NotificationToast"
import FilePreview from "./FilePreview"
import UploadProgress from "./UploadProgress"
import "./animations.css"

function AddChapter() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pdf, setPdf] = useState(null)
  const [video, setVideo] = useState(null)
  const [chapters, setChapters] = useState([])
  const { user } = useOutletContext()
  const [expandedRows, setExpandedRows] = useState({})
  const maxLength = 100
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedChapters, setSelectedChapters] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("add")
  const [searchTerm, setSearchTerm] = useState("")
  const [pdfName, setPdfName] = useState("")
  const [videoName, setVideoName] = useState("")
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [uploadProgress, setUploadProgress] = useState({ pdf: 0, video: 0 })
  const fileInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_API_PROXY}/course/courses`)
        setCourses(response.data)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching courses:", error)
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Fetch chapters
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_PROXY}/chapter/get`)
        setChapters(response.data)
      } catch (error) {
        console.error("Error fetching chapters:", error)
      }
    }

    fetchChapters()
  }, [])

  // Toggle expanded row
  const toggleExpand = (chapterId) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [chapterId]: !prevState[chapterId],
    }))
  }

  // Handle course selection
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value)
  }

  // Handle chapter selection
  const handleChapterChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
    setSelectedChapters(selectedOptions)
  }

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 5000)
      if (type === "success" && message.includes("added successfully")) {
        setIsSubmitting(false)
      }
  }

  // Dismiss notification
  const dismissNotification = () => {
    setNotification({ show: false, message: "", type: "" })
  }

  // Simulate upload progress
  const simulateProgress = (fileType) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
      }
      setUploadProgress((prev) => ({ ...prev, [fileType]: progress }))
    }, 200)
  }

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (e.target.name === "pdf") {
        setPdf(file)
        setPdfName(file.name)
        // Simulate upload progress for better UX
        simulateProgress("pdf")
      }
      if (e.target.name === "video") {
        setVideo(file)
        setVideoName(file.name)
        // Simulate upload progress for better UX
        simulateProgress("video")
      }
    }
  }

  // Handle chapter deletion
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_PROXY}/chapter/delete/${id}`)
      if (response.status === 200) {
        setChapters((prevChapters) => prevChapters.filter((chapter) => chapter._id !== id))
        showNotification("Chapter deleted successfully", "success")
      }
    } catch (error) {
      console.error("Error deleting chapter:", error)
      showNotification("Error deleting chapter", "error")
    }
  }

  // Handle chapter assignment
  const handleAssign = async () => {
    try {
       setIsAssigning(true)
      const response = await axios.post(`${import.meta.env.VITE_API_PROXY}/chapter/assign-chapters`, {
        slugCourse: selectedCourse,
        chapters: selectedChapters,
      })
   setTimeout(() => {
        setIsAssigning(false)
      }, 1000)
      showNotification("Chapters assigned successfully!", "success")
      setSelectedCourse("")
      setSelectedChapters([])
    
    } catch (error) {
      console.error("Error assigning chapters:", error.response?.data || error.message)
      showNotification("Error assigning chapters", "error")
       setIsAssigning(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !description) {
      showNotification("Title and description are required.", "error")
      return
    }
  setIsSubmitting(true)
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("userid", user._id)

    if (pdf) formData.append("pdf", pdf)
    if (video) formData.append("video", video)

    try {
      // Show uploading notification
      showNotification("Uploading chapter content...", "info")

      const response = await axios.post(`${import.meta.env.VITE_API_PROXY}/chapter/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`Upload Progress: ${percentCompleted}%`)
        },
      })

      if (response.status === 201) {
        showNotification("Chapter added successfully!", "success")
        // Refresh chapters list
        const chaptersResponse = await axios.get(`${import.meta.env.VITE_API_PROXY}/chapter/get`)
        setChapters(chaptersResponse.data)

        // Reset form
        setTitle("")
        setDescription("")
        setPdf(null)
        setVideo(null)
        setPdfName("")
        setVideoName("")
        setUploadProgress({ pdf: 0, video: 0 })
        setTimeout(() => {
          setIsSubmitting(false)
        }, 1000)
      } else {
        showNotification("Failed to add chapter.", "error")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error:", error)
      showNotification(error.response?.data?.message || "Failed to add chapter.", "error")
         setIsSubmitting(false)
    }
  }

  // Filter chapters based on search term
  const filteredChapters = chapters
    .filter((chapter) => chapter.userid === user._id)
    .filter(
      (chapter) =>
        chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Chapter Management</h1>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap border-b">
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
              activeTab === "add" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("add")}
          >
            Add Chapter
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
              activeTab === "list" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("list")}
          >
            All Chapters
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
              activeTab === "assign" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("assign")}
          >
            Assign to Course
          </button>
        </div>
      </div>

      {/* Add Chapter Form */}
      {activeTab === "add" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Add New Chapter</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Chapter Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter chapter title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="pdfInput" className="block text-sm font-medium text-gray-700">
                  PDF Document (Optional)
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="flex items-center">
                    <label className="flex-1 cursor-pointer px-3 py-2 bg-white text-gray-700 hover:bg-gray-50">
                      <span className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-gray-500" />
                        {pdfName || "Choose PDF file"}
                      </span>
                      <input
                        id="pdfInput"
                        type="file"
                        name="pdf"
                        ref={fileInputRef}
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {pdfName ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPdf(null)
                          setPdfName("")
                          setUploadProgress((prev) => ({ ...prev, pdf: 0 }))
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-blue-500 hover:text-blue-700 bg-blue-50"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {pdf && (
                    <FilePreview
                      file={pdf}
                      type="pdf"
                      onRemove={() => {
                        setPdf(null)
                        setPdfName("")
                        setUploadProgress((prev) => ({ ...prev, pdf: 0 }))
                        if (fileInputRef.current) fileInputRef.current.value = ""
                      }}
                    />
                  )}
                  {pdfName && uploadProgress.pdf > 0 && <UploadProgress progress={uploadProgress.pdf} />}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="videoInput" className="block text-sm font-medium text-gray-700">
                  Video (Optional)
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="flex items-center">
                    <label className="flex-1 cursor-pointer px-3 py-2 bg-white text-gray-700 hover:bg-gray-50">
                      <span className="flex items-center">
                        <Video className="w-5 h-5 mr-2 text-gray-500" />
                        {videoName || "Choose video file"}
                      </span>
                      <input
                        id="videoInput"
                        type="file"
                        name="video"
                        ref={videoInputRef}
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {videoName ? (
                      <button
                        type="button"
                        onClick={() => {
                          setVideo(null)
                          setVideoName("")
                          setUploadProgress((prev) => ({ ...prev, video: 0 }))
                          if (videoInputRef.current) videoInputRef.current.value = ""
                        }}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="p-2 text-blue-500 hover:text-blue-700 bg-blue-50"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {video && (
                    <FilePreview
                      file={video}
                      type="video"
                      onRemove={() => {
                        setVideo(null)
                        setVideoName("")
                        setUploadProgress((prev) => ({ ...prev, video: 0 }))
                        if (videoInputRef.current) videoInputRef.current.value = ""
                      }}
                    />
                  )}
                  {videoName && uploadProgress.video > 0 && <UploadProgress progress={uploadProgress.video} />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter chapter description"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
  disabled={isSubmitting}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                } text-white focus:ring-blue-500`}              >
                <span className="flex items-center">
                {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding Chapter...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add Chapter
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chapter List */}
      {activeTab === "list" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">All Chapters</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search chapters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title & Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Resources
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChapters.length > 0 ? (
                  filteredChapters.map((chapter) => (
                    <tr key={chapter._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">{chapter.title}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {chapter.createdAt ? new Date(chapter.createdAt).toLocaleDateString() : "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {chapter.description.length > maxLength && !expandedRows[chapter._id] ? (
                            <>
                              {chapter.description.substring(0, maxLength)}...
                              <button
                                onClick={() => toggleExpand(chapter._id)}
                                className="ml-1 text-blue-500 hover:text-blue-700 text-sm font-medium"
                              >
                                Read More
                              </button>
                            </>
                          ) : (
                            <>
                              {chapter.description}
                              {chapter.description.length > maxLength && (
                                <button
                                  onClick={() => toggleExpand(chapter._id)}
                                  className="ml-1 text-blue-500 hover:text-blue-700 text-sm font-medium"
                                >
                                  Show Less
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          {chapter.video ? (
                            <a
                              href={`${chapter.video}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 flex items-center"
                            >
                              <Video className="h-4 w-4 mr-1" />
                              View Video
                            </a>
                          ) : (
                            <span className="text-gray-400 flex items-center">
                              <Video className="h-4 w-4 mr-1" />
                              No Video
                            </span>
                          )}

                          {chapter.pdf ? (
                            <a
                              href={`${chapter.pdf}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View PDF
                            </a>
                          ) : (
                            <span className="text-gray-400 flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              No PDF
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDelete(chapter._id)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? "No chapters found matching your search" : "No chapters available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Chapters to Course */}
      {activeTab === "assign" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Assign Chapters to Course</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Select Course</label>
              <select
                value={selectedCourse}
                onChange={handleCourseChange}
                style={{ display: "block" }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="" disabled>
                  Choose a course
                </option>
                {courses.length > 0 ? (
                  courses
                    .filter((course) => course.user === user._id)
                    .map((course) => (
                      <option key={course._id} value={course.slug}>
                        {course.title}
                      </option>
                    ))
                ) : (
                  <option disabled>No courses available</option>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Chapters (hold Ctrl/Cmd to select multiple)
              </label>
              <select
                multiple
                value={selectedChapters}
                onChange={handleChapterChange}
                style={{ display: "block" }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px]"
              >
                {chapters.length > 0 ? (
                  chapters
                    .filter((chapter) => chapter.userid === user._id)
                    .map((chapter) => (
                      <option key={chapter._id} value={chapter._id}>
                        {chapter.title || "Untitled Chapter"}
                      </option>
                    ))
                ) : (
                  <option disabled>No chapters available</option>
                )}
              </select>
              <p className="text-sm text-gray-500 mt-1">Selected: {selectedChapters.length} chapter(s)</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAssign}
                disabled={!selectedCourse || selectedChapters.length === 0 || isAssigning}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  !selectedCourse || selectedChapters.length === 0 || isAssigning
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
                }`}
              >
                <span className="flex items-center">
                     {isAssigning ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-5 h-5 mr-2" />
                      Assign Chapters to Course
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      <NotificationToast
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onDismiss={dismissNotification}
      />
    </div>
  )
}

export default AddChapter
