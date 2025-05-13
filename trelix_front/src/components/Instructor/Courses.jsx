"use client"

import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useOutletContext } from "react-router-dom"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"

function Courses() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [level, setLevel] = useState("")
  const [categorie, setCategorie] = useState("")
  const [typeRessource, setTypeRessource] = useState("")
  const [modules, setModules] = useState([])
  const { user } = useOutletContext()
  const [selectedModules, setSelectedModules] = useState([])
  const [moduleProperty, setModuleProperty] = useState("title")
  const [message, setMessage] = useState({ text: "", type: "" }) // Pour les messages de succès/erreur
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [giftType, setGiftType] = useState("")
  const [editorLoaded, setEditorLoaded] = useState(false)
  const [editorError, setEditorError] = useState(false)

  // Nouvel état pour la devise
  const [currency, setCurrency] = useState("eur")

  // Symboles des devises
  const currencySymbols = {
    usd: "$",
    eur: "€",
    dzd: "د.ج",
    free: "",
  }

  // État pour gérer les erreurs par champ
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    price: "",
    level: "",
    categorie: "",
    typeRessource: "",
    modules: "",
  })

  const [formProgress, setFormProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()

  const editorRef = useRef(null)

  // CKEditor configuration with only basic features that are guaranteed to be available
  const editorConfig = {
    toolbar: ["heading", "|", "bold", "italic", "|", "link", "bulletedList", "numberedList", "|", "undo", "redo"],
  }

  // Fonction pour récupérer les modules
  const fetchModules = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_PROXY}/module`)
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

  // Add cleanup effect for CKEditor
  useEffect(() => {
    // Cleanup function to properly destroy the editor
    return () => {
      if (editorRef.current) {
        try {
          // Check if destroy method exists and is a function
          if (typeof editorRef.current.destroy === "function") {
            editorRef.current
              .destroy()
              .then(() => {
                editorRef.current = null
              })
              .catch((error) => {
                console.error("Error destroying CKEditor:", error)
                editorRef.current = null
              })
          } else {
            // If destroy is not a function, just set ref to null
            editorRef.current = null
          }
        } catch (error) {
          console.error("Error in CKEditor cleanup:", error)
          editorRef.current = null
        }
      }
    }
  }, [])

  // Function to strip HTML tags for validation
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  // Fonction pour valider que le texte contient au moins 10 caractères alphabétiques
  const validateMinAlphaChars = (text, minLength = 5) => {
    // Strip HTML tags if the text contains HTML
    const plainText = text.includes("<") ? stripHtml(text) : text
    const alphaCount = (plainText.match(/[a-zA-Z]/g) || []).length
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
      typeRessource: "",
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
    // Vérifier la catégorie
    if (!typeRessource) {
      newErrors.typeRessource = "Le type du cours est requis"
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
    const fields = [title, description, price, level, categorie, typeRessource]
    const filledFields = fields.filter((field) => field !== "").length
    const progress = (filledFields / fields.length) * 100
    setFormProgress(progress)
  }

  // Fonction pour gérer le changement de devise
  const handleCurrencyChange = (value) => {
    setCurrency(value)
    if (value === "free") {
      setPrice("0")
      handleInputChange("price", "0")
    }
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
      case "typeRessource":
        setTypeRessource(value)
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
      typeRessource,
      currency, // Ajout de la devise
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
      const response = await axios.post(`${import.meta.env.VITE_API_PROXY}/course/addcourse`, {
        title,
        description,
        price,
        level,
        categorie,
        typeRessource,
        currency, // Ajout de la devise
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
        setTypeRessource("")
        setCurrency("eur") // Réinitialiser la devise
        setSelectedModules([])
        setErrors({
          title: "",
          description: "",
          price: "",
          level: "",
          categorie: "",
          typeRessource: "",
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

  // Handle textarea change as fallback
  const handleTextareaChange = (e) => {
    handleInputChange("description", e.target.value, validateMinAlphaChars)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Add new course</h1>
            <p className="text-center text-blue-100">Create an exciting new course for your students</p>
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
                    Course title
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => handleInputChange("title", e.target.value, validateMinAlphaChars)}
                    placeholder="Course title"
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
                    Price <span className="text-red-500">*</span>
                  </label>

                  {/* Boutons radio pour la sélection de devise */}

                  {/* Champ de prix avec symbole de devise */}
                  <div className="relative">
                    <input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="Course price"
                      className={`w-full p-3 pl-8 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                      disabled={currency === "free"}
                    />
                    <div className="flex gap-4 mb-4">
                      <div className="flex items-center space-x-1">
                        <input
                          type="radio"
                          id="usd"
                          name="currency"
                          value="usd"
                          checked={currency === "usd"}
                          onChange={() => handleCurrencyChange("usd")}
                          className="hidden peer"
                        />
                        <label
                          htmlFor="usd"
                          className="text-sm text-gray-700 cursor-pointer peer-checked:text-blue-500 peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-300 transition-all duration-300 ease-in-out flex items-center space-x-2 px-4 py-2 rounded-lg"
                        >
                          <span className="h-6 w-6 border-2 border-gray-300 rounded-full flex items-center justify-center peer-checked:bg-blue-500">
                            <span className="w-3 h-3 bg-white rounded-full peer-checked:block hidden"></span>
                          </span>
                          Trelix Coin (🪙)
                        </label>
                      </div>

                      <div className="flex items-center space-x-1">
                        <input
                          type="radio"
                          id="free"
                          name="currency"
                          value="free"
                          checked={currency === "free"}
                          onChange={() => handleCurrencyChange("free")}
                          className="hidden peer"
                        />
                        <label
                          htmlFor="free"
                          className="text-sm text-gray-700 cursor-pointer peer-checked:text-gray-600 peer-checked:bg-gray-100 peer-checked:border-gray-500 peer-checked:ring-2 peer-checked:ring-gray-300 transition-all duration-300 ease-in-out flex items-center space-x-2 px-4 py-2 rounded-lg"
                        >
                          <span className="h-6 w-6 border-2 border-gray-300 rounded-full flex items-center justify-center peer-checked:bg-gray-500">
                            <span className="w-3 h-3 bg-white rounded-full peer-checked:block hidden"></span>
                          </span>
                          Free
                        </label>
                      </div>
                    </div>
                  </div>
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
                <div className="border rounded-md overflow-hidden">
                  {/* Try to load CKEditor first */}
                  <div className={editorError ? "hidden" : ""}>
                    <CKEditor
                      editor={ClassicEditor}
                      data={description}
                      config={editorConfig}
                      onChange={(event, editor) => {
                        try {
                          const data = editor.getData()
                          handleInputChange("description", data, validateMinAlphaChars)
                          setEditorLoaded(true)
                        } catch (error) {
                          console.error("CKEditor onChange error:", error)
                          setEditorError(true)
                        }
                      }}
                      onReady={(editor) => {
                        try {
                          editorRef.current = editor
                          setEditorLoaded(true)
                          if (editor && editor.ui) {
                            const editorElement = editor.ui.getEditableElement()
                            if (editorElement) {
                              editorElement.style.minHeight = "200px"
                              editorElement.style.border = "1px solid #ccc"
                              editorElement.style.padding = "10px"
                            }
                          }
                        } catch (error) {
                          console.error("CKEditor onReady error:", error)
                          setEditorError(true)
                        }
                      }}
                      onError={(error) => {
                        console.error("CKEditor error:", error)
                        setEditorError(true)
                      }}
                    />
                  </div>

                  {/* Fallback textarea if CKEditor fails to load */}
                  {editorError && (
                    <textarea
                      id="description"
                      value={description}
                      onChange={handleTextareaChange}
                      placeholder="Enter course description"
                      className={`w-full p-3 border-0 min-h-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                        errors.description ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                  )}
                </div>
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
                    Level <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="level"
                      value={level}
                      onChange={(e) => handleInputChange("level", e.target.value)}
                      className={`w-full p-3 border rounded-md appearance-none bg-gray-50 ${
                        errors.level ? "border-red-500" : "border-gray-300"
                      }`}
                      style={{
                        display: "block",
                        position: "relative",
                        zIndex: 10,
                      }}
                    >
                      <option value="" disabled>
                        Select a level
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
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="categorie"
                    type="text"
                    value={categorie}
                    onChange={(e) => handleInputChange("categorie", e.target.value)}
                    placeholder="Course category"
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
              {/* Type Ressource */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label htmlFor="typeRessource" className="block text-sm font-medium text-gray-700">
                    Ressource Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="typeRessource"
                      value={typeRessource}
                      onChange={(e) => handleInputChange("typeRessource", e.target.value)}
                      className={`w-full p-3 border rounded-md appearance-none bg-gray-50 ${
                        errors.typeRessource ? "border-red-500" : "border-gray-300"
                      }`}
                      style={{
                        display: "block",
                        position: "relative",
                        zIndex: 10,
                      }}
                    >
                      <option value="" disabled>
                        Select a Ressource Type
                      </option>
                      <option value="pdf">Pdf</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                      <option value="image">Image</option>
                      <option value="texte">Text</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {errors.typeRessource && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      {errors.typeRessource}
                    </div>
                  )}
                </div>
              </div>
              {/* Fin Type Ressource */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="modules" className="block text-sm font-medium text-gray-700">
                    Modules ({modules.length} available) <span className="text-red-500">*</span>
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
                    Add Module
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
                  {isSubmitting ? "Ajout en cours..." : "Add course"}
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
