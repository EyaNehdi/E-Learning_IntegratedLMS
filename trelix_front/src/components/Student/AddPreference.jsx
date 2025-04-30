"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

function AddPreference() {
  // Form state
  const [typeRessource, setTypeRessource] = useState("vidéo");
  const [momentEtude, setMomentEtude] = useState("jour");
  const [langue, setLangue] = useState("français");
  const [styleContenu, setStyleContenu] = useState("théorique");
  const [objectif, setObjectif] = useState("certification");
  const [methodeEtude, setMethodeEtude] = useState("lecture");
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedModuleName, setSelectedModuleName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // UI state
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [errors, setErrors] = useState({});
  const [formProgress, setFormProgress] = useState(0);

  // Référence pour le dropdown
  const dropdownRef = useRef(null);

  // Récupérer le contexte (qui contient l'utilisateur)
  const context = useOutletContext() || {};
  const user = context.user || {};

  const navigate = useNavigate();

  // Options for each preference type
  const typeRessourceOptions = [
    "vidéo",
    "pdf",
    "audio",
    "quiz",
    "interactive exercice",
    "webinar",
    "infographie",
    "slides",
    "other",
  ];

  const momentEtudeOptions = ["Day", "Evening"];
  const langueOptions = ["French", "English", "Spanish"];
  const styleContenuOptions = ["theoretical", "practice", "interactive exercises"];
  const objectifOptions = ["certification", "professional skills", "general knowledge"];
  const methodeEtudeOptions = [
    "reading",
    "discussion",
    "project",
    "practical experience",
    "research",
    "tutoring",
    "other",
  ];

  // Fetch modules on component mount
  useEffect(() => {
    fetchModules();
  }, []);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Calculate form progress
  useEffect(() => {
    calculateFormProgress();
  }, [typeRessource, momentEtude, langue, styleContenu, objectif, methodeEtude, selectedModule]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Function to fetch modules from the backend
  const fetchModules = async () => {
    setIsLoadingModules(true);
    try {
      const url = "http://localhost:5000/module";
      const response = await axios.get(url);

      console.log("Réponse de l'API des modules:", response.data);

      const extractModules = (data) => {
        if (Array.isArray(data)) {
          return data;
        } else if (data && typeof data === "object") {
          for (const key of ["modules", "data", "results", "items"]) {
            if (Array.isArray(data[key])) {
              return data[key];
            }
          }
          for (const key in data) {
            if (Array.isArray(data[key])) {
              return data[key];
            }
          }
        }
        return [];
      };

      const extractedModules = extractModules(response.data);
      console.log("Modules extraits:", extractedModules);

      const validModules = extractedModules.filter(
        (module) => module && module._id && (module.title || module.name || module.moduleName || module.nom),
      );

      console.log("Modules valides:", validModules);

      if (validModules.length > 0) {
        setModules(validModules);
        setSelectedModule(validModules[0]._id);
        setSelectedModuleName(
          validModules[0].title ||
            validModules[0].name ||
            validModules[0].moduleName ||
            validModules[0].nom ||
            "Module sans nom",
        );
      } else {
        setMessage({
          text: "Aucun module valide trouvé",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des modules:", error);
      setMessage({
        text: `Erreur: ${error.message}`,
        type: "error",
      });
    } finally {
      setIsLoadingModules(false);
    }
  };

  // Calculate form progress
  const calculateFormProgress = () => {
    const requiredFields = [selectedModule];
    const filledFields = requiredFields.filter((field) => field !== "").length;
    const progress = (filledFields / requiredFields.length) * 100;
    setFormProgress(progress);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setIsSubmitting(true);

    // Validate form
    const newErrors = {};

    if (!selectedModule) {
      newErrors.module = "Veuillez sélectionner un module";
    }

    if (!user || !user._id) {
      newErrors.user = "Utilisateur non identifié. Veuillez vous connecter.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage({
        text: "Veuillez corriger les erreurs dans le formulaire",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Envoi des données:", {
        typeRessource,
        momentEtude,
        langue,
        styleContenu,
        objectif,
        methodeEtude,
        moduleId: selectedModule,
        userId: user._id,
      });

      const response = await axios.post("http://localhost:5000/preference/add", {
        typeRessource,
        momentEtude,
        langue,
        styleContenu,
        objectif,
        methodeEtude,
        moduleId: selectedModule,
        userId: user._id,
      });

      console.log("Réponse du serveur:", response.data);

      if (response.status === 201 || response.status === 200) {
        setMessage({
          text: "Préférences ajoutées avec succès !",
          type: "success",
        });

        // Reset form
        setTypeRessource("vidéo");
        setMomentEtude("jour");
        setLangue("français");
        setStyleContenu("théorique");
        setObjectif("certification");
        setMethodeEtude("lecture");
        setSelectedModule("");
        setSelectedModuleName("");
        setErrors({});

        

        // Rediriger vers la page des cours recommandés avec moduleId
        setTimeout(() => {
          navigate(`/profile/intelligent-courses?moduleId=${response.data.moduleId}&userId=${user._id}`);
        }, 3000);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des préférences:", error);

      if (error.response) {
        console.error("Données de réponse d'erreur:", error.response.data);
        console.error("Statut d'erreur:", error.response.status);
      }

      setMessage({
        text: error.response?.data?.message || "Erreur lors de l'ajout des préférences.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render radio button group with different colors for each option type
  const renderRadioGroup = (name, options, value, setValue, label) => {
    const colorSchemes = {
      typeRessource: {
        bg: "bg-emerald-100",
        border: "border-emerald-500",
        text: "text-emerald-700",
        ring: "ring-emerald-300",
        checked: "peer-checked:bg-emerald-100 peer-checked:border-emerald-500 peer-checked:text-emerald-700",
      },
      momentEtude: {
        bg: "bg-amber-100",
        border: "border-amber-500",
        text: "text-amber-700",
        ring: "ring-amber-300",
        checked: "peer-checked:bg-amber-100 peer-checked:border-amber-500 peer-checked:text-amber-700",
      },
      langue: {
        bg: "bg-rose-100",
        border: "border-rose-500",
        text: "text-rose-700",
        ring: "ring-rose-300",
        checked: "peer-checked:bg-rose-100 peer-checked:border-rose-500 peer-checked:text-rose-700",
      },
      styleContenu: {
        bg: "bg-purple-100",
        border: "border-purple-500",
        text: "text-purple-700",
        ring: "ring-purple-300",
        checked: "peer-checked:bg-purple-100 peer-checked:border-purple-500 peer-checked:text-purple-700",
      },
      objectif: {
        bg: "bg-cyan-100",
        border: "border-cyan-500",
        text: "text-cyan-700",
        ring: "ring-cyan-300",
        checked: "peer-checked:bg-cyan-100 peer-checked:border-cyan-500 peer-checked:text-cyan-700",
      },
      methodeEtude: {
        bg: "bg-orange-100",
        border: "border-orange-500",
        text: "text-orange-700",
        ring: "ring-orange-300",
        checked: "peer-checked:bg-orange-100 peer-checked:border-orange-500 peer-checked:text-orange-700",
      },
    };

    const colors = colorSchemes[name] || {
      bg: "bg-blue-100",
      border: "border-blue-500",
      text: "text-blue-700",
      ring: "ring-blue-300",
      checked: "peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:text-blue-700",
    };

    return (
      <div className="space-y-3 mb-6">
        <label className="block text-lg font-semibold text-gray-800 mb-2 border-l-4 pl-3 py-1 border-gray-800 bg-gray-50 rounded-r-md shadow-sm">
          {label} <span className="text-red-500">*</span>
        </label>
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
                className={`w-full text-sm text-gray-700 cursor-pointer transition-all duration-300 ease-in-out flex items-center space-x-3 px-4 py-3 rounded-lg border-2 hover:shadow-md ${colors.checked} peer-checked:ring-2 ${colors.ring}`}
              >
                <span
                  className={`h-5 w-5 border-2 ${colors.border} rounded-full flex items-center justify-center peer-checked:${colors.bg}`}
                >
                  <span className={`w-2.5 h-2.5 ${colors.bg} rounded-full peer-checked:block hidden`}></span>
                </span>
                <span className="font-medium">{option}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Sélectionner un module dans la liste déroulante personnalisée
  const selectModule = (moduleId, moduleName) => {
    setSelectedModule(moduleId);
    setSelectedModuleName(moduleName);
    setIsDropdownOpen(false);
  };

  // Vérifier si l'utilisateur est connecté
  const isUserLoggedIn = user && user._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Learning preferences</h1>
            <p className="text-center text-blue-100">Personalize your learning experience</p>
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

            {!isUserLoggedIn && (
              <div className="p-4 mb-6 rounded-md flex items-center bg-yellow-100 border border-yellow-300 text-yellow-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>Vous devez être connecté pour enregistrer vos préférences.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 mb-6">
                <label
                  htmlFor="module"
                  className="block text-lg font-semibold text-gray-800 mb-2 border-l-4 pl-3 py-1 border-gray-800 bg-gray-50 rounded-r-md shadow-sm"
                >
                  Module ? <span className="text-red-500">*</span>
                </label>

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    className="w-full p-3 border-2 border-gray-300 rounded-md bg-white text-left flex justify-between items-center hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={isLoadingModules}
                  >
                    <span className={selectedModuleName ? "text-gray-800 font-medium" : "text-gray-500"}>
                      {isLoadingModules ? "Chargement des modules..." : selectedModuleName || "Sélectionner un module"}
                    </span>
                    {isDropdownOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {modules.length > 0 ? (
                        modules.map((module) => (
                          <div
                            key={module._id}
                            className="p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() =>
                              selectModule(
                                module._id,
                                module.title || module.name || module.moduleName || module.nom || "Module sans nom",
                              )
                            }
                          >
                            {module.title || module.name || module.moduleName || module.nom || "Module sans nom"}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-gray-500">Aucun module disponible</div>
                      )}
                    </div>
                  )}
                </div>

                {errors.module && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    {errors.module}
                  </div>
                )}

                {modules.length === 0 && !isLoadingModules && (
                  <div className="text-amber-600 text-sm mt-1 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Aucun module trouvé. Veuillez créer un module d'abord.
                  </div>
                )}
              </div>

              {renderRadioGroup(
                "resource type?",
                typeRessourceOptions,
                typeRessource,
                setTypeRessource,
                "Preferred resource type?",
              )}

              {renderRadioGroup(
                "momentStudy?",
                momentEtudeOptions,
                momentEtude,
                setMomentEtude,
                "Favorite time of day for studying?",
              )}

              {renderRadioGroup("langue", langueOptions, langue, setLangue, "Favorite language ?")}

              {renderRadioGroup("styleContenu", styleContenuOptions, styleContenu, setStyleContenu, "Content style ?")}

              {renderRadioGroup("objectif", objectifOptions, objectif, setObjectif, "Learning objective ?")}

              {renderRadioGroup(
                "methodStudy?",
                methodeEtudeOptions,
                methodeEtude,
                setMethodeEtude,
                "Preferred study method?",
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-purple-800 transition-colors text-lg font-medium shadow-md"
                  disabled={isSubmitting || !isUserLoggedIn || modules.length === 0}
                >
                  {isSubmitting ? "Enregistrement en cours..." : "Save my preferences"}
                </button>
              </div>

              <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ease-out ${
                    Object.keys(errors).length > 0 ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPreference;