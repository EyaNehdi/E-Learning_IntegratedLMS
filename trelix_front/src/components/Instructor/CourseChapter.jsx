"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useOutletContext, useParams } from "react-router-dom"
import { Search, Plus, Trash2, Edit, FileText, Video, Link2, Calendar } from "lucide-react"

function CourseChapter() {
  const [chapters, setChapters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, profile, setProfile, completion } = useOutletContext()
  const [expandedRows, setExpandedRows] = useState({})
  const maxLength = 50
  const { courseId } = useParams() // Get courseId from URL
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(courseId || "") // Set default to courseId
  const [selectedChapters, setSelectedChapters] = useState([])

  // Fetch chapters for the course
  useEffect(() => {
    const fetchChapters = async () => {
      console.log("Course ID:", courseId)
      if (!courseId) {
        console.error("Course ID is not defined")
        setError("Course ID is not defined")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await axios.get(`http://localhost:5000/chapter/course/${courseId}`)
        setChapters(response.data.chapters)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching chapters:", error)
        setError("Failed to load chapters. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchChapters()
  }, [courseId])

  // Fetch all courses for assignment
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/course/courses")
        setCourses(response.data)
      } catch (error) {
        console.error("Error fetching courses:", error)
      }
    }

    fetchCourses()
  }, [])

  // Fetch all chapters for assignment
  useEffect(() => {
    const fetchAllChapters = async () => {
      try {
        const response = await axios.get("http://localhost:5000/chapter/get")
        setChapters(response.data)
      } catch (error) {
        console.error("Error fetching chapters:", error)
      }
    }

    fetchAllChapters()
  }, [])

  const toggleExpand = (chapterId) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [chapterId]: !prevState[chapterId],
    }))
  }

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/chapter/delete/${id}`)
      if (response.status === 200) {
        setChapters((prevChapters) => prevChapters.filter((chapter) => chapter._id !== id))
        alert("Chapter deleted successfully")
      }
    } catch (error) {
      console.error("Error deleting chapter:", error)
      alert("Error deleting chapter")
    }
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

  // Handle chapter assignment
  const handleAssign = async () => {
    try {
      const response = await axios.post("http://localhost:5000/chapter/assign-chapters", {
        courseId: selectedCourse,
        chapters: selectedChapters,
      })

      alert("Chapters assigned successfully!")
      setSelectedCourse(courseId || "") // Reset to current courseId after assignment
      setSelectedChapters([])
    } catch (error) {
      console.error("Error assigning chapters:", error.response?.data || error.message)
      alert("Error assigning chapters")
    }
  }

  const filteredChapters = chapters.filter((chapter) => chapter.userid === user._id)

  return (
    <section className="dashboard-sec">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="display-5 border-bottom pb-3 mb-0">Course Chapters</h2>
          <div className="badge bg-primary p-2 fs-6">{filteredChapters.length} Chapters</div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading chapters...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            <i className="feather-icon icon-alert-circle me-2"></i>
            {error}
          </div>
        ) : (
          <div className="course-tab">
            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-4" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active btn btn-outline-primary d-flex align-items-center gap-3 px-5 py-3 w-full max-w-md text-left"
                  id="assign-tab"
                  type="button"
                  data-bs-toggle="tab"
                  data-bs-target="#afficter"
                  role="tab"
                  aria-controls="afficter"
                  aria-selected="true"
                  style={{ backgroundColor: "#f8f9fa", borderRadius: "0.375rem", height: "50px", width: "100%" }}
                >
                  <i className="feather-icon icon-book flex-shrink-0"></i>
                  <span className="text-truncate">View Assigned Chapters</span>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link btn btn-outline-primary d-flex align-items-center gap-3 px-5 py-3 w-full max-w-md text-left"
                  id="add-chapter-tab"
                  type="button"
                  data-bs-toggle="tab"
                  data-bs-target="#add-chapter"
                  role="tab"
                  aria-controls="add-chapter"
                  aria-selected="false"
                  style={{ backgroundColor: "#f8f9fa", borderRadius: "0.375rem", height: "50px", width: "100%" }}
                >
                  <i className="feather-icon icon-plus-circle flex-shrink-0"></i>
                  <span className="text-truncate">Add Chapter</span>
                </button>
              </li>
            </ul>

            <div className="tab-content" id="myTabContent">
              {/* View Assigned Chapters Tab */}
              <div className="tab-pane fade show active" id="afficter" role="tabpanel">
                {filteredChapters.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded">
                    <i className="feather-icon icon-book-open" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
                    <h4 className="mt-3">No Chapters Found</h4>
                    <p className="text-muted">There are no chapters assigned to this course yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Title</th>
                          <th style={{ width: "30%" }}>Description</th>
                          <th>Resources</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredChapters.map((chapter) => (
                          <tr key={chapter._id} className="align-middle">
                            <td>
                              <div className="d-flex flex-column">
                                <a href="#" className="text-reset fw-bold mb-1">
                                  {chapter.title}
                                </a>
                                <small className="text-muted">
                                  <i className="feather-icon icon-calendar me-1"></i>
                                  {chapter.createdAt ? new Date(chapter.createdAt).toLocaleDateString() : "N/A"}
                                </small>
                              </div>
                            </td>
                            <td style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                              {chapter.description.length > maxLength && !expandedRows[chapter._id] ? (
                                <>
                                  {chapter.description.substring(0, maxLength)}...
                                  <button
                                    onClick={() => toggleExpand(chapter._id)}
                                    className="btn btn-sm btn-link p-0 ms-1"
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
                                      className="btn btn-sm btn-link p-0 ms-1"
                                    >
                                      Show Less
                                    </button>
                                  )}
                                </>
                              )}
                            </td>
                            <td>
                              <div className="d-flex flex-column gap-2">
                                {chapter.video ? (
                                  <a
                                    href={`http://localhost:5000${chapter.video}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-primary"
                                  >
                                    <i className="feather-icon icon-video me-1"></i> View Video
                                  </a>
                                ) : (
                                  <span className="text-muted small">
                                    <i className="feather-icon icon-video-off me-1"></i> No Video
                                  </span>
                                )}

                                {chapter.pdf ? (
                                  <a
                                    href={`http://localhost:5000${chapter.pdf}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-danger"
                                  >
                                    <i className="feather-icon icon-file-text me-1"></i> View PDF
                                  </a>
                                ) : (
                                  <span className="text-muted small">
                                    <i className="feather-icon icon-file-minus me-1"></i> No PDF
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="badge bg-success p-2">Completed</div>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-outline-primary" title="Edit">
                                  <i className="feather-icon icon-edit"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete"
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this chapter?")) {
                                      handleDelete(chapter._id)
                                    }
                                  }}
                                >
                                  <i className="feather-icon icon-trash-2"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add Chapter Tab with Assign Chapters */}
              <div className="tab-pane fade" id="add-chapter" role="tabpanel">
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
                              <option key={course._id} value={course._id}>
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
                        disabled={!selectedCourse || selectedChapters.length === 0}
                        className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          !selectedCourse || selectedChapters.length === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
                        }`}
                      >
                        <span className="flex items-center">
                          <Link2 className="w-5 h-5 mr-2" />
                          Assign Chapters to Course
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CourseChapter