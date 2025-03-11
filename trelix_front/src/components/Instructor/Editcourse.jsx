

import axios from "axios"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

function Editcourse() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    level: "",
    categorie: "",
    module: "", // Changé de moduleId à module pour correspondre au modèle
  })

  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Fonction pour récupérer les données
  const fetchData = async () => {
    setLoading(true)
    setError("")

    try {
      // Récupérer les modules
      const modulesResponse = await axios.get("http://localhost:5000/module")
      console.log("Modules disponibles:", modulesResponse.data)
      setModules(modulesResponse.data)

      // Récupérer les données du cours
      if (courseId) {
        const courseResponse = await axios.get(`http://localhost:5000/course/${courseId}`)
        const courseData = courseResponse.data
        console.log("Données du cours récupérées:", courseData)

        // Déterminer la valeur du module à utiliser
        let moduleValue = ""
        if (courseData.module) {
          // Si module est un objet avec _id
          if (typeof courseData.module === "object" && courseData.module._id) {
            moduleValue = courseData.module._id
          }
          // Si module est une chaîne (ID)
          else if (typeof courseData.module === "string") {
            moduleValue = courseData.module
          }
        }

        console.log("Module ID extrait:", moduleValue)

        // Mettre à jour le formulaire avec les données du cours
        setFormData({
          title: courseData.title || "",
          description: courseData.description || "",
          price: courseData.price || "",
          level: courseData.level || "",
          categorie: courseData.categorie || "",
          module: moduleValue,
        })
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      setError("Erreur lors du chargement des données. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [courseId])

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!formData.title || !formData.description || !formData.price || !formData.level || !formData.categorie) {
      setError("Tous les champs sont requis.")
      return
    }

    try {
      // URL correcte basée sur votre définition de route
      const updateUrl = `http://localhost:5000/course/${courseId}`

      console.log("Envoi de la mise à jour à:", updateUrl)
      console.log("Données envoyées:", formData)

      const response = await axios.put(updateUrl, formData)

      console.log("Réponse de mise à jour:", response.data)
      setSuccess("Cours mis à jour avec succès!")

      setTimeout(() => {
        navigate("/profile/list")
      }, 2000)
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)

      // Message d'erreur détaillé
      let errorMessage = "Erreur lors de la mise à jour du cours."
      if (error.response) {
        errorMessage = `Erreur ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
      }

      setError(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p>Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
                      <>
      <h2>Modifier un cours</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
      )}

    

      <form onSubmit={handleSubmit} className="space-y-6" >
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Titre du cours
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
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
            name="price"
            type="text"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-medium mb-1">
            Niveau
          </label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded bg-white"
            style={{ display: "block" }}
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
            name="categorie"
            type="text"
            value={formData.categorie}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label htmlFor="module" className="block text-sm font-medium mb-1">
            Module
          </label>
          <select
            id="module"
            name="module"
            value={formData.module}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded bg-white"
            style={{ display: "block" }}
          >
            <option value="" disabled>
              Sélectionner un module
            </option>
            {modules.map((module) => (
              <option key={module._id} value={module._id}>
                {module.name || module.title || "Module sans nom"}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Mettre à jour le cours
        </button>
      </form>
      </>
  
  )
}

export default Editcourse

