"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useOutletContext } from "react-router-dom";

function Courses() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [level, setLevel] = useState("")
  const [categorie, setCategorie] = useState("")
  const [modules, setModules] = useState([])
  const { user } = useOutletContext();
  const [selectedModules, setSelectedModules] = useState([])
  const [moduleProperty, setModuleProperty] = useState("title")
  const [message, setMessage] = useState({ text: "", type: "" }) // Pour les messages de succès/erreur

  const navigate = useNavigate()

  // Fonction pour récupérer les modules
  const fetchModules = async () => {
    try {
      const response = await axios.get("http://localhost:5000/module")
      console.log("Modules récupérés:", response.data)

      if (response.data.length > 0) {
        const firstModule = response.data[0]
        if (firstModule.title) setModuleProperty("title")
        else if (firstModule.name) setModuleProperty("name")
        else if (firstModule.moduleName) setModuleProperty("moduleName")

        console.log(
          "Propriété utilisée pour le nom du module:",
          firstModule.title ? "title" : firstModule.name ? "name" : firstModule.moduleName ? "moduleName" : "inconnue",
        )
      }

      setModules(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des modules:", error)
      setMessage({
        text: "Erreur lors de la récupération des modules",
        type: "error",
      })
    }
  }

  useEffect(() => {
    fetchModules()
  }, [])

  // Effacer le message après 5 secondes
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const addCourse = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" }) // Réinitialiser le message

    console.log({
      title,
      description,
      price,
      level,
      categorie,
      moduleId: selectedModules,

    })

    if (!title || !description || !price || !level || !categorie) {
      setMessage({
        text: "Tous les champs sont requis.",
        type: "error",
      })
      return
    }

    try {
      const response = await axios.post("http://localhost:5000/course/addcourse", {
        title,
        description,
        price,
        level,
        categorie,
        moduleId: selectedModules[0],
        userId:user._id // Envoyer seulement le premier module sélectionné
      })

      console.log("Réponse du serveur:", response.data)

      if (response.status === 201 || response.status === 200) {
        setMessage({
          text: "Cours ajouté avec succès !",
          type: "success",
        })

        // Réinitialiser le formulaire
        setTitle("")
        setDescription("")
        setPrice("")
        setLevel("")
        setCategorie("")
        setSelectedModules([])

        // Rediriger vers la page listeAttachment après 1 seconde
        setTimeout(() => {
          navigate("/profile/list")
        }, 1000)
      }
    } catch (error) {
      console.error("Erreur:", error)
      setMessage({
        text: error.response?.data?.message || "Erreur lors de l'ajout du cours.",
        type: "error",
      })
    }
  }

  const handleModuleSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
    setSelectedModules(selectedOptions)
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Ajouter un cours</h2>

      {/* Affichage des messages */}
      {message.text && (
        <div
          className={`p-4 mb-4 rounded ${
            message.type === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={addCourse} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Titre du cours
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du cours"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du cours"
            rows={3}
            className="w-full p-2 border border-gray-300 rounded"
          ></textarea>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Prix
          </label>
          <input
            id="price"
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Prix du cours"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="relative">
          <label htmlFor="level" className="block text-sm font-medium mb-1">
            Niveau
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded appearance-none bg-white"
            style={{ display: "block", position: "relative", zIndex: 10 }}
          >
            <option value="" disabled>
              Sélectionner un niveau
            </option>
            <option value="Débutant">Débutant</option>
            <option value="Intermédiaire">Intermédiaire</option>
            <option value="Avancé">Avancé</option>
          </select>
        </div>

        <div>
          <label htmlFor="categorie" className="block text-sm font-medium mb-1">
            Catégorie
          </label>
          <input
            id="categorie"
            type="text"
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            placeholder="Catégorie du cours"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

          <div>
          <label htmlFor="modules" className="block text-sm font-medium mb-1">
            Modules ({modules.length} disponibles) <a href="/profile/module">Ajouter Module</a>
          </label>
          <select
            multiple
            id="modules"
            onChange={handleModuleSelect}
            className="w-full p-2 border border-gray-300 rounded min-h-[100px]"
            style={{ display: "block" }}
            value={selectedModules}
          >
            {modules.length > 0 ? (
              modules.map((module) => (
                <option key={module._id} value={module._id}>
                  {module[moduleProperty] || module.title || module.name || module.moduleName || "Module sans nom"}
                </option>
              ))
            ) : (
              <option disabled>Aucun module disponible</option>
            )}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Ajouter le cours
        </button>
      </form>
    </div>
  )
}

export default Courses

