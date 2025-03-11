"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useOutletContext } from "react-router-dom"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"


function Courses() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [level, setLevel] = useState("")
  const [categorie, setCategorie] = useState("")
  const [modules, setModules] = useState([])
  const { user } = useOutletContext()
  const [selectedModules, setSelectedModules] = useState([])
  const [moduleProperty, setModuleProperty] = useState("title")
  const [message, setMessage] = useState({ text: "", type: "" }) // Pour les messages de succès/erreur
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [giftType, setGiftType] = useState("")

  // État pour gérer les erreurs par champ
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    price: "",
    level: "",
    categorie: "",
    modules: "",
  })

  const [formProgress, setFormProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Fonction pour valider que le texte contient au moins 10 caractères alphabétiques
  const validateMinAlphaChars = (text, minLength = 5) => {
    const alphaCount = (text.match(/[a-zA-Z]/g) || []).length
    return alphaCount >= minLength
  }

  // Fonction pour valider tous les champs du formulaire
  const validateForm = () => {
    // Réinitialiser les erreurs
    const newErrors = {
      title: "",
      description: "",
      price: "",
      level: "",
      categorie: "",
      modules: "",
    }

    let isValid = true

    // Vérifier le titre
    if (!title) {
      newErrors.title = "Le titre est requis"
      isValid = false
    } else if (!validateMinAlphaChars(title)) {
      newErrors.title = "Le titre doit contenir au moins 5 caractères alphabétiques"
      isValid = false
    }

    // Vérifier la description
    if (!description) {
      newErrors.description = "La description est requise"
      isValid = false
    } else if (!validateMinAlphaChars(description)) {
      newErrors.description = "La description doit contenir au moins 10 caractères alphabétiques"
      isValid = false
    }

    // Vérifier le prix
    if (!price) {
      newErrors.price = "Le prix est requis"
      isValid = false
    }

    // Vérifier le niveau
    if (!level) {
      newErrors.level = "Le niveau est requis"
      isValid = false
    }

    // Vérifier la catégorie
    if (!categorie) {
      newErrors.categorie = "La catégorie est requise"
      isValid = false
    }

    // Vérifier les modules
    if (selectedModules.length === 0) {
      newErrors.modules = "Veuillez sélectionner au moins un module"
      isValid = false
    }

    // Mettre à jour l'état des erreurs
    setErrors(newErrors)

    return isValid
  }

  // Update this function to calculate form progress
  const calculateFormProgress = () => {
    const fields = [title, description, price, level, categorie]
    const filledFields = fields.filter((field) => field !== "").length
    const progress = (filledFields / fields.length) * 100
    setFormProgress(progress)
  }

  // Update handleInputChange to calculate progress after each change
  const handleInputChange = (field, value, validator = null) => {
    // Mettre à jour la valeur du champ
    switch (field) {
      case "title":
        setTitle(value)
        break
      case "description":
        setDescription(value)
        break
      case "price":
        setPrice(value)
        break
      case "level":
        setLevel(value)
        break
      case "categorie":
        setCategorie(value)
        break
      default:
        break
    }

    // Effacer l'erreur si le champ n'est plus vide
    if (value) {
      // Si un validateur est fourni, l'utiliser
      if (validator && !validator(value)) {
        return // Garder l'erreur si la validation échoue
      }

      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Calculate progress after updating the field
    calculateFormProgress()
  }

  const addCourse = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })
    setIsSubmitting(true)

    console.log({
      title,
      description,
      price,
      level,
      categorie,
      moduleId: selectedModules,
    })

    // Utiliser la fonction de validation
    if (!validateForm()) {
      setMessage({
        text: "Veuillez corriger les erreurs dans le formulaire",
        type: "error",
      })
      setIsSubmitting(false)
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
        userId: user._id, // Envoyer seulement le premier module sélectionné
      })

      console.log("Réponse du serveur:", response.data)

      if (response.status === 201 || response.status === 200) {
        setMessage({
          text: "Cours ajouté avec succès ! Votre cadeau est débloqué !",
          type: "success",
        })

        // Afficher le cadeau/animation
        showGift()

        // Réinitialiser le formulaire
        setTitle("")
        setDescription("")
        setPrice("")
        setLevel("")
        setCategorie("")
        setSelectedModules([])
        setErrors({
          title: "",
          description: "",
          price: "",
          level: "",
          categorie: "",
          modules: "",
        })

        // Rediriger vers la page listeAttachment après 3 secondes (pour laisser le temps de voir le cadeau)
        setTimeout(() => {
          navigate("/profile/list")
        }, 3000)
      }
    } catch (error) {
      console.error("Erreur:", error)
      setMessage({
        text: error.response?.data?.message || "Erreur lors de l'ajout du cours.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModuleSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
    setSelectedModules(selectedOptions)

    // Effacer l'erreur des modules si au moins un est sélectionné
    if (selectedOptions.length > 0) {
      setErrors((prev) => ({ ...prev, modules: "" }))
    }
  }

  // Fonction pour afficher un cadeau aléatoire
  const showGift = () => {
    // Toujours définir le type de cadeau comme "template"
    setGiftType("template")
    setShowGiftModal(true)

    // Fermer automatiquement après 2.5 secondes
    setTimeout(() => {
      setShowGiftModal(false)
    }, 2500)
  }

  // Classe CSS pour les champs en erreur
  const errorInputClass = "border-red-500 focus:ring-red-500 focus:border-red-500"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Ajouter un cours</h1>
            <p className="text-center text-blue-100">Créez un nouveau cours passionnant pour vos étudiants</p>
          </div>

          <div className="p-6">
            {/* Affichage des messages */}
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

            <form onSubmit={addCourse} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Titre du cours <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => handleInputChange("title", e.target.value, validateMinAlphaChars)}
                    placeholder="Titre du cours"
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.title && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      {errors.title}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Prix <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="Prix du cours"
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.price && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      {errors.price}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => handleInputChange("description", e.target.value, validateMinAlphaChars)}
                  placeholder="Description du cours"
                  rows={4}
                  className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                ></textarea>
                {errors.description && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    {errors.description}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                    Niveau <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="level"
                      value={level}
                      onChange={(e) => handleInputChange("level", e.target.value)}
                      className={`w-full p-3 border rounded-md appearance-none bg-gray-50 ${
                        errors.level ? "border-red-500" : "border-gray-300"
                      }`}
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
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {errors.level && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      {errors.level}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="categorie" className="block text-sm font-medium text-gray-700">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="categorie"
                    type="text"
                    value={categorie}
                    onChange={(e) => handleInputChange("categorie", e.target.value)}
                    placeholder="Catégorie du cours"
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                      errors.categorie ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.categorie && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      {errors.categorie}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="modules" className="block text-sm font-medium text-gray-700">
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
                    className={`w-full p-3 border rounded-md min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                      errors.modules ? "border-red-500" : "border-gray-300"
                    }`}
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
                {errors.modules && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    {errors.modules}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-md hover:from-blue-600 hover:to-purple-700 transition-colors text-lg font-medium shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Ajout en cours..." : "Ajouter cours"}
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ease-out ${
                    Object.values(errors).some((error) => error !== "") ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Modal de cadeau */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full transform animate-bounce">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Félicitations !</h3>
              <p className="text-lg mb-4">Votre cours a été ajouté avec succès !</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Courses

