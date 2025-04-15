"use client"

// src/pages/classroom/ClassroomPage.jsx
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { getCourses, loginWithGoogle, checkAuth, logout } from "../../services/googleClassroom.service"
import CourseCard from "../../components/classroom/CourseCard"

const ClassroomPage = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [viewMode, setViewMode] = useState("grid") // 'grid' ou 'list'
  const location = useLocation()

  useEffect(() => {
    const checkAuthentication = async () => {
      // Vérifier si l'authentification a réussi via les paramètres d'URL
      const params = new URLSearchParams(location.search)
      const authStatus = params.get("auth")

      if (authStatus === "success") {
        // Vérifier l'authentification côté serveur
        const authCheck = await checkAuth()
        setIsAuthenticated(authCheck)

        if (authCheck) {
          fetchCourses()
        } else {
          setLoading(false)
          setError("Erreur d'authentification. Veuillez vous reconnecter.")
        }
      } else if (authStatus === "error") {
        setLoading(false)
        setIsAuthenticated(false)
        setError("Erreur lors de l'authentification Google. Veuillez réessayer.")
      } else {
        // Vérifier l'authentification côté serveur
        const authCheck = await checkAuth()
        setIsAuthenticated(authCheck)

        if (authCheck) {
          fetchCourses()
        } else {
          setLoading(false)
        }
      }
    }

    checkAuthentication()
  }, [location])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Tentative de récupération des cours...")
      const response = await getCourses()

      console.log("Réponse reçue:", response)

      if (response.success === false) {
        throw new Error(response.error || "Erreur lors de la récupération des cours")
      }

      if (response.data) {
        setCourses(response.data)
      } else {
        setCourses([])
      }

      setLoading(false)
    } catch (error) {
      console.error("Erreur:", error)

      if (error.response && error.response.status === 401) {
        setIsAuthenticated(false)
        setError("Vous n'êtes pas authentifié. Veuillez vous connecter.")
      } else {
        setError("Une erreur est survenue lors de la récupération des cours.")
      }

      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error("Erreur de connexion:", error)
      setError("Erreur lors de la connexion à Google Classroom")
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIsAuthenticated(false)
      setCourses([])
    } catch (error) {
      console.error("Erreur de déconnexion:", error)
      setError("Erreur lors de la déconnexion")
    }
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Accéder à vos cours Google Classroom</h1>
        <p className="mb-6 text-gray-600">
          Connectez-vous avec votre compte Google pour voir vos cours Google Classroom.
        </p>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
        <button
          onClick={handleGoogleLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
          Se connecter avec Google
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">My Google Classroom Courses</h1>
        <div className="flex flex-wrap gap-2">
         
      
         
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchCourses} className="bg-red-200 hover:bg-red-300 text-red-800 py-1 px-3 rounded text-sm">
            Réessayer
          </button>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Aucun cours trouvé</h2>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas encore de cours dans Google Classroom ou vous n'avez pas les permissions nécessaires.
          </p>
          <a
            href="https://classroom.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded inline-block"
          >
            Créer un cours dans Google Classroom
          </a>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-4">
            {courses.length} courses found. Click on "View course" to access the details.
          </p>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div
                    className={`h-2 w-full ${course.courseState === "ARCHIVED" ? "bg-gray-400" : "bg-green-500"}`}
                  ></div>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold mb-1 text-gray-800">{course.name}</h3>
                        {course.section && <p className="text-gray-600">{course.section}</p>}
                      </div>
                      {course.courseState === "ARCHIVED" && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Archivé</span>
                      )}
                    </div>

                    <div className="my-3">
                      {course.description ? (
                        <p className="text-gray-700">{course.description}</p>
                      ) : (
                        <p className="text-gray-500 italic">Aucune description disponible</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                    
                      <a
                        href={`/classroom/course/${course.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                      >
                        Voir le cours
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ClassroomPage
