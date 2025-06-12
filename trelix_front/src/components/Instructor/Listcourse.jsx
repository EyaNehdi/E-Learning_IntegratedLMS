"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useOutletContext } from "react-router-dom"

function Listcourse() {
  const [courses, setCourses] = useState([])
  const navigate = useNavigate()
  const { user } = useOutletContext()

  // Fonction pour récupérer les cours
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_PROXY}/course/courses`)
      console.log("Cours récupérés:", response.data)
      setCourses(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des cours:", error)
      alert("Erreur lors de la récupération des cours")
    }
  }

  useEffect(() => {
    fetchCourses() // Charger les cours au montage du composant
  }, [])

  // Fonction pour rediriger vers la page d'édition du cours
  const handleEdit = (courseId) => {
    navigate(`/profile/edit-course/${courseId}`)
  }

  // Fonction pour supprimer un cours
  const handleDelete = async (courseId) => {
    const confirmDelete = window.confirm("Do you really want to delete this course ?")
    if (!confirmDelete) return

    try {
      await axios.delete(`${import.meta.env.VITE_API_PROXY}/course/delete/${courseId}`)

      setCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseId))
      alert("Course successfully deleted !")
    } catch (error) {
      console.error("Error deleting course :", error)
      alert("Error deleting course")
    }
  }

  // Styles pour les boutons
  const editButtonStyle = {
    backgroundColor: "#f0f7ff",
    color: "#3b82f6",
    border: "1px solid #dbeafe",
    borderRadius: "4px",
    padding: "4px 12px",
    fontSize: "13px",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "none",
    marginRight: "8px",
  }

  const deleteButtonStyle = {
    backgroundColor: "#fff1f2",
    color: "#ef4444",
    border: "1px solid #fee2e2",
    borderRadius: "4px",
    padding: "4px 12px",
    fontSize: "13px",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "none",
  }

  // Style pour le prix
  const priceStyle = {
    fontSize: "16px",
    fontWeight: "700",
    color: "#2563eb", // Bleu
    display: "flex",
    alignItems: "center",
  }

  // Style pour l'icône de pièce de monnaie
  const coinIconStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    backgroundColor: "#f59e0b", // Couleur or/jaune
    borderRadius: "50%",
    marginRight: "8px",
    border: "2px solid #fbbf24", // Bordure légèrement plus claire
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    position: "relative",
    overflow: "hidden",
  }

  // Style pour le symbole dollar à l'intérieur de la pièce
  const dollarSymbolStyle = {
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
  }

  // Style pour le header avec le bouton centré
  const headerStyle = {
    position: "relative",
    backgroundColor: "white",
    padding: "20px 0",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "30px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }

  // Style pour le bouton Add New Course
  const addButtonStyle = {
    background: "linear-gradient(-45deg, #4169E1, #6a5acd, #4682b4, #1e90ff)",
    backgroundSize: "400% 400%",
    animation: "gradient 5s ease infinite",
    color: "white",
    padding: "10px 20px",
    borderRadius: "50px",
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "bold",
    boxShadow: "0 4px 15px rgba(65, 105, 225, 0.3)",
    border: "none",
    cursor: "pointer",
  }

  return (
    <section className="dashboard-sec course-dash">
      {/* Header avec le bouton centré */}
      <div style={headerStyle}>
        <a href="/profile/wizard" style={addButtonStyle} className="custom-btn">
          <i className="feather-icon icon-plus" style={{ marginRight: "8px" }}></i>
          Add New Course
        </a>
      </div>

      <div className="tab-content inner-sec" id="myTabContent">
        <div className="tab-pane fade show active" id="home" role="tabpanel">
          <div className="row g-4">
            {courses.length > 0 ? (
              courses
                .filter((course) => course.user === user._id)
                .map((course) => (
                  <div key={course._id} className="col-xl-4 col-sm-6" style={{ width: "fit-content" }}>
                    <div className="course-entry-3 card rounded-2 bg-info border shadow-1">
                      <div className="card-media position-relative">
                        <a href={`/profile/course-chapter/${course.slug}`}>
                          <img className="card-img-top" src="/assets/images/course.png" alt={course.title} />
                        </a>
                      </div>
                      <div className="card-body p-3" style={{ backgroundColor: "white" }}>
                        <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                          {/* Affichage de la catégorie avec l'icône appropriée */}
                          <div className="d-flex align-items-center">
                            <i className="feather-icon icon-book me-2" />
                            {course.categorie || "Non catégorisé"}
                          </div>
                          <span>
                            <i className="feather-icon icon-layers me-2" />
                            {course.level}
                          </span>
                        </div>
                        <h3 className="sub-title my-3">
                          <a href={`/profile/course-chapter/${course.slug}`}>{course.title}</a>
                        </h3>
                        <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                          <div style={priceStyle}>
                            <span style={coinIconStyle}>
                              <span style={dollarSymbolStyle}>$</span>
                            </span>
                            {course.price ? `${course.price} ` : "Free"}
                          </div>

                          <div className="d-flex gap-2">
                            <a
                              style={editButtonStyle}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = "#dbeafe"
                                e.target.style.color = "#2563eb"
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = "#f0f7ff"
                                e.target.style.color = "#3b82f6"
                              }}
                              onClick={() => handleEdit(course._id)}
                            >
                              <i
                                className="feather-icon icon-edit"
                                style={{ marginRight: "6px", fontSize: "12px" }}
                              ></i>
                              Edit
                            </a>

                            <a
                              style={deleteButtonStyle}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = "#fee2e2"
                                e.target.style.color = "#dc2626"
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = "#fff1f2"
                                e.target.style.color = "#ef4444"
                              }}
                              onClick={() => handleDelete(course._id)}
                            >
                              <i
                                className="feather-icon icon-trash"
                                style={{ marginRight: "6px", fontSize: "12px" }}
                              ></i>
                              Delete
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p>Aucun cours disponible.</p>
            )}
          </div>
        </div>
      </div>

      {/* Animation pour le bouton */}
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </section>
  )
}

export default Listcourse
