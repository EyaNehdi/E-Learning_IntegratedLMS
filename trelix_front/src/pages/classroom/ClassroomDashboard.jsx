"use client"

import { useState, useEffect } from "react"
import { getGoogleAuthUrl, getAllCourses } from "../../services/googleClassroom.service"
import "./ClassroomDashboard.css"

const ClassroomDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)

  // Vérifier si l'utilisateur est déjà authentifié
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setLoading(true)
        // Essayer de récupérer les cours pour vérifier si l'utilisateur est authentifié
        const coursesData = await getAllCourses()
        setCourses(coursesData)
        setIsAuthenticated(true)
      } catch (error) {
        // Si une erreur 401 est renvoyée, l'utilisateur n'est pas authentifié
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          setIsAuthenticated(false)
        } else {
          console.error("Erreur lors de la vérification de l'authentification:", error)
          setError("Erreur lors de la vérification de l'authentification. Veuillez réessayer.")
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuthentication()
  }, [])

  // Fonction pour se connecter à Google Classroom
  const handleGoogleAuth = async () => {
    try {
      setAuthLoading(true)
      const { authUrl } = await getGoogleAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error("Erreur lors de la récupération de l'URL d'authentification:", error)
      setError("Erreur lors de la connexion à Google Classroom. Veuillez réessayer.")
      setAuthLoading(false)
    }
  }

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

  // Affichage pendant le chargement initial
  if (loading) {
    return (
      <div className="classroom-loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    )
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="classroom-error">
        <h2>Une erreur est survenue</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Réessayer
        </button>
      </div>
    )
  }

  // Affichage si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return (
      <div className="classroom-auth-container">
        <div className="auth-card">
          <img
            src="https://www.gstatic.com/classroom/logo_square_rounded.svg"
            alt="Google Classroom Logo"
            className="classroom-logo"
          />
          <h1>Google Classroom</h1>
          <p>Connectez-vous à Google Classroom pour accéder à vos cours.</p>
          <button onClick={handleGoogleAuth} className="google-auth-button" disabled={authLoading}>
            {authLoading ? (
              <>
                <div className="button-spinner"></div>
                Connexion en cours...
              </>
            ) : (
              <>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                  alt="Google Logo"
                  className="google-logo"
                />
                Se connecter avec Google Classroom
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Affichage des cours si l'utilisateur est authentifié
  return (
    <div className="classroom-container">
      <div className="classroom-header">
        <h1>Mes cours Google Classroom</h1>
        <button className="refresh-button" onClick={() => window.location.reload()}>
          Actualiser
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="no-courses">
          <p>Aucun cours trouvé dans votre compte Google Classroom.</p>
        </div>
      ) : (
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
      )}
    </div>
  )
}

export default ClassroomDashboard


