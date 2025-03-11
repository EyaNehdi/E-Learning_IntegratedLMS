"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function Courses() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [level, setLevel] = useState("");
  const [categorie, setCategorie] = useState("");
  const [modules, setModules] = useState([]);
  const { user } = useOutletContext();
  const [selectedModules, setSelectedModules] = useState([]);
  const [moduleProperty, setModuleProperty] = useState("title");
  const [message, setMessage] = useState({ text: "", type: "" }); // Pour les messages de succès/erreur

  const navigate = useNavigate();

  // Fonction pour récupérer les modules
  const fetchModules = async () => {
    try {
      const response = await axios.get("http://localhost:5000/module");
      console.log("Modules récupérés:", response.data);

      if (response.data.length > 0) {
        const firstModule = response.data[0];
        if (firstModule.title) setModuleProperty("title");
        else if (firstModule.name) setModuleProperty("name");
        else if (firstModule.moduleName) setModuleProperty("moduleName");

        console.log(
          "Propriété utilisée pour le nom du module:",
          firstModule.title
            ? "title"
            : firstModule.name
            ? "name"
            : firstModule.moduleName
            ? "moduleName"
            : "inconnue"
        );
      }

      setModules(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des modules:", error);
      setMessage({
        text: "Erreur lors de la récupération des modules",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // Effacer le message après 5 secondes
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const addCourse = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" }); // Réinitialiser le message

    console.log({
      title,
      description,
      price,
      level,
      categorie,
      moduleId: selectedModules,
    });

    if (!title || !description || !price || !level || !categorie) {
      setMessage({
        text: "Tous les champs sont requis.",
        type: "error",
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/course/addcourse",
        {
          title,
          description,
          price,
          level,
          categorie,
          moduleId: selectedModules[0],
          userId: user._id, // Envoyer seulement le premier module sélectionné
        }
      );

      console.log("Réponse du serveur:", response.data);

      if (response.status === 201 || response.status === 200) {
        setMessage({
          text: "Cours ajouté avec succès !",
          type: "success",
        });

        // Réinitialiser le formulaire
        setTitle("");
        setDescription("");
        setPrice("");
        setLevel("");
        setCategorie("");
        setSelectedModules([]);

        // Rediriger vers la page listeAttachment après 1 seconde
        setTimeout(() => {
          navigate("/profile/list");
        }, 1000);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessage({
        text:
          error.response?.data?.message || "Erreur lors de l'ajout du cours.",
        type: "error",
      });
    }
  };

  const handleModuleSelect = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedModules(selectedOptions);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Ajouter un cours
        </h1>

        {/* Affichage des messages */}
        {message.text && (
          <div
            className={`p-4 mb-6 rounded-md flex items-center ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
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

        <form onSubmit={addCourse} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium">
                Titre du cours <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre du cours"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium">
                Prix <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Prix du cours"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du cours"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label htmlFor="level" className="block text-sm font-medium">
                Niveau <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded appearance-none bg-white"
                  style={{ display: "block", position: "relative", zIndex: 10 }}
                >
                  <option value="" disabled>
                    Sélectionner un niveau
                  </option>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="categorie" className="block text-sm font-medium">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <input
                id="categorie"
                type="text"
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                placeholder="Catégorie du cours"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="modules" className="block text-sm font-medium">
                Modules ({modules.length} disponibles) <span className="text-red-500">*</span>
              </label>
              <a
                  href="/profile/module"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter Module
                </a>
            </div>
            <div className="relative">
              <select
                multiple
                id="modules"
                name="modules"
                onChange={handleModuleSelect}
                className="w-full p-3 border border-gray-300 rounded-md min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ zIndex: 10, display: "block" }}
                value={selectedModules}
              >
                {modules.length > 0 ? (
                  modules.map((module) => (
                    <option key={module._id} value={module._id}>
                      {module[moduleProperty] ||
                        module.title ||
                        module.name ||
                        module.moduleName ||
                        "Module sans nom"}
                    </option>
                  ))
                ) : (
                  <option disabled>Aucun module disponible</option>
                )}
              </select>
            </div>
           
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Ajouter le cours
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Courses;
