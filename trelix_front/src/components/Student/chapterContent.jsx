"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import {
  Star,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Mail,
  CheckCircle,
  FileText,
  Award,
  BookOpen,
  Clock,
  Play,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Progress } from "../ui/progress"

// Import your QuizModal component
import QuizModal from "../Quiz/QuizModal"

// Simpler PDF Viewer that doesn't rely on PDF.js
const SimplePDFViewer = ({ pdfUrl, onProgressChange, onComplete }) => {
  const iframeRef = useRef(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // Track scroll position in the iframe
  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current
      if (!iframe) return

      // Try to access the iframe content
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document

      // Add scroll event listener to the iframe document
      iframe.contentWindow.addEventListener("scroll", handleScroll)

      // Check if we can mark as read immediately (small PDFs)
      setTimeout(checkCompletion, 2000)
    } catch (error) {
      console.error("Error setting up iframe tracking:", error)
    }
  }

  // Handle scroll events inside the iframe
  const handleScroll = () => {
    try {
      const iframe = iframeRef.current
      if (!iframe) return

      const iframeWindow = iframe.contentWindow
      const scrollTop = iframeWindow.scrollY || iframeWindow.pageYOffset
      const scrollHeight = iframeWindow.document.documentElement.scrollHeight
      const clientHeight = iframeWindow.document.documentElement.clientHeight

      // Calculate scroll percentage
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
      setScrollPosition(Math.min(scrollPercentage, 100))
      onProgressChange(Math.min(scrollPercentage, 100))

      // Check if user has scrolled to the bottom (or near bottom)
      checkCompletion()
    } catch (error) {
      // Ignore cross-origin errors
      console.log("Note: Cross-origin restrictions may limit scroll tracking")
    }
  }

  // Check if the PDF is considered "completed"
  const checkCompletion = () => {
    if (isCompleted) return

    try {
      const iframe = iframeRef.current
      if (!iframe) return

      const iframeWindow = iframe.contentWindow
      const scrollTop = iframeWindow.scrollY || iframeWindow.pageYOffset
      const scrollHeight = iframeWindow.document.documentElement.scrollHeight
      const clientHeight = iframeWindow.document.documentElement.clientHeight

      // Consider PDF read if scrolled 90% or more
      if (scrollTop + clientHeight >= scrollHeight * 0.9) {
        setIsCompleted(true)
        onComplete()
      }
    } catch (error) {
      // Fallback: mark as complete after 60 seconds of viewing
      setTimeout(() => {
        if (!isCompleted) {
          setIsCompleted(true)
          onComplete()
        }
      }, 60000)
    }
  }

  // Clean up event listeners
  useEffect(() => {
    return () => {
      try {
        const iframe = iframeRef.current
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.removeEventListener("scroll", handleScroll)
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }, [])

  return (
    <div className="pdf-viewer rounded-lg overflow-hidden shadow-md border border-gray-200">
      <div className="bg-white p-4 border-b flex justify-between items-center">
        <h3 className="text-base font-medium flex items-center text-gray-800">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Course PDF Document
        </h3>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 w-40 mr-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${scrollPosition}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600 font-medium">{Math.round(scrollPosition)}%</span>
          {isCompleted && <CheckCircle className="w-4 h-4 ml-2 text-green-500" />}
        </div>
      </div>

      <iframe
        ref={iframeRef}
        src={pdfUrl}
        className="w-full h-[600px] border-0"
        onLoad={handleIframeLoad}
        title="Course PDF"
      />

      {/* Fallback completion button in case tracking doesn't work */}
      {!isCompleted && (
        <div className="bg-white p-4 border-t flex justify-end">
          <button
            onClick={() => {
              setIsCompleted(true)
              onComplete()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Read
          </button>
        </div>
      )}
    </div>
  )
}

const ChapterContent = () => {
  const { id } = useParams()
  const [chapters, setChapters] = useState([])
  const [currentChapter, setCurrentChapter] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Content tracking states
  const [showPDF, setShowPDF] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [pdfProgress, setPdfProgress] = useState(0)
  const [videoCompleted, setVideoCompleted] = useState(false)
  const [pdfCompleted, setPdfCompleted] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [selectedChapterDescription, setSelectedChapterDescription] = useState("")
  //
  const handleChapterClick = (chapter) => {
    setCurrentChapter(chapter)
    setSelectedChapterDescription(chapter.description) // Update the description when chapter is clicked
  }

  // Refs
  const videoRef = useRef(null)

  // Fetch chapters
  useEffect(() => {
    setLoading(true)
    axios
      .get("http://localhost:5000/chapter/get")
      .then((response) => {
        setChapters(response.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching chapters:", error)
        setLoading(false)
      })
  }, [])

  // Set current chapter and fetch instructor profile
  useEffect(() => {
    if (chapters.length > 0) {
      const selectedChapter = chapters.find((chapter) => chapter._id === id)
      if (selectedChapter) {
        setCurrentChapter(selectedChapter)
        // Set the description for the selected chapter
        setSelectedChapterDescription(selectedChapter.description)
        // Check if we have saved completion status
        checkSavedCompletionStatus(id)

        // Fetch instructor profile
        axios
          .get(`http://localhost:5000/api/admin/user/${selectedChapter.userid}`)
          .then((response) => {
            setProfile(response.data)
          })
          .catch((error) => {
            console.error("Error fetching instructor data:", error)
          })
      }
    }
  }, [id, chapters])

  // Check for saved completion status
  const checkSavedCompletionStatus = (chapterId) => {
    const videoCompletionKey = `chapter_${chapterId}_video_completed`
    const pdfCompletionKey = `chapter_${chapterId}_pdf_completed`

    if (localStorage.getItem(videoCompletionKey) === "true") {
      setVideoCompleted(true)
      setVideoProgress(100)
    }

    if (localStorage.getItem(pdfCompletionKey) === "true") {
      setPdfCompleted(true)
      setPdfProgress(100)
    }
  }

  // Track video progress
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const video = videoRef.current
      const progress = (video.currentTime / video.duration) * 100
      setVideoProgress(progress)

      // Mark video as completed if watched 90% or more
      if (progress >= 90 && !videoCompleted) {
        setVideoCompleted(true)
        // Save completion status to localStorage
        saveCompletionStatus("video", id)
      }
    }
  }

  // Handle PDF progress change
  const handlePDFProgressChange = (progress) => {
    setPdfProgress(progress)
  }

  // Handle PDF completion
  const handlePDFComplete = () => {
    setPdfCompleted(true)
    saveCompletionStatus("pdf", id)
  }

  // Save completion status to localStorage
  const saveCompletionStatus = (type, chapterId) => {
    const completionKey = `chapter_${chapterId}_${type}_completed`
    localStorage.setItem(completionKey, "true")

    // You can also send this to your backend
    console.log(`${type} completed for chapter ${chapterId}`)
  }

  // Toggle PDF visibility
  const togglePDF = () => {
    setShowPDF((prev) => !prev)
    if (!showPDF) {
      setTimeout(() => {
        document.getElementById("pdf-container")?.scrollIntoView({ behavior: "smooth" })
      }, 300)
    }
  }

  // Check if quiz can be started
  const canStartQuiz = videoCompleted && (pdfCompleted || !currentChapter?.pdf)

  // Start quiz
  const handleStartQuiz = () => {
    if (canStartQuiz) {
      setShowQuiz(true)
    } else {
      // Show what needs to be completed
      const missingItems = []
      if (!videoCompleted) missingItems.push("watch the video")
      if (currentChapter?.pdf && !pdfCompleted) missingItems.push("read the PDF")

      alert(`Please complete the following before starting the quiz: ${missingItems.join(" and ")}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chapter content...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="bg-white flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-auto px-4 py-6 max-w-5xl mx-auto w-full">
        {currentChapter && (
          <>
            {/* Chapter Title */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{currentChapter.title}</h1>
              <div className="flex items-center text-sm text-gray-500">
                <BookOpen className="w-4 h-4 mr-1" />
                <span>
                  Chapter {chapters.indexOf(currentChapter) + 1} of {chapters.length}
                </span>

                {/* Progress Indicator */}
                <div className="ml-auto flex items-center">
                  <span className="mr-2">Progress:</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (videoCompleted ? 50 : videoProgress / 2) +
                          (currentChapter.pdf ? (pdfCompleted ? 50 : pdfProgress / 2) : 50)
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="font-medium">
                    {Math.round(
                      (videoCompleted ? 50 : videoProgress / 2) +
                        (currentChapter.pdf ? (pdfCompleted ? 50 : pdfProgress / 2) : 50),
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Learning Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-200 flex-grow">
              {/* Check if PDF exists */}
              {currentChapter.pdf === null ? (
                // If no PDF, show only the description
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed">{selectedChapterDescription}</p>
                </div>
              ) : (
                // Otherwise, show the video and PDF
                <div>
                  {/* Video Player Section */}
                  <div className="relative w-full">
                    <div className="aspect-video w-full bg-black">
                      <video
                        className="w-full h-full object-contain"
                        ref={videoRef}
                        controls
                        autoPlay
                        muted
                        onTimeUpdate={handleVideoTimeUpdate}
                      >
                        <source src={`http://localhost:5000${currentChapter.video}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    {/* Video Progress Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 flex items-center">
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mr-2">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${videoProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center">
                        {videoCompleted ? (
                          <span className="text-green-400 flex items-center text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="text-white text-xs">{Math.round(videoProgress)}%</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Learning Progress */}
                  <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-blue-800 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Your Learning Progress
                      </h3>
                      <span className="text-sm bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full">
                        {Math.round(
                          (videoCompleted ? 50 : videoProgress / 2) +
                            (currentChapter.pdf ? (pdfCompleted ? 50 : pdfProgress / 2) : 50),
                        )}
                        % Complete
                      </span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-3 mb-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (videoCompleted ? 50 : videoProgress / 2) +
                            (currentChapter.pdf ? (pdfCompleted ? 50 : pdfProgress / 2) : 50)
                          }%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${videoCompleted ? "bg-green-500" : "bg-blue-400"}`}
                        ></div>
                        <span className={videoCompleted ? "text-green-700" : "text-blue-700"}>
                          Video {videoCompleted ? "Completed" : `${Math.round(videoProgress)}%`}
                        </span>
                      </div>

                      {currentChapter.pdf && (
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${pdfCompleted ? "bg-green-500" : "bg-blue-400"}`}
                          ></div>
                          <span className={pdfCompleted ? "text-green-700" : "text-blue-700"}>
                            PDF {pdfCompleted ? "Completed" : `${Math.round(pdfProgress)}%`}
                          </span>
                        </div>
                      )}

                      <div className="ml-auto">
                        {canStartQuiz ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Ready for quiz
                          </span>
                        ) : (
                          <span className="text-amber-600 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Complete all materials to unlock quiz
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PDF Button */}
                  {currentChapter.pdf && (
                    <div className="p-5 border-b">
                      <button
                        className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-between w-full ${
                          showPDF
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                        onClick={togglePDF}
                      >
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 mr-2" />
                          {showPDF ? "Hide Course PDF" : "View Course PDF"}
                          {pdfCompleted && <CheckCircle className="w-4 h-4 ml-2 text-green-500" />}
                        </div>
                        {showPDF ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  )}

                  {/* PDF Viewer using SimplePDFViewer */}
                  {showPDF && currentChapter.pdf && (
                    <div id="pdf-container" className="p-5">
                      <SimplePDFViewer
                        pdfUrl={`http://localhost:5000${currentChapter.pdf}`}
                        onProgressChange={handlePDFProgressChange}
                        onComplete={handlePDFComplete}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quiz Button */}
            <div className="mb-8 flex justify-center">
              <button
                className={`py-4 px-10 rounded-lg text-lg transition-all duration-300 shadow-lg focus:outline-none flex items-center gap-3 ${
                  canStartQuiz
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-xl transform hover:-translate-y-1"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                onClick={handleStartQuiz}
                disabled={!canStartQuiz}
              >
                <Award className="w-6 h-6" />
                <span>Start Quiz</span>
                {canStartQuiz && <Play className="w-5 h-5" />}
              </button>
            </div>

            {/* Quiz Modal */}
            <QuizModal showQuiz={showQuiz} onClose={() => setShowQuiz(false)} />

            {/* Tabs Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="flex w-full border-b">
                  <TabsTrigger
                    value="overview"
                    className="flex-1 py-4 px-6 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                  >
                    
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="instructors"
                    className="flex-1 py-4 px-6 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                  >
                    Instructors
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="flex-1 py-4 px-6 text-base font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                  >
                    Reviews
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="p-6">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">{currentChapter.title}</h2>
                    <p className="text-gray-700 leading-relaxed">{currentChapter.description}</p>

                    <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">What you'll learn</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span>What does set and get do?</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span>I dont understand his explanation</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span>Function from an object instance</span>
                        </li>
                      </ul>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magnam, doloremque! Eligendi, tempore
                      quisquam officiis porro deserunt debitis odio atque magnam! Necessitatibus vero facilis
                      perspiciatis mollitia recusandae eaque ullam! Nesciunt, fugiat?
                    </p>
                  </div>
                </TabsContent>

                {/* Instructors Tab */}
                <TabsContent value="instructors" className="p-6">
                  {profile ? (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-800">Meet Your Instructor</h2>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl overflow-hidden">
                        <div className="p-6 flex flex-col md:flex-row gap-6">
                          <div className="w-32 h-32 flex-shrink-0 mx-auto md:mx-0">
                            <img
                              src={`http://localhost:5000${profile.profilePhoto}`}
                              alt={profile.name}
                              className="w-full h-full object-cover rounded-full border-4 border-white shadow-md"
                            />
                          </div>

                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              {profile.firstName + " " + profile.lastName}
                            </h3>
                            <p className="text-blue-600 text-sm font-medium mb-3">{profile.role || "Instructor"}</p>
                            <p className="text-gray-700 mb-4 leading-relaxed">{profile.Bio || "No bio available."}</p>

                            <div className="flex gap-3 text-gray-600">
                              <a
                                href="#"
                                className="hover:text-blue-600 transition-colors p-2 bg-white rounded-full shadow-sm"
                              >
                                <Facebook className="w-5 h-5" />
                              </a>
                              <a
                                href="#"
                                className="hover:text-blue-400 transition-colors p-2 bg-white rounded-full shadow-sm"
                              >
                                <Twitter className="w-5 h-5" />
                              </a>
                              <a
                                href="#"
                                className="hover:text-red-600 transition-colors p-2 bg-white rounded-full shadow-sm"
                              >
                                <Youtube className="w-5 h-5" />
                              </a>
                              <a
                                href="#"
                                className="hover:text-blue-700 transition-colors p-2 bg-white rounded-full shadow-sm"
                              >
                                <Linkedin className="w-5 h-5" />
                              </a>
                              <a
                                href={`mailto:${profile.email}`}
                                className="hover:text-blue-600 transition-colors p-2 bg-white rounded-full shadow-sm flex items-center gap-1 ml-auto"
                              >
                                <Mail className="w-5 h-5" />
                                <span className="text-sm hidden md:inline">{profile.email}</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <p>Loading instructor details...</p>
                    </div>
                  )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="p-6">
                  <div className="space-y-8">
                    {/* Rating Summary */}
                    <div className="flex flex-col md:flex-row justify-between gap-8 pb-6 border-b">
                      {/* Overall Rating */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm rounded-xl p-6 text-center w-full md:w-auto">
                        <h3 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">4.8</h3>
                        <div className="flex justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm">Based on 12 Ratings</p>
                      </div>

                      {/* Rating Breakdown */}
                      <div className="flex-1 space-y-3 p-6 bg-white rounded-xl shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-3">Rating Breakdown</h3>
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="w-8 text-right font-medium">{rating}</span>
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1">
                              <Progress
                                value={
                                  rating === 5 ? 100 : rating === 4 ? 75 : rating === 3 ? 50 : rating === 2 ? 25 : 0
                                }
                                className="h-2"
                              />
                            </div>
                            <span className="text-sm text-gray-500 w-8">
                              {rating === 5
                                ? "75%"
                                : rating === 4
                                  ? "15%"
                                  : rating === 3
                                    ? "5%"
                                    : rating === 2
                                      ? "3%"
                                      : "2%"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6">
                      <h3 className="font-semibold text-gray-800 text-xl mb-4">Student Reviews</h3>

                      {/* Review 1 */}
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <img
                              src="/assets/images/avatar5.png"
                              alt="Johnathon Smith"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">Johnathon Smith</h4>
                                <p className="text-gray-500 text-xs">Nov 12, 2022 at 12:12 am</p>
                              </div>
                              <div className="flex mt-1 sm:mt-0">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm">
                              Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia nulla. Aliquam quis
                              purus in justo pulvinar tempor.
                            </p>
                          </div>
                        </div>

                        {/* Reply */}
                        <div className="flex gap-4 ml-12">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <img
                              src="/assets/images/avatar3.png"
                              alt="Andrew Dian"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">Andrew Dian</h4>
                                <p className="text-gray-500 text-xs">Nov 12, 2022 at 12:12 am</p>
                              </div>
                              <div className="flex mt-1 sm:mt-0">
                                {[1, 2, 3, 4].map((star) => (
                                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                                <Star className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm">
                              Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia nulla. Aliquam quis
                              purus in justo pulvinar tempor.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Review 2 */}
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src="/assets/images/avatar4.png"
                            alt="Mc Donald"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">Mc Donald</h4>
                              <p className="text-gray-500 text-xs">Nov 12, 2022 at 12:12 am</p>
                            </div>
                            <div className="flex mt-1 sm:mt-0">
                              {[1, 2, 3, 4].map((star) => (
                                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                              <Star className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">
                            Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia nulla. Aliquam quis
                            purus in justo pulvinar tempor.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default ChapterContent
