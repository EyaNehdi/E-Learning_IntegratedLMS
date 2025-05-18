import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCourses, loginWithGoogle, checkAuth, logout } from "../../services/googleClassroom.service";
import CourseCard from "../../components/classroom/CourseCard";

const ClassroomPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      const params = new URLSearchParams(location.search);
      const authStatus = params.get("auth");

      if (authStatus === "success") {
        const authCheck = await checkAuth();
        setIsAuthenticated(authCheck);

        if (authCheck) {
          fetchCourses();
        } else {
          setLoading(false);
          setError("Erreur d'authentification. Veuillez vous reconnecter.");
        }
      } else if (authStatus === "error") {
        const reason = params.get("reason");
        setLoading(false);
        setIsAuthenticated(false);
        setError(
          reason === "token_exchange_failed"
            ? "Erreur lors de l'échange du token. Veuillez réessayer."
            : reason === "no_code"
            ? "Code d'authentification manquant. Veuillez réessayer."
            : "Erreur lors de l'authentification Google. Veuillez réessayer."
        );
      } else {
        const authCheck = await checkAuth();
        setIsAuthenticated(authCheck);

        if (authCheck) {
          fetchCourses();
        } else {
          setLoading(false);
        }
      }
    };

    checkAuthentication();
  }, [location]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Tentative de récupération des cours...");
      const response = await getCourses();

      console.log("Réponse reçue:", response);

      if (response.success === false) {
        throw new Error(response.error || "Erreur lors de la récupération des cours");
      }

      if (response.data) {
        setCourses(response.data);
      } else {
        setCourses([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur:", error);

      if (error.response && error.response.status === 403) {
        setError(
          `${error.response.data.error}. ${error.response.data.solution || "Contactez l'administrateur ou soumettez l'application à la vérification."}`
        );
      } else if (error.response && error.response.status === 401) {
        setIsAuthenticated(false);
        setError("Vous n'êtes pas authentifié. Veuillez vous connecter.");
      } else {
        setError("Une erreur est survenue lors de la récupération des cours.");
      }

      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setError("Erreur lors de la connexion à Google Classroom");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setCourses([]);
      setError(null);
      navigate('/classroom');
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      setError("Erreur lors de la déconnexion");
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Access your Google Classroom courses</h1>
        <p className="mb-6 text-gray-600">
          Sign in with your Google account to view your Google Classroom courses
        </p>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
        <button
          onClick={handleGoogleLogin}
          className="w-full min-w-[250px] mx-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg flex items-center justify-center space-x-4 transition-colors duration-200 shadow-md"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
          <span>Log in with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold">My Google Classroom courses.</h1>
        <div className="flex gap-3 items-center">
          <button
            onClick={toggleViewMode}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 min-w-[120px]"
          >
            {viewMode === "grid" ? "Vue Liste" : "Vue Grille"}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 min-w-[128px]"
          >
            Log out
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-between">
          <span>{error}</span>
          {error.includes("403") ? (
            <a
              href="https://console.cloud.google.com/apis/credentials/consent"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-lg text-sm transition-colors duration-200"
            >
              Configure testers or check
            </a>
          ) : (
            <button
              onClick={fetchCourses}
              className="bg-red-200 hover:bg-red-300 text-red-800 py-1 px-3 rounded-lg text-sm transition-colors duration-200"
            >
              Try again.
            </button>
          )}
        </div>
      )}

      {courses.length === 0 && !error ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">No courses found</h2>
          <p className="text-gray-600 mb-4">
You don't have any courses in Google Classroom yet, or you don't have the necessary permissions          </p>
          <a
            href="https://classroom.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg inline-block transition-colors duration-200"
          >
           Create a course in Google Classroom.
          </a>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-4">
            {courses.length} courses found. Click 'View course' to access the details
          </p>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Archived</span>
                      )}
                    </div>

                    <div className="my-3">
                      {course.description ? (
                        <p className="text-gray-700">{course.description}</p>
                      ) : (
                        <p className="text-gray-500 italic">No description available</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4 space-x-2">
                     
                      <a
                         href={`/classroom/courses/${course.id}`}
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition-colors duration-200"
                      >
                       View more
                      </a>
                    </div>
                  </div>
                </div>
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
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Archived</span>
                      )}
                    </div>

                    <div className="my-3">
                      {course.description ? (
                        <p className="text-gray-700">{course.description}</p>
                      ) : (
                        <p className="text-gray-500 italic">No description available</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4 space-x-2">
                      
                      <a
                         href={`/classroom/courses/${course.id}`}
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition-colors duration-200"
                      >
                       View more
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
  );
};

export default ClassroomPage;