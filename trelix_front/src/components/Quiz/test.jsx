"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useProfileStore } from "../../store/profileStore"
import {
  CheckCircle,
  FileText,
  Award,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Lock,
  Unlock,
  Play,
  CheckSquare,
  AlertTriangle,
} from "lucide-react"

// Simpler PDF Viewer component
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
    <div className="pdf-viewer">
      <div className="bg-gray-100 p-3 rounded-t-lg flex justify-between items-center">
        <h3 className="text-sm font-medium">Course PDF Document</h3>
        <div className="flex items-center">
          <div className="w-full bg-gray-300 rounded-full h-2 w-40 mr-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${scrollPosition}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{Math.round(scrollPosition)}%</span>
          {isCompleted && <CheckCircle className="w-4 h-4 ml-2 text-green-500" />}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <iframe
          ref={iframeRef}
          src={pdfUrl}
          className="w-full h-[500px]"
          onLoad={handleIframeLoad}
          title="Course PDF"
        />
      </div>

      {/* Fallback completion button in case tracking doesn't work */}
      {!isCompleted && (
        <div className="bg-gray-100 p-3 rounded-b-lg flex justify-end">
          <button
            onClick={() => {
              setIsCompleted(true)
              onComplete()
            }}
            className="text-sm px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Mark as Read
          </button>
        </div>
      )}
    </div>
  )
}

// Quiz Modal Component
const QuizModal = ({ showQuiz, onClose, chapterId }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [quizData, setQuizData] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef(null)

  // Mock quiz data - replace with actual API call
  useEffect(() => {
    // Simulate loading quiz data
    setLoading(true)

    // In a real app, fetch from your API
    // const fetchQuiz = async () => {
    //   try {
    //     const response = await axios.get(`http://localhost:5000/quiz/chapter/${chapterId}`);
    //     setQuizData(response.data);
    //     setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
    //   } catch (error) {
    //     console.error("Error fetching quiz:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchQuiz();

    // Mock data for demonstration
    setTimeout(() => {
      const mockQuiz = {
        title: "Chapter Quiz",
        description: "Test your knowledge of this chapter",
        timeLimit: 10, // minutes
        questions: [
          {
            id: 1,
            question: "What is the main purpose of React's virtual DOM?",
            options: [
              "To create 3D user interfaces",
              "To improve performance by minimizing direct DOM manipulation",
              "To enable server-side rendering",
              "To create mobile applications",
            ],
            correctAnswer: "To improve performance by minimizing direct DOM manipulation",
          },
          {
            id: 2,
            question: "Which hook is used to perform side effects in a function component?",
            options: ["useState", "useEffect", "useContext", "useReducer"],
            correctAnswer: "useEffect",
          },
          {
            id: 3,
            question: "What does JSX stand for?",
            options: ["JavaScript XML", "JavaScript Extension", "JavaScript Syntax", "Java Syntax Extension"],
            correctAnswer: "JavaScript XML",
          },
          {
            id: 4,
            question: "Which of the following is NOT a React Hook?",
            options: ["useEffect", "useState", "useHistory", "useComponent"],
            correctAnswer: "useComponent",
          },
          {
            id: 5,
            question: "In React, what is the correct way to update state?",
            options: [
              "Directly modify the state variable",
              "Use the setState function",
              "Create a new component",
              "Reload the page",
            ],
            correctAnswer: "Use the setState function",
          },
        ],
      }

      setQuizData(mockQuiz)
      setTimeLeft(mockQuiz.timeLimit * 60) // Convert minutes to seconds
      setLoading(false)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [chapterId])

  // Start timer when quiz data is loaded
  useEffect(() => {
    if (quizData && !quizCompleted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [quizData, quizCompleted])

  // Format time remaining
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle answer selection
  const handleSelectAnswer = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  // Submit quiz
  const handleSubmitQuiz = () => {
    // Calculate score
    let correctCount = 0
    quizData.questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })

    const finalScore = Math.round((correctCount / quizData.questions.length) * 100)
    setScore(finalScore)
    setQuizCompleted(true)

    // Clear timer
    if (timerRef.current) clearInterval(timerRef.current)

    // In a real app, send results to your API
    // axios.post("http://localhost:5000/quiz/submit", {
    //   chapterId,
    //   answers: selectedAnswers,
    //   score: finalScore
    // });
  }

  // Check if all questions are answered
  const allQuestionsAnswered = () => {
    return quizData && quizData.questions.every((q) => selectedAnswers[q.id])
  }

  if (!showQuiz) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        ) : quizCompleted ? (
          <div className="p-8 text-center">
            <div
              className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                score >= 70 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {score >= 70 ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-red-600" />
              )}
            </div>

            <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-gray-600 mb-4">Your score: {score}%</p>

            <div className="w-full max-w-xs mx-auto bg-gray-100 rounded-full h-4 mb-6">
              <div
                className={`h-4 rounded-full ${score >= 70 ? "bg-green-500" : "bg-red-500"}`}
                style={{ width: `${score}%` }}
              ></div>
            </div>

            {score >= 70 ? (
              <div className="text-green-600 mb-6">
                <p className="font-medium">Congratulations! You passed the quiz.</p>
                <p className="text-sm">You can now proceed to the next chapter.</p>
              </div>
            ) : (
              <div className="text-red-600 mb-6">
                <p className="font-medium">You didn't pass this time.</p>
                <p className="text-sm">Review the material and try again.</p>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setQuizCompleted(false)
                  setSelectedAnswers({})
                  setCurrentQuestion(0)
                  setTimeLeft(quizData.timeLimit * 60)
                }}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
              >
                Try Again
              </button>
              <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{quizData.title}</h2>
              <div
                className={`flex items-center px-3 py-1 rounded-full ${
                  timeLeft < 60 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                }`}
              >
                <Clock className="w-4 h-4 mr-1.5" />
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">
                    Question {currentQuestion + 1} of {quizData.questions.length}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {Object.keys(selectedAnswers).length} of {quizData.questions.length} answered
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">{quizData.questions[currentQuestion].question}</h3>

                <div className="space-y-3">
                  {quizData.questions[currentQuestion].options.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectAnswer(quizData.questions[currentQuestion].id, option)}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAnswers[quizData.questions[currentQuestion].id] === option
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                          selectedAnswers[quizData.questions[currentQuestion].id] === option
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedAnswers[quizData.questions[currentQuestion].id] === option && (
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestion === 0}
                  className={`px-4 py-2 flex items-center rounded-md ${
                    currentQuestion === 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </button>

                {currentQuestion < quizData.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={!allQuestionsAnswered()}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      allQuestionsAnswered()
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <CheckSquare className="w-5 h-5 mr-1.5" />
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t">
              <div className="flex flex-wrap gap-2">
                {quizData.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 flex items-center justify-center text-sm rounded-md ${
                      currentQuestion === index
                        ? "bg-blue-600 text-white"
                        : selectedAnswers[quizData.questions[index].id]
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Exam Modal Component
const ExamModal = ({ showExam, onClose, courseId }) => {
  const navigate = useNavigate()

  const startExam = () => {
    // In a real app, you would navigate to the exam page or set up the exam
    // navigate(`/exam/${courseId}`);

    // For this demo, we'll just redirect to the exam student component
    onClose()
    navigate(`/exam-student`)
  }

  if (!showExam) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Final Course Exam</h2>
        </div>

        <div className="p-8">
          <div className="flex items-start mb-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">You've completed all chapters!</h3>
              <p className="text-gray-600">
                Congratulations on completing all the course material. You are now eligible to take the final exam.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="font-medium mb-3">Exam Details:</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <span>Duration: 60 minutes</span>
              </li>
              <li className="flex items-center">
                <CheckSquare className="w-4 h-4 mr-2 text-gray-500" />
                <span>Questions: Multiple choice, true/false, and short answer</span>
              </li>
              <li className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-gray-500" />
                <span>Passing Score: 70%</span>
              </li>
              <li className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-gray-500" />
                <span>Note: You cannot pause the exam once started</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={startExam}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Play className="w-4 h-4 mr-1.5" />
              Start Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
const CourseLearningPlatform = () => {
  const { courseid, chapterid } = useParams()
  const navigate = useNavigate()
  const { user, fetchUser } = useProfileStore()

  // State for chapters and course data
  const [course, setCourse] = useState(null)
  const [chapters, setChapters] = useState([])
  const [currentChapter, setCurrentChapter] = useState(null)
  const [completedChapters, setCompletedChapters] = useState([])
  const [loading, setLoading] = useState(true)

  // State for instructor profile
  const [profile, setProfile] = useState(null)

  // Content tracking states
  const [showPDF, setShowPDF] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [pdfProgress, setPdfProgress] = useState(0)
  const [videoCompleted, setVideoCompleted] = useState(false)
  const [pdfCompleted, setPdfCompleted] = useState(false)

  // Quiz and exam states
  const [showQuiz, setShowQuiz] = useState(false)
  const [showExam, setShowExam] = useState(false)
  const [chapterQuizCompleted, setChapterQuizCompleted] = useState(false)

  // Refs
  const videoRef = useRef(null)

  // Fetch user data
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Fetch course and chapters data
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true)
      try {
        // In a real app, fetch from your API
        // const courseResponse = await axios.get(`http://localhost:5000/course/${courseid}`);
        // setCourse(courseResponse.data);

        // const chaptersResponse = await axios.get(`http://localhost:5000/chapter/course/${courseid}`);
        // setChapters(chaptersResponse.data.chapters);

        // Mock data for demonstration
        const mockCourse = {
          _id: courseid || "course123",
          title: "Complete React Developer Course",
          description: "Master React, Redux, Hooks, Context API and more",
          totalChapters: 5,
          duration: "10 hours",
          level: "Intermediate",
        }

        const mockChapters = [
          {
            _id: "chapter1",
            title: "Introduction to React",
            description: "Learn the basics of React and component-based architecture",
            video: "/videos/react-intro.mp4",
            pdf: "/pdfs/react-intro.pdf",
            duration: "45 minutes",
            userid: "instructor1",
          },
          {
            _id: "chapter2",
            title: "React Hooks",
            description: "Master useState, useEffect and other built-in hooks",
            video: "/videos/react-hooks.mp4",
            pdf: "/pdfs/react-hooks.pdf",
            duration: "60 minutes",
            userid: "instructor1",
          },
          {
            _id: "chapter3",
            title: "State Management",
            description: "Learn different state management approaches in React",
            video: "/videos/state-management.mp4",
            pdf: "/pdfs/state-management.pdf",
            duration: "55 minutes",
            userid: "instructor1",
          },
          {
            _id: "chapter4",
            title: "Routing in React",
            description: "Implement navigation in your React applications",
            video: "/videos/react-routing.mp4",
            pdf: "/pdfs/react-routing.pdf",
            duration: "50 minutes",
            userid: "instructor1",
          },
          {
            _id: "chapter5",
            title: "Advanced React Patterns",
            description: "Learn advanced patterns and techniques for React development",
            video: "/videos/advanced-patterns.mp4",
            pdf: "/pdfs/advanced-patterns.pdf",
            duration: "65 minutes",
            userid: "instructor1",
          },
        ]

        setCourse(mockCourse)
        setChapters(mockChapters)

        // Set initial chapter if chapterid is provided, otherwise use first chapter
        const initialChapter = chapterid ? mockChapters.find((ch) => ch._id === chapterid) : mockChapters[0]

        if (initialChapter) {
          setCurrentChapter(initialChapter)
          // If no chapterid was provided in URL, update the URL
          if (!chapterid) {
            navigate(`/course/${courseid}/chapter/${initialChapter._id}`, { replace: true })
          }
        }

        // Mock completed chapters
        setCompletedChapters(["chapter1"])

        // Mock instructor profile
        const mockProfile = {
          _id: "instructor1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          profilePhoto: "/images/instructor.jpg",
          Bio: "Experienced React developer with 8+ years of experience building web applications. Passionate about teaching and helping others learn.",
        }

        setProfile(mockProfile)
      } catch (error) {
        console.error("Error fetching course data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseid, chapterid, navigate])

  // Fetch completed chapters for the user
  useEffect(() => {
    if (user && user._id && courseid) {
      // In a real app, fetch from your API
      // axios.get("http://localhost:5000/api/auth/completedchapters", {
      //   params: {
      //     userId: user._id,
      //     courseId: courseid
      //   }
      // })
      // .then(response => {
      //   setCompletedChapters(response.data.completedChapters);
      // })
      // .catch(error => {
      //   console.error("Error fetching completed chapters:", error);
      // });
      // For demo, we'll use the mock data set above
    }
  }, [user, courseid])

  // Check for saved completion status when chapter changes
  useEffect(() => {
    if (currentChapter) {
      checkSavedCompletionStatus(currentChapter._id)
    }
  }, [currentChapter])

  // Check for saved completion status
  const checkSavedCompletionStatus = (chapterId) => {
    const videoCompletionKey = `chapter_${chapterId}_video_completed`
    const pdfCompletionKey = `chapter_${chapterId}_pdf_completed`
    const quizCompletionKey = `chapter_${chapterId}_quiz_completed`

    if (localStorage.getItem(videoCompletionKey) === "true") {
      setVideoCompleted(true)
      setVideoProgress(100)
    } else {
      setVideoCompleted(false)
      setVideoProgress(0)
    }

    if (localStorage.getItem(pdfCompletionKey) === "true") {
      setPdfCompleted(true)
      setPdfProgress(100)
    } else {
      setPdfCompleted(false)
      setPdfProgress(0)
    }

    if (localStorage.getItem(quizCompletionKey) === "true") {
      setChapterQuizCompleted(true)
    } else {
      setChapterQuizCompleted(false)
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
        saveCompletionStatus("video", currentChapter._id)
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
    saveCompletionStatus("pdf", currentChapter._id)
  }

  // Save completion status to localStorage and backend
  const saveCompletionStatus = (type, chapterId) => {
    const completionKey = `chapter_${chapterId}_${type}_completed`
    localStorage.setItem(completionKey, "true")

    // In a real app, send this to your backend
    // axios.post("http://localhost:5000/user/mark-chapter-progress", {
    //   userId: user._id,
    //   chapterId: chapterId,
    //   progressType: type,
    //   completed: true
    // });

    console.log(`${type} completed for chapter ${chapterId}`)
  }

  // Mark chapter as completed
  const handleCompleteChapter = (chapterId) => {
    if (!user || !user._id) {
      console.error("User is not logged in")
      return
    }

    // In a real app, update the backend
    // axios.post("http://localhost:5000/user/mark-chapter-completed", {
    //   userId: user._id,
    //   chapterId: chapterId,
    // })
    // .then(response => {
    //   if (response.data.completedChapters) {
    //     setCompletedChapters(response.data.completedChapters);
    //   }
    // })
    // .catch(error => {
    //   console.error("Error marking chapter as completed:", error);
    // });

    // For demo, just update the state
    setCompletedChapters((prev) => {
      if (prev.includes(chapterId)) {
        return prev
      } else {
        return [...prev, chapterId]
      }
    })

    // Save quiz completion status
    localStorage.setItem(`chapter_${chapterId}_quiz_completed`, "true")
    setChapterQuizCompleted(true)

    // Check if all chapters are completed to enable final exam
    const allChaptersCompleted = chapters.every((chapter) => [...completedChapters, chapterId].includes(chapter._id))

    if (allChaptersCompleted) {
      setTimeout(() => {
        setShowExam(true)
      }, 1000)
    }
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

  // Change current chapter
  const changeChapter = (chapterId) => {
    const chapter = chapters.find((ch) => ch._id === chapterId)
    if (chapter) {
      setCurrentChapter(chapter)
      navigate(`/course/${courseid}/chapter/${chapterId}`)

      // Reset progress states for new chapter
      setVideoProgress(0)
      setPdfProgress(0)
      setShowPDF(false)

      // Check saved completion status for the new chapter
      checkSavedCompletionStatus(chapterId)
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

  // Calculate course progress
  const calculateCourseProgress = () => {
    if (!chapters.length) return 0
    return Math.round((completedChapters.length / chapters.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading course content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{course?.title}</h1>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <BookOpen className="w-4 h-4 mr-1" />
                <span>{course?.totalChapters} chapters</span>
                <span className="mx-2">•</span>
                <Clock className="w-4 h-4 mr-1" />
                <span>{course?.duration}</span>
                <span className="mx-2">•</span>
                <span>{course?.level}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-blue-700">Course Progress</span>
                  <span className="text-sm text-blue-700">{calculateCourseProgress()}%</span>
                </div>
                <div className="w-32 sm:w-48 bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${calculateCourseProgress()}%` }}
                  ></div>
                </div>
              </div>

              {completedChapters.length === chapters.length && (
                <button
                  onClick={() => setShowExam(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <Award className="w-4 h-4 mr-1.5" />
                  Take Final Exam
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Chapter List */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Chapter Content</h2>

              <div className="space-y-3">
                {chapters.map((chapter, index) => {
                  const isCompleted = completedChapters.includes(chapter._id)
                  const isActive = currentChapter?._id === chapter._id
                  const isLocked = index > 0 && !completedChapters.includes(chapters[index - 1]._id)

                  return (
                    <div
                      key={chapter._id}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 
                        ${isActive ? "bg-blue-50 border border-blue-200" : ""}
                        ${
                          isCompleted
                            ? "bg-green-50 hover:bg-green-100 border border-green-200 text-green-800"
                            : isLocked
                              ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 hover:border-blue-300"
                        }`}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 flex items-center justify-center mr-3 rounded-full bg-gray-100 text-xs font-medium">
                          {index + 1}
                        </div>
                        <button
                          onClick={() => !isLocked && changeChapter(chapter._id)}
                          disabled={isLocked}
                          className={`font-medium text-left ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {chapter.title}
                        </button>
                      </div>

                      {/* Status Indicator */}
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Unlock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-500 space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm mr-2"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-sm mr-2"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-sm mr-2"></div>
                    <span>Locked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {currentChapter ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Video Player Section */}
                <div className="lesson-content">
                  <div className="relative aspect-video w-full">
                    <video
                      className="clip w-full"
                      ref={videoRef}
                      controls
                      autoPlay
                      muted
                      width="100%"
                      height="100%"
                      onTimeUpdate={handleVideoTimeUpdate}
                    >
                      <source src={`http://localhost:5000${currentChapter.video}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Video Progress Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-4 py-2 flex items-center">
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mr-2">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${videoProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center">
                        {videoCompleted && (
                          <span className="text-green-400 flex items-center text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            <span>Completed</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Learning Progress */}
                  <div className="p-4 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-blue-800">Your Learning Progress</h3>
                      <span className="text-sm text-blue-700 font-medium">
                        {Math.round(
                          (videoCompleted ? 50 : videoProgress / 2) +
                            (currentChapter.pdf ? (pdfCompleted ? 50 : pdfProgress / 2) : 50),
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (videoCompleted ? 50 : videoProgress / 2) +
                            (currentChapter.pdf ? (pdfCompleted ? 50 : pdfProgress / 2) : 50)
                          }%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex mt-3 text-sm">
                      <div className="flex items-center mr-4">
                        <div
                          className={`w-3 h-3 rounded-full mr-1 ${videoCompleted ? "bg-green-500" : "bg-blue-400"}`}
                        ></div>
                        <span className={videoCompleted ? "text-green-700" : "text-blue-700"}>
                          Video {videoCompleted ? "Completed" : `${Math.round(videoProgress)}%`}
                        </span>
                      </div>

                      {currentChapter.pdf && (
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-1 ${pdfCompleted ? "bg-green-500" : "bg-blue-400"}`}
                          ></div>
                          <span className={pdfCompleted ? "text-green-700" : "text-blue-700"}>
                            PDF {pdfCompleted ? "Completed" : `${Math.round(pdfProgress)}%`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PDF Button */}
                  {currentChapter.pdf && (
                    <div className="p-4 border-b">
                      <button
                        className={`px-6 py-2 rounded-full font-medium transition-all flex items-center ${
                          showPDF
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        }`}
                        onClick={togglePDF}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {showPDF ? "Hide PDF" : "View Course PDF"}
                        {pdfCompleted && <CheckCircle className="w-4 h-4 ml-2 text-green-500" />}
                      </button>
                    </div>
                  )}

                  {/* PDF Viewer */}
                  {showPDF && currentChapter.pdf && (
                    <div id="pdf-container" className="p-4 border-b">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Course PDF
                          </h3>
                        </div>

                        <SimplePDFViewer
                          pdfUrl={`http://localhost:5000${currentChapter.pdf}`}
                          onProgressChange={handlePDFProgressChange}
                          onComplete={handlePDFComplete}
                        />
                      </div>
                    </div>
                  )}

                  {/* Quiz Button */}
                  <div className="p-6 flex justify-center">
                    {chapterQuizCompleted ? (
                      <div className="text-center">
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center mb-4">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span>You've completed this chapter's quiz!</span>
                        </div>

                        {chapters.indexOf(currentChapter) < chapters.length - 1 ? (
                          <button
                            onClick={() => changeChapter(chapters[chapters.indexOf(currentChapter) + 1]._id)}
                            className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto"
                          >
                            Continue to Next Chapter
                            <ChevronRight className="w-5 h-5 ml-1" />
                          </button>
                        ) : completedChapters.length === chapters.length ? (
                          <button
                            onClick={() => setShowExam(true)}
                            className="py-2 px-6 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center mx-auto"
                          >
                            <Award className="w-5 h-5 mr-1.5" />
                            Take Final Exam
                          </button>
                        ) : (
                          <p className="text-gray-600">Complete all chapters to unlock the final exam.</p>
                        )}
                      </div>
                    ) : (
                      <button
                        className={`py-3 px-8 rounded-full text-lg transform transition duration-300 ease-in-out shadow-lg focus:outline-none flex items-center gap-2 ${
                          canStartQuiz
                            ? "bg-green-500 text-white font-bold hover:bg-green-600 hover:scale-105"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                        }`}
                        onClick={handleStartQuiz}
                        disabled={!canStartQuiz}
                      >
                        <Award className="w-5 h-5" />
                        <span>Start Quiz</span>
                        {canStartQuiz && <span className="animate-pulse">→</span>}
                      </button>
                    )}
                  </div>
                </div>

                {/* Chapter Content */}
                <div className="p-6 border-t">
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">{currentChapter.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{currentChapter.description}</p>

                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">What you'll learn in this chapter</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Core concepts and fundamentals
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Practical implementation techniques
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Best practices and common patterns
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Chapter Selected</h2>
                <p className="text-gray-600 mb-4">Please select a chapter from the sidebar to begin learning.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && (
        <QuizModal
          showQuiz={showQuiz}
          onClose={() => {
            setShowQuiz(false)
            // Mark chapter as completed when quiz is closed (in a real app, this would happen after passing the quiz)
            handleCompleteChapter(currentChapter._id)
          }}
          chapterId={currentChapter?._id}
        />
      )}

      {/* Exam Modal */}
      {showExam && <ExamModal showExam={showExam} onClose={() => setShowExam(false)} courseId={courseid} />}
    </div>
  )
}

export default CourseLearningPlatform

