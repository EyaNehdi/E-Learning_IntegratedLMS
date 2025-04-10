"use client"

import { useEffect, useState } from "react"

function MoodleCourses() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [courseContents, setCourseContents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isContentLoading, setIsContentLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)

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

  // Function to determine icon based on module type
  const getModuleIcon = (modname) => {
    switch (modname) {
      case "resource":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        )
      case "url":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        )
      case "assign":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        )
      case "forum":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )
      case "quiz":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        )
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Moodle-like header */}
      <header className="bg-[#0f6cbf] text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Moodle Learning Platform</h1>
          <div className="flex items-center space-x-4">
            <button className="bg-[#0a5699] hover:bg-[#084a87] px-3 py-1 rounded text-sm">Dashboard</button>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0f6cbf] font-bold">
              U
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Course list sidebar */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#f8f9fa] border-b px-4 py-3">
                <h2 className="font-bold text-[#0f6cbf]">My Courses</h2>
              </div>

              {isLoading ? (
                <div className="p-4">
                  <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : courses.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {Array.isArray(courses) &&
                    courses.map((course) => (
                      <li
                        key={course.id}
                        className={`hover:bg-gray-50 ${selectedCourseId === course.id ? "bg-blue-50" : ""}`}
                      >
                        <button
                          onClick={() => fetchCourseContents(course.id)}
                          className="w-full text-left px-4 py-3 flex items-center"
                        >
                          <div className="w-8 h-8 rounded-md bg-[#0f6cbf] text-white flex items-center justify-center mr-3 flex-shrink-0">
                            {course.shortname ? course.shortname.charAt(0) : course.fullname.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium truncate">{course.fullname}</p>
                            {course.shortname && <p className="text-xs text-gray-500">{course.shortname}</p>}
                          </div>
                        </button>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No courses available</p>
                </div>
              )}
            </div>
          </div>

          {/* Course content area */}
          <div className="md:w-2/3 lg:w-3/4">
            {selectedCourseId ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Course header */}
                {selectedCourse && (
                  <div className="bg-[#f8f9fa] border-b px-6 py-4">
                    <h2 className="text-xl font-bold text-[#0f6cbf]">{selectedCourse.fullname}</h2>
                    {selectedCourse.summary && <p className="mt-1 text-gray-600 text-sm">{selectedCourse.summary}</p>}
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
                              <div key={j} className="h-10 bg-gray-200 rounded"></div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    {Array.isArray(courseContents) && courseContents.length > 0 ? (
                      <div className="space-y-8">
                        {courseContents.map((section) => (
                          <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-[#f8f9fa] px-4 py-3 border-b">
                              <h3 className="font-medium">{section.name}</h3>
                              {section.summary && (
                                <div
                                  className="mt-1 text-sm text-gray-600"
                                  dangerouslySetInnerHTML={{ __html: section.summary }}
                                />
                              )}
                            </div>

                            {section.modules && section.modules.length > 0 ? (
                                
                              <ul className="divide-y divide-gray-200">
                                {section.modules.map((mod) => (
                                  <li key={mod.id} className="hover:bg-gray-50">
                                    <a
                                      href={mod.url || "#"}
                                      target={mod.url ? "_blank" : ""}
                                      rel="noreferrer"
                                      className="px-4 py-3 flex items-center"
                                    >
                                      <div className="text-[#0f6cbf] mr-3">{getModuleIcon(mod.modname)}</div>
                                      <div>
                                        <p className="font-medium">{mod.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">
                                          {mod.modname} {mod.modplural && `- ${mod.modplural}`}
                                        </p>
                                      </div>
                                      {mod.completionstate !== undefined && (
                                        <div className="ml-auto">
                                          {mod.completionstate ? (
                                            <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              >
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                              </svg>
                                            </div>
                                          ) : (
                                            <div className="w-5 h-5 border border-gray-300 rounded-full"></div>
                                          )}
                                        </div>
                                      )}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                <p>No content in this section</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className="text-[#0f6cbf] mb-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mx-auto"
                          >
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium">No content available</h3>
                        <p className="text-gray-500 mt-1">This course doesn't have any content yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-10 text-center">
                <div className="text-[#0f6cbf] mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="60"
                    height="60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-700">Welcome to Your Moodle Courses</h2>
                <p className="text-gray-500 mt-2">Select a course from the list to view its contents</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoodleCourses
