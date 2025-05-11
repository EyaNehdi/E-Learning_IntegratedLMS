import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

function ModifyPreference() {
  const location = useLocation();
  const navigate = useNavigate();

  const { preference, userId, moduleId } = location.state || {};

  const [typeRessource, setTypeRessource] = useState(preference?.typeRessource || "video");
  const [momentEtude, setMomentEtude] = useState(preference?.momentEtude || "day");
  const [langue, setLangue] = useState(preference?.langue || "french");
  const [styleContenu, setStyleContenu] = useState(preference?.styleContenu || "theoretical");
  const [objectif, setObjectif] = useState(preference?.objectif || "certification");
  const [methodeEtude, setMethodeEtude] = useState(preference?.methodeEtude || "reading");
  const [selectedModules, setSelectedModules] = useState([
    { id: moduleId, name: preference?.moduleName || "Unknown Module" },
  ]);
  const [modules, setModules] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!preference || !userId || !moduleId) {
      setMessage({
        text: "Données manquantes. Veuillez retourner à la page précédente.",
        type: "error",
      });
      return;
    }

    fetchModules();
  }, [preference, userId, moduleId]);

  const fetchModules = async () => {
    try {
      const response = await axios.get("http://localhost:5000/module");
      if (response.status === 200) {
        setModules(response.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des modules:", error);
      setMessage({
        text: "Erreur lors de la récupération des modules.",
        type: "error",
      });
    }
  };

  const toggleModule = (module) => {
    const isSelected = selectedModules.some((m) => m.id === module._id);
    setSelectedModules((prev) => {
      if (isSelected) {
        return prev.filter((m) => m.id !== module._id);
      } else {
        return [...prev, { id: module._id, name: module.name || module.title || "Unnamed Module" }];
      }
    });
  };

  const removeModule = (moduleId) => {
    setSelectedModules((prev) => prev.filter((m) => m.id !== moduleId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    if (selectedModules.length === 0) {
      setMessage({ text: "Veuillez sélectionner au moins un module.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedPreference = {
        typeRessource,
        momentEtude,
        langue,
        styleContenu,
        objectif,
        methodeEtude,
        module: selectedModules[0].id,
        user: userId,
      };

      // Appeler l'endpoint de mise à jour avec l'ID de la préférence
      const response = await axios.put(
        `http://localhost:5000/preference/update/${preference._id}`,
        updatedPreference
      );

      if (response.status === 200) {
        setMessage({ text: "Préférence mise à jour avec succès!", type: "success" });
        setTimeout(() => {
          navigate(`/profile/intelligent-courses?moduleId=${selectedModules[0].id}&userId=${userId}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la préférence:", error.response?.data);
      setMessage({
        text: error.response?.data?.message || "Erreur lors de la mise à jour de la préférence.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeRessourceOptions = ["video", "pdf", "audio", "other"];
  const momentEtudeOptions = ["day", "evening", "night", "morning", "afternoon", "weekend"];
  const langueOptions = ["french", "english", "spanish", "german", "chinese", "arabic", "russian"];
  const contentStyleOptions = ["theoretical", "practical", "interactive", "visual", "textual", "mixed"];
  const objectifOptions = [
    "certification",
    "professional skills",
    "general knowledge",
    "academic success",
    "personal development",
    "career change",
  ];
  const methodeEtudeOptions = [
    "reading",
    "discussion",
    "project",
    "practical experience",
    "research",
    "tutoring",
    "video learning",
    "group study",
    "self-learning",
    "other",
  ];

  const renderRadioGroup = (name, options, value, setValue, label) => (
    <div className="space-y-3 mb-6">
      <label className="block text-lg font-semibold text-gray-800 mb-2">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <div key={option} className="flex items-center">
            <input
              type="radio"
              id={`${name}-${option}`}
              name={name}
              value={option}
              checked={value === option}
              onChange={() => setValue(option)}
              className="hidden peer"
            />
            <label
              htmlFor={`${name}-${option}`}
              className={`w-full text-sm cursor-pointer transition-all duration-300 ease-in-out flex items-center space-x-3 px-4 py-3 rounded-lg border-2 ${
                value === option
                  ? "bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-300"
                  : "border-gray-200 text-gray-700"
              }`}
            >
              <span
                className={`h-5 w-5 border-2 rounded-full flex items-center justify-center ${
                  value === option ? "border-blue-500" : "border-gray-300"
                }`}
              >
                {value === option && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>}
              </span>
              <span className="font-medium">{option}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Modifier Préférence</h1>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3 mb-6">
                <label className="block text-lg font-semibold text-gray-800 mb-2">Modules</label>
                {selectedModules.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedModules.map((module) => (
                      <div
                        key={module.id}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                      >
                        <span className="mr-1">{module.name}</span>
                        <button
                          type="button"
                          onClick={() => removeModule(module.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {modules.map((module) => (
                    <div key={module._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`module-${module._id}`}
                        checked={selectedModules.some((m) => m.id === module._id)}
                        onChange={() => toggleModule(module)}
                        className="hidden peer"
                      />
                      <label
                        htmlFor={`module-${module._id}`}
                        className={`w-full text-sm cursor-pointer transition-all duration-300 ease-in-out flex items-center space-x-3 px-4 py-3 rounded-lg border-2 ${
                          selectedModules.some((m) => m.id === module._id)
                            ? "bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-300"
                            : "border-gray-200 text-gray-700"
                        }`}
                      >
                        <span
                          className={`h-5 w-5 border-2 rounded flex items-center justify-center ${
                            selectedModules.some((m) => m.id === module._id)
                              ? "border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedModules.some((m) => m.id === module._id) && (
                            <span className="w-3 h-3 bg-blue-500 rounded"></span>
                          )}
                        </span>
                        <span className="font-medium">{module.name || module.title || "Unnamed Module"}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {renderRadioGroup("typeRessource", typeRessourceOptions, typeRessource, setTypeRessource, "Type de ressource préféré")}
              {renderRadioGroup("momentEtude", momentEtudeOptions, momentEtude, setMomentEtude, "Moment préféré pour étudier")}
              {renderRadioGroup("langue", langueOptions, langue, setLangue, "Langue préférée")}
              {renderRadioGroup("styleContenu", contentStyleOptions, styleContenu, setStyleContenu, "Style de contenu")}
              {renderRadioGroup("objectif", objectifOptions, objectif, setObjectif, "Objectif d'apprentissage")}
              {renderRadioGroup("methodeEtude", methodeEtudeOptions, methodeEtude, setMethodeEtude, "Méthode d'étude préférée")}

              <button
                type="submit"
                className={`w-full py-4 px-8 rounded-xl text-lg font-bold text-white transition-all duration-300 ease-in-out ${
                  isSubmitting ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Mise à jour en cours..." : "Valider"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModifyPreference;