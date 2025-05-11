import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Heart, Star } from 'lucide-react';

function IntelligentCourses() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [preference, setPreference] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

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

    fetchUserPreference();
    fetchRecommendedCourses();
  }, [moduleId, userId]);

  const fetchRecommendedCourses = async () => {
    setIsLoading(true);
    try {

      const response = await axios.get(`${import.meta.env.VITE_API_PROXY}/intelligent-recommendation/recommended-courses`, {
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
      console.error("Erreur lors de la récupération des cours recommandés:", error.response?.data);
      setMessage({
        text: error.response?.data?.message || "Erreur lors de la récupération des cours recommandés.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPreference = async () => {
    try {
      const response = await axios.get(`https://trelix-xj5h.onrender.com/preference/get?user=${userId}`);
      if (response.status === 200 && response.data.length > 0) {
        setPreference(response.data[0]);
        console.log("Preference fetched:", response.data[0]);
      } else {
        setMessage({
          text: "Aucune préférence trouvée pour cet utilisateur.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la préférence:", error.response?.data);
      setMessage({
        text: error.response?.data?.message || "Erreur lors de la récupération de vos préférences.",
        type: "error",
      });
    }
  };

  const handleModifyPreference = () => {
    if (preference) {
      console.log("Navigating to modify-preference with state:", { preference, userId, moduleId });
      navigate("/profile/modify-preference", { state: { preference, userId, moduleId } });
    } else {
      setMessage({
        text: "Aucune préférence trouvée à modifier.",
        type: "error",
      });
    }
  };

  // Fonction pour générer un nombre aléatoire pour les évaluations
  const getRandomRating = () => {
    return Math.floor(Math.random() * 40) + 5;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 rounded-t-lg">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Recommended Courses</h1>
            <p className="text-center text-blue-100 mb-4">Discover the courses suited to your preferences</p>
            <div className="flex justify-center">
              <button
                className="bg-transparent border border-white/30 text-white py-2 px-6 rounded-md hover:bg-white/10 transition-colors duration-200"
                onClick={handleModifyPreference}
              >
                Modifier
              </button>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-b-lg shadow-xl">
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
              <div className="text-center text-gray-600 py-10">Chargement des cours...</div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <div className="relative">
                      <img
                        src="/assets/images/crs.png"
                        alt={course.title}
                        className="w-full h-64 object-cover"
                      />
                      <button 
                        className="absolute top-3 right-3 bg-gray-800/40 hover:bg-gray-800/60 p-2 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Add to favorites:", course.id);
                        }}
                      >
                        <Heart className="h-5 w-5 text-white" />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-500 mr-1" />
                          <span className="text-gray-700">{getRandomRating()}</span>
                        </div>
                        <span className="text-gray-600">{course.level}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-purple-600 mb-2">{course.title}</h3>
                      
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">By: {course.categorie}</p>
                        <p>{course.moduleName}</p>
                      </div>

                    </div>
                    <button
                      className="mt-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                      onClick={() => navigate(`/chapters/${course.courseSlug}`)}
                    >
                      Voir le cours
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-10">Aucun cours disponible pour ce module.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntelligentCourses;