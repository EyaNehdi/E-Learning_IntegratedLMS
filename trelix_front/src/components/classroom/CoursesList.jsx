"use client"

import { useEffect, useState } from "react"
import { getAllCourses } from "../../services/googleClassroom.service"
import "./CoursesList.css" // Nous allons créer ce fichier CSS

const CoursesList = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fonction pour générer une couleur aléatoire cohérente basée sur l'ID du cours
  const generateColor = (courseId) => {
    const colors = [
      "#1E88E5", // bleu
      "#43A047", // vert
      "#E53935", // rouge
      "#FB8C00", // orange
      "#8E24AA", // violet
      "#3949AB", // indigo
      "#00ACC1", // cyan
      "#5E35B1", // violet foncé
      "#1565C0", // bleu foncé
      "#00897B", // teal
    ]

    // Utiliser les caractères de l'ID pour choisir une couleur
    const sum = courseId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[sum % colors.length]
  }

  // Fonction pour extraire les initiales d'un nom
  const getInitials = (name) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const coursesData = await getAllCourses()
        setCourses(coursesData)
      } catch (err) {
        setError("Erreur lors de la récupération des cours")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des cours...</p>
      </div>
    )
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (courses.length === 0) {
    return <div className="no-courses">Aucun cours trouvé dans votre compte Google Classroom.</div>
  }

  return (
    <div className="classroom-container">
      <h1 className="classroom-title">Mes cours Google Classroom</h1>

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card" style={{ backgroundColor: generateColor(course.id) }}>
            <div className="course-header">
              <h2 className="course-title">{course.name}</h2>
              <button className="course-menu-button">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>

            <div className="course-section">{course.section}</div>
            <div className="course-teacher">
              {course.teacherGroupEmail ? course.teacherGroupEmail.split("@")[0] : "Enseignant"}
            </div>

            <div className="course-avatar">
              {course.teacherPhotoUrl ? (
                <img src={course.teacherPhotoUrl || "/placeholder.svg"} alt="Teacher" className="teacher-photo" />
              ) : (
                <div className="teacher-initials">
                  {getInitials(course.teacherGroupEmail ? course.teacherGroupEmail.split("@")[0] : "?")}
                </div>
              )}
            </div>

            <div className="course-actions">
              <button className="action-button">
                <i className="fas fa-user-friends"></i>
              </button>
              <button className="action-button">
                <i className="fas fa-folder"></i>
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  )
}

export default CoursesList
