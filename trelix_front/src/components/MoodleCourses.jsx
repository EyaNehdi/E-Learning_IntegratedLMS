"use client"

import { useEffect, useState } from "react"
import {
  BookOpen,
  FileText,
  Link,
  ClipboardEdit,
  MessageSquare,
  HelpCircle,
  Search,
  Bell,
  User,
  ChevronRight,
  Calendar,
  CheckCircle,
  Clock,
  Menu,
  X,
  Bookmark,
  Award,
  Settings,
  ArrowLeft,
  ExternalLink,
  BookMarked,
  GraduationCap,
  Info,
} from "lucide-react"
import "./moodle-courses.css"

function MoodleCourses() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [courseContents, setCourseContents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isContentLoading, setIsContentLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("content") // content, info, grades

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_PROXY}/api/courses`)
        if (!response.ok) throw new Error("Failed to fetch courses")

        const data = await response.json()

        // Ensure we only set array data
        if (Array.isArray(data)) {
          setCourses(data)
        } else {
          console.error("Expected an array, got:", data)
          setCourses([])
        }
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError("Failed to load courses. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const fetchCourseContents = async (courseId) => {
    setIsContentLoading(true)
    setSelectedCourseId(courseId)
    setMobileMenuOpen(false) // Close mobile menu when selecting a course

    // Find the selected course to display its details
    const course = courses.find((c) => c.id === courseId)
    setSelectedCourse(course)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_PROXY}/api/courses/${courseId}/contents`)
      if (!response.ok) throw new Error("Failed to fetch course contents")
      const data = await response.json()
      setCourseContents(data)
    } catch (err) {
      console.error("Error fetching course contents:", err)
      setError("Failed to load course contents. Please try again.")
    } finally {
      setIsContentLoading(false)
    }
  }

  // Filter courses based on search query
  const filteredCourses = courses.filter(
    (course) =>
      course.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.shortname && course.shortname.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Function to determine icon based on module type
  const getModuleIcon = (modname) => {
    switch (modname) {
      case "resource":
        return <FileText className="w-5 h-5" />
      case "url":
        return <Link className="w-5 h-5" />
      case "assign":
        return <ClipboardEdit className="w-5 h-5" />
      case "forum":
        return <MessageSquare className="w-5 h-5" />
      case "quiz":
        return <HelpCircle className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Header - visible on all screens */}
      <header className="bg-white border-b border-slate-200 shadow-sm py-3 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden mr-3 p-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-slate-600" /> : <Menu className="h-5 w-5 text-slate-600" />}
          </button>
          <div className="flex items-center">
            <GraduationCap className="h-7 w-7 text-teal-600 mr-2" />
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">TrelixMoodle</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors relative" aria-label="Notifications">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-teal-500 rounded-full"></span>
          </button>
          <button className="flex items-center space-x-2 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <User className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700 hidden sm:block">My Account</span>
          </button>
        </div>
      </header>

      {/* Mobile search - only visible on small screens */}
      <div className="md:hidden px-4 py-3 bg-white border-b border-slate-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-teal-500 focus:border-teal-500 text-sm transition-colors"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile unless menu is open */}
        <aside
          className={`${
            mobileMenuOpen ? "block" : "hidden"
          } md:block w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0 transition-all duration-300 ease-in-out z-20 md:relative absolute inset-0`}
        >
          <div className="sticky top-0 bg-white z-10 border-b border-slate-200 p-4">
            <div className="hidden md:flex items-center flex-1 max-w-md mx-auto">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-teal-500 focus:border-teal-500 text-sm transition-colors"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">My Courses</h2>
              <button className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors flex items-center">
                <span>View All</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>

            {/* Course list */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center p-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-200 mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="space-y-2.5">
                {filteredCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => fetchCourseContents(course.id)}
                    className={`text-left p-3.5 rounded-xl flex items-center transition-all duration-200 min-w-[250px] w-full ${
                      selectedCourseId === course.id
                        ? "bg-teal-50 border border-teal-100 shadow-sm"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 mr-3.5 ${
                        selectedCourseId === course.id ? "bg-teal-600 text-white" : "bg-teal-100 text-teal-600"
                      }`}
                    >
                      {course.shortname ? course.shortname.charAt(0) : course.fullname.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p
                        className={`font-medium truncate ${selectedCourseId === course.id ? "text-teal-700" : "text-slate-800"}`}
                      >
                        {course.fullname}
                      </p>
                      {course.shortname && <p className="text-xs text-slate-500 truncate mt-0.5">{course.shortname}</p>}
                    </div>
                    {selectedCourseId === course.id && <ChevronRight className="w-5 h-5 ml-auto text-teal-600" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-slate-50 rounded-xl">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-slate-700 font-medium mb-1">No courses found</h3>
                <p className="text-slate-500 text-sm">
                  {searchQuery ? "Try a different search term" : "You don't have any courses yet"}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-xs font-medium text-red-700 hover:text-red-600 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedCourseId ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
              {/* Course header */}
              {selectedCourse && (
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => setSelectedCourseId(null)}
                        className="mr-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors md:hidden"
                        aria-label="Back to courses"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-2xl font-bold">{selectedCourse.fullname}</h2>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Bookmark course"
                      >
                        <Bookmark className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Course settings"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {selectedCourse.summary && <p className="mt-2 text-teal-50 text-sm">{selectedCourse.summary}</p>}

                  {/* Course tabs */}
                  <div className="flex mt-6 border-b border-teal-500/30">
                    <button
                      className={`px-4 py-2.5 text-sm font-medium flex items-center ${
                        activeTab === "content"
                          ? "border-b-2 border-white text-white"
                          : "text-teal-100 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("content")}
                    >
                      <BookMarked className="w-4 h-4 mr-2" />
                      Course Content
                    </button>
                    <button
                      className={`px-4 py-2.5 text-sm font-medium flex items-center ${
                        activeTab === "info" ? "border-b-2 border-white text-white" : "text-teal-100 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("info")}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Information
                    </button>
                    <button
                      className={`px-4 py-2.5 text-sm font-medium flex items-center ${
                        activeTab === "grades" ? "border-b-2 border-white text-white" : "text-teal-100 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("grades")}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Grades
                    </button>
                  </div>
                </div>
              )}

              {/* Course content */}
              {isContentLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i}>
                        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-3">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="h-14 bg-slate-200 rounded-lg"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  {activeTab === "content" && (
                    <>
                      {Array.isArray(courseContents) && courseContents.length > 0 ? (
                        <div className="space-y-8">
                          {courseContents.map((section) => (
                            <div
                              key={section.id}
                              className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm"
                            >
                              <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-800">{section.name}</h3>
                                {section.summary && (
                                  <div
                                    className="mt-1 text-sm text-slate-600"
                                    dangerouslySetInnerHTML={{ __html: section.summary }}
                                  />
                                )}
                              </div>

                              {section.modules && section.modules.length > 0 ? (
                                <ul className="divide-y divide-slate-100">
                                  {section.modules.map((mod) => (
                                    <li key={mod.id} className="hover:bg-slate-50 transition-colors">
                                      <a
                                        href={mod.url || "#"}
                                        target={mod.url ? "_blank" : ""}
                                        rel="noreferrer"
                                        className="px-5 py-4 flex items-center group"
                                      >
                                        <div
                                          className={`p-2.5 rounded-lg mr-4 transition-colors ${
                                            mod.completionstate
                                              ? "bg-green-100 text-green-600"
                                              : "bg-teal-100 text-teal-600"
                                          }`}
                                        >
                                          {getModuleIcon(mod.modname)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                                            {mod.name}
                                          </p>
                                          <p className="text-xs text-slate-500 mt-1 flex items-center">
                                            <span className="capitalize">{mod.modname}</span>
                                            {mod.modplural && <span className="mx-1">•</span>}
                                            {mod.modplural}
                                          </p>
                                        </div>
                                        {mod.url && (
                                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                        {mod.completionstate !== undefined && (
                                          <div className="ml-4 flex-shrink-0">
                                            {mod.completionstate ? (
                                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                Completed
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                <Clock className="w-3.5 h-3.5 mr-1" />
                                                Pending
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="p-5 text-center text-slate-500 text-sm">
                                  <p>No content in this section</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 px-4">
                          <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                          <h3 className="text-xl font-medium text-slate-800 mb-2">No content available</h3>
                          <p className="text-slate-500 max-w-md mx-auto">
                            This course doesn't have any content yet. Check back later or contact your instructor for
                            more information.
                          </p>
                          <button className="mt-6 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm font-medium">
                            Contact Instructor
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === "info" && (
                    <div className="max-w-3xl mx-auto">
                      <div className="bg-teal-50 rounded-lg p-5 mb-6 border border-teal-100">
                        <h3 className="text-lg font-medium text-teal-800 mb-2">Course Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500 mb-1">Course Name</p>
                            <p className="font-medium text-slate-900">{selectedCourse?.fullname}</p>
                          </div>
                          {selectedCourse?.shortname && (
                            <div>
                              <p className="text-slate-500 mb-1">Course Code</p>
                              <p className="font-medium text-slate-900">{selectedCourse.shortname}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-slate-500 mb-1">Category</p>
                            <p className="font-medium text-slate-900">General</p>
                          </div>
                          <div>
                            <p className="text-slate-500 mb-1">Format</p>
                            <p className="font-medium text-slate-900">Topics format</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-5 border border-slate-200 mb-6">
                        <h3 className="text-lg font-medium text-slate-800 mb-3">Course Description</h3>
                        <p className="text-slate-600">
                          {selectedCourse?.summary || "No description available for this course."}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-5 border border-slate-200">
                        <h3 className="text-lg font-medium text-slate-800 mb-3">Instructors</h3>
                        <div className="flex items-center p-4 bg-slate-50 rounded-lg">
                          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-lg">
                            P
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-slate-900">Professor Smith</p>
                            <p className="text-sm text-slate-500">smith@example.edu</p>
                          </div>
                          <button className="ml-auto bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                            Contact
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "grades" && (
                    <div className="max-w-3xl mx-auto">
                      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                          <h3 className="font-medium text-slate-800">Your Grades</h3>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-6 bg-teal-50 p-4 rounded-lg border border-teal-100">
                            <div>
                              <h4 className="text-xl font-bold text-slate-800">Overall Grade</h4>
                              <p className="text-slate-500 text-sm">Based on completed assignments</p>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-teal-600">85%</div>
                              <p className="text-sm text-slate-500">B</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                              <div>
                                <p className="font-medium text-slate-800">Quiz 1: Introduction</p>
                                <p className="text-xs text-slate-500">Submitted on May 15, 2023</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-slate-800">90%</p>
                                <p className="text-xs text-slate-500">9/10 points</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                              <div>
                                <p className="font-medium text-slate-800">Assignment 1: Research Paper</p>
                                <p className="text-xs text-slate-500">Submitted on May 22, 2023</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-slate-800">80%</p>
                                <p className="text-xs text-slate-500">40/50 points</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                              <div>
                                <p className="font-medium text-slate-800">Midterm Exam</p>
                                <p className="text-xs text-slate-500">Not yet submitted</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-slate-500">--</p>
                                <p className="text-xs text-slate-500">0/100 points</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center max-w-3xl mx-auto">
              <div className="bg-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to TrelixMoodle</h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Your personalized learning platform. Select a course from the list to view its contents and start
                learning.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                <a
                  href="https://trelix.moodlecloud.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit MoodleCloud Platform
                </a>
                <button className="px-5 py-2.5 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 rounded-lg transition-colors text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default MoodleCourses
