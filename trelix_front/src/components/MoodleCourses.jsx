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
  Home,
  Bookmark,
  Award,
  Settings,
} from "lucide-react"

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
        const response = await fetch("http://localhost:5000/api/courses")
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
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/contents`)
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
    <div className="bg-gray-50 min-h-screen flex flex-col">
     

      {/* Mobile search - only visible on small screens */}
      <div className="md:hidden px-4 py-2 bg-white border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
          } md:block w-full md:w-72 lg:w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 transition-all duration-300 ease-in-out z-20 md:relative absolute inset-0`}
        >
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">My Courses</h2>

            {/* Navigation */}
           

            {/* Course list */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center p-3">
                    <div className="w-10 h-10 rounded-md bg-gray-200 mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="space-y-2">
                {filteredCourses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => fetchCourseContents(course.id)}
                    className={` text-left p-3 rounded-lg flex items-center transition-colors min-w-[250px] ${
                      selectedCourseId === course.id
                        ? "bg-indigo-50 border border-indigo-100"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 mr-3 ${
                        selectedCourseId === course.id ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      {course.shortname ? course.shortname.charAt(0) : course.fullname.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p
                        className={`font-medium truncate ${selectedCourseId === course.id ? "text-indigo-700" : "text-gray-800"}`}
                      >
                        {course.fullname}
                      </p>
                      {course.shortname && <p className="text-xs text-gray-500 truncate">{course.shortname}</p>}
                    </div>
                    {selectedCourseId === course.id && <ChevronRight className="w-5 h-5 ml-auto text-indigo-600" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-gray-500 font-medium mb-1">No courses found</h3>
                <p className="text-gray-400 text-sm">
                  {searchQuery ? "Try a different search term" : "You don't have any courses yet"}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
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
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              {/* Course header */}
              {selectedCourse && (
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{selectedCourse.fullname}</h2>
                    <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                  {selectedCourse.summary && <p className="mt-2 text-indigo-100 text-sm">{selectedCourse.summary}</p>}

                  {/* Course tabs */}
                  <div className="flex mt-6 border-b border-indigo-500/30">
                    <button
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === "content"
                          ? "border-b-2 border-white text-white"
                          : "text-indigo-200 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("content")}
                    >
                      Course Content
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === "info" ? "border-b-2 border-white text-white" : "text-indigo-200 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("info")}
                    >
                      Information
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === "grades"
                          ? "border-b-2 border-white text-white"
                          : "text-indigo-200 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("grades")}
                    >
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
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-3">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="h-14 bg-gray-200 rounded"></div>
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
                              className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                            >
                              <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800">{section.name}</h3>
                                {section.summary && (
                                  <div
                                    className="mt-1 text-sm text-gray-600"
                                    dangerouslySetInnerHTML={{ __html: section.summary }}
                                  />
                                )}
                              </div>

                              {section.modules && section.modules.length > 0 ? (
                                <ul className="divide-y divide-gray-100">
                                  {section.modules.map((mod) => (
                                    <li key={mod.id} className="hover:bg-gray-50 transition-colors">
                                      <a
                                        href={mod.url || "#"}
                                        target={mod.url ? "_blank" : ""}
                                        rel="noreferrer"
                                        className="px-5 py-4 flex items-center"
                                      >
                                        <div
                                          className={`p-2 rounded-lg mr-4 ${
                                            mod.completionstate
                                              ? "bg-green-100 text-green-600"
                                              : "bg-indigo-100 text-indigo-600"
                                          }`}
                                        >
                                          {getModuleIcon(mod.modname)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-gray-900 truncate">{mod.name}</p>
                                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                                            <span className="capitalize">{mod.modname}</span>
                                            {mod.modplural && <span className="mx-1">•</span>}
                                            {mod.modplural}
                                          </p>
                                        </div>
                                        {mod.completionstate !== undefined && (
                                          <div className="ml-4 flex-shrink-0">
                                            {mod.completionstate ? (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Completed
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                <Clock className="w-3 h-3 mr-1" />
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
                                <div className="p-5 text-center text-gray-500 text-sm">
                                  <p>No content in this section</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 px-4">
                          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                          <h3 className="text-xl font-medium text-gray-800 mb-2">No content available</h3>
                          <p className="text-gray-500 max-w-md mx-auto">
                            This course doesn't have any content yet. Check back later or contact your instructor for
                            more information.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === "info" && (
                    <div className="max-w-3xl mx-auto">
                      <div className="bg-indigo-50 rounded-lg p-5 mb-6 border border-indigo-100">
                        <h3 className="text-lg font-medium text-indigo-800 mb-2">Course Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Course Name</p>
                            <p className="font-medium text-gray-900">{selectedCourse?.fullname}</p>
                          </div>
                          {selectedCourse?.shortname && (
                            <div>
                              <p className="text-gray-500 mb-1">Course Code</p>
                              <p className="font-medium text-gray-900">{selectedCourse.shortname}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-500 mb-1">Category</p>
                            <p className="font-medium text-gray-900">General</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Format</p>
                            <p className="font-medium text-gray-900">Topics format</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-5 border border-gray-200 mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Course Description</h3>
                        <p className="text-gray-600">
                          {selectedCourse?.summary || "No description available for this course."}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-5 border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Instructors</h3>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                            P
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">Professor Smith</p>
                            <p className="text-sm text-gray-500">smith@example.edu</p>
                          </div>
                          <button className="ml-auto bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 transition-colors">
                            Contact
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "grades" && (
                    <div className="max-w-3xl mx-auto">
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                          <h3 className="font-medium text-gray-800">Your Grades</h3>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h4 className="text-xl font-bold text-gray-800">Overall Grade</h4>
                              <p className="text-gray-500 text-sm">Based on completed assignments</p>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-indigo-600">85%</div>
                              <p className="text-sm text-gray-500">B</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-800">Quiz 1: Introduction</p>
                                <p className="text-xs text-gray-500">Submitted on May 15, 2023</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-800">90%</p>
                                <p className="text-xs text-gray-500">9/10 points</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-800">Assignment 1: Research Paper</p>
                                <p className="text-xs text-gray-500">Submitted on May 22, 2023</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-800">80%</p>
                                <p className="text-xs text-gray-500">40/50 points</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-800">Midterm Exam</p>
                                <p className="text-xs text-gray-500">Not yet submitted</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-500">--</p>
                                <p className="text-xs text-gray-500">0/100 points</p>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-3xl mx-auto">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to TrelixMoodle</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Your personalized learning platform. Select a course from the list to view its contents and start
                learning.
              </p>
              
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default MoodleCourses
