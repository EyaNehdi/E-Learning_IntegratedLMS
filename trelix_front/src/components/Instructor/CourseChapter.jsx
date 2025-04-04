"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useOutletContext, useParams } from "react-router-dom"

function CourseChapter() {
  const [chapters, setChapters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, profile, setProfile, completion } = useOutletContext()
  const [expandedRows, setExpandedRows] = useState({})
  const maxLength = 50
  const { courseId } = useParams() // Get courseId from URL

  useEffect(() => {
    const fetchChapters = async () => {
      console.log("Course ID:", courseId) // Add this line to check the courseId
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

  const toggleExpand = (chapterId) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [chapterId]: !prevState[chapterId],
    }))
  }

  const handleDelete = async (id) => {
    try {
      // Send DELETE request to the backend
      const response = await axios.delete(`http://localhost:5000/chapter/delete/${id}`)

      // If deletion was successful, update the state to remove the deleted chapter
      if (response.status === 200) {
        setChapters((prevChapters) => prevChapters.filter((chapter) => chapter._id !== id))
        alert("Chapter deleted successfully")
      }
    } catch (error) {
      console.error("Error deleting chapter:", error)
      alert("Error deleting chapter")
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
            <ul className="nav nav-tabs mb-4" id="myTab" role="tablist">
              <li className="nav-item">
                <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#afficter">
                  <i className="feather-icon icon-book me-2"></i>
                  Chapters Assigned to This Course
                </button>
              </li>
            </ul>

            <div className="tab-content" id="myTabContent">
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
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CourseChapter

