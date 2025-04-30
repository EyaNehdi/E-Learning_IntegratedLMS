import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function IntelligentCourses() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extraire moduleId et userId des paramètres de l'URL
  const queryParams = new URLSearchParams(location.search);
  const moduleId = queryParams.get("moduleId");
  const userId = queryParams.get("userId");

  useEffect(() => {
    if (!moduleId || !userId) {
      setMessage({
        text: "Paramètres manquants. Veuillez sélectionner un module et vous connecter.",
        type: "error",
      });
      return;
    }

    fetchRecommendedCourses();
  }, [moduleId, userId]);

  const fetchRecommendedCourses = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/intelligent-recommendation/recommended-courses", {
        params: { moduleId, userId },
      });

      if (response.status === 200) {
        setCourses(response.data);
        if (response.data.length === 0) {
          setMessage({
            text: "Aucun cours recommandé pour ce module.",
            type: "error",
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des cours recommandés:", error);
      setMessage({
        text: error.response?.data?.message || "Erreur lors de la récupération des cours recommandés.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Cours Recommandés</h1>
            <p className="text-center text-blue-100">Découvrez les cours adaptés à vos préférences</p>
          </div>

          <div className="p-6 md:p-8">
            {message.text && (
              <div
                className={`p-4 mb-6 rounded-md flex items-center ${
                  message.type === "success"
                    ? "bg-green-100 border border-green-300 text-green-700"
                    : "bg-red-100 border border-red-300 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {isLoading ? (
              <div className="text-center text-gray-600">Chargement des cours...</div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                    <p className="text-gray-600 mt-2">{course.description}</p>
                    <p className="text-sm text-gray-500 mt-2 tennis">Niveau : {course.level}</p>
                    <p className="text-sm text-gray-500">Catégorie : {course.categorie}</p>
                    <p className="text-sm text-gray-500">Prix : {course.price} €</p>
                    <p className="text-sm text-gray-500">Module : {course.moduleName}</p>
                    <button
                      className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      Voir le cours
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600">Aucun cours disponible pour ce module.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default IntelligentCourses;