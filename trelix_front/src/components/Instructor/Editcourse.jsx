"use client"

import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

function Editcourse() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const editorRef = useRef(null)
  const isEditorReady = useRef(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    level: "",
    categorie: "",
    module: "",
  })

  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formProgress, setFormProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editorError, setEditorError] = useState(false)
  const [currency, setCurrency] = useState("eur")

  // État pour gérer les erreurs par champ
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    price: "",
    level: "",
    categorie: "",
    module: "",
  })

  // Fonction pour récupérer les données
  const fetchData = async () => {
    setLoading(true)
    setError("")

    try {
      // Récupérer les modules
      const modulesResponse = await axios.get(`${import.meta.env.VITE_API_PROXY}/module`)
      console.log("Modules disponibles:", modulesResponse.data)
      setModules(modulesResponse.data)

      // Récupérer les données du cours
      if (courseId) {
        const courseResponse = await axios.get(`${import.meta.env.VITE_API_PROXY}/course/${courseId}`)
        const courseData = courseResponse.data
        console.log("Données du cours récupérées:", courseData)

        // Déterminer la valeur du module à utiliser
        let moduleValue = ""
        if (courseData.module) {
          if (typeof courseData.module === "object" && courseData.module._id) {
            moduleValue = courseData.module._id
          } else if (typeof courseData.module === "string") {
            moduleValue = courseData.module
          }
        }

        // Déterminer la devise
        if (courseData.price === "0" || courseData.price === 0) {
          setCurrency("free")
        } else if (courseData.currency) {
          setCurrency(courseData.currency)
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

        // Calculer la progression du formulaire
        calculateFormProgress()
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

  // Cleanup CKEditor on component unmount
  useEffect(() => {
    return () => {
      if (editorRef.current && isEditorReady.current) {
        console.log("Cleaning up CKEditor instance")
        try {
          editorRef.current.destroy()
          editorRef.current = null
          isEditorReady.current = false
        } catch (err) {
          console.error("Error destroying CKEditor:", err)
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

  // Fonction pour calculer la progression du formulaire
  const calculateFormProgress = () => {
    const fields = [
      formData.title,
      formData.description,
      formData.price,
      formData.level,
      formData.categorie,
      formData.module,
    ]
    const filledFields = fields.filter((field) => field !== "").length
    const progress = (filledFields / fields.length) * 100
    setFormProgress(progress)
  }

  // Gérer les changements dans le formulaire
  const handleChange = (e, editor = null) => {
    if (editor) {
      const data = editor.getData()
      console.log("CKEditor data updated:", data)
      setFormData((prev) => ({
        ...prev,
        description: data,
      }))

      // Effacer l'erreur si le champ n'est plus vide
      if (data) {
        if (validateMinAlphaChars(data)) {
          setErrors((prev) => ({ ...prev, description: "" }))
        }
      }
    } else {
      const { name, value } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))

      // Effacer l'erreur si le champ n'est plus vide
      if (value) {
        setErrors((prev) => ({ ...prev, [name]: "" }))
      }
    }

    // Calculer la progression après la mise à jour
    setTimeout(calculateFormProgress, 0)
  }

  // Fonction pour gérer le changement de devise
  const handleCurrencyChange = (value) => {
    setCurrency(value)
    if (value === "free") {
      setFormData((prev) => ({
        ...prev,
        price: "0",
      }))
    }
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
      module: "",
    }

    let isValid = true

    // Vérifier le titre
    if (!formData.title) {
      newErrors.title = "Le titre est requis"
      isValid = false
    } else if (!validateMinAlphaChars(formData.title)) {
      newErrors.title = "Le titre doit contenir au moins 5 caractères alphabétiques"
      isValid = false
    }

    // Vérifier la description
    if (!formData.description) {
      newErrors.description = "La description est requise"
      isValid = false
    } else if (!validateMinAlphaChars(formData.description)) {
      newErrors.description = "La description doit contenir au moins 10 caractères alphabétiques"
      isValid = false
    }

    // Vérifier le prix
    if (!formData.price) {
      newErrors.price = "Le prix est requis"
      isValid = false
    }

    // Vérifier le niveau
    if (!formData.level) {
      newErrors.level = "Le niveau est requis"
      isValid = false
    }

    // Vérifier la catégorie
    if (!formData.categorie) {
      newErrors.categorie = "La catégorie est requise"
      isValid = false
    }

    // Vérifier le module
    if (!formData.module) {
      newErrors.module = "Veuillez sélectionner un module"
      isValid = false
    }

    // Mettre à jour l'état des erreurs
    setErrors(newErrors)

    return isValid
  }

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    // Valider le formulaire
    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire")
      setIsSubmitting(false)
      return
    }

    try {
      const updateData = {
        ...formData,
        currency,
      }

      const updateUrl = `${import.meta.env.VITE_API_PROXY}/course/${courseId}`
      console.log("Envoi de la mise à jour à:", updateUrl)
      console.log("Données envoyées:", updateData)

      const response = await axios.put(updateUrl, updateData)
      console.log("Réponse de mise à jour:", response.data)
      setSuccess("Cours mis à jour avec succès!")

      setTimeout(() => {
        navigate("/profile/list")
      }, 2000)
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
      let errorMessage = "Erreur lors de la mise à jour du cours."
      if (error.response) {
        errorMessage = `Erreur ${error.response.status}: ${error.response.data?.message || error.response.statusText}`
      }
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle textarea change as fallback
  const handleTextareaChange = (e) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      description: value,
    }))

    if (value && validateMinAlphaChars(value)) {
      setErrors((prev) => ({ ...prev, description: "" }))
    }

    setTimeout(calculateFormProgress, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden p-6">
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-lg text-gray-700">Chargement des données...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Edit course</h1>
            <p className="text-center text-blue-100">Update your course information</p>
          </div>

          <div className="p-6">
            {/* Affichage des messages */}
            {error && (
              <div className="p-4 mb-6 rounded-md flex items-center bg-red-100 border border-red-300 text-red-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 mb-6 rounded-md flex items-center bg-green-100 border border-green-300 text-green-700">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Course title
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
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

                  {/* Champ de prix avec symbole de devise */}
                  <div className="relative">
                    <input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Course price"
                      className={`w-full p-3 pl-8 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                      disabled={currency === "free"}
                    />
                    <div className="flex gap-4 mb-4">
                      {/* Trelix Coin Radio Button */}
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          id="usd"
                          name="currency"
                          value="usd"
                          checked={currency === "usd"}
                          onChange={() => handleCurrencyChange("usd")}
                          className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                          style={{ margin: 0 }}
                        />
                        <label
                          htmlFor="usd"
                          className={`text-sm cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-lg ${
                            currency === "usd"
                              ? "text-blue-500 bg-blue-100 border-blue-500 ring-2 ring-blue-300"
                              : "text-gray-700"
                          }`}
                        >
                          <span
                            className={`h-6 w-6 border-2 rounded-full flex items-center justify-center ${
                              currency === "usd" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                            }`}
                          >
                            <span
                              className={`w-3 h-3 bg-white rounded-full ${currency === "usd" ? "block" : "hidden"}`}
                            ></span>
                          </span>
                          <span>Trelix Coin (🪙)</span>
                        </label>
                      </div>

                      {/* Free Radio Button */}
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          id="free"
                          name="currency"
                          value="free"
                          checked={currency === "free"}
                          onChange={() => handleCurrencyChange("free")}
                          className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                          style={{ margin: 0 }}
                        />
                        <label
                          htmlFor="free"
                          className={`text-sm cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-lg ${
                            currency === "free"
                              ? "text-gray-600 bg-gray-100 border-gray-500 ring-2 ring-gray-300"
                              : "text-gray-700"
                          }`}
                        >
                          <span
                            className={`h-6 w-6 border-2 rounded-full flex items-center justify-center ${
                              currency === "free" ? "border-gray-500 bg-gray-500" : "border-gray-300"
                            }`}
                          >
                            <span
                              className={`w-3 h-3 bg-white rounded-full ${currency === "free" ? "block" : "hidden"}`}
                            ></span>
                          </span>
                          <span>Free</span>
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
                      data={formData.description}
                      config={{
                        toolbar: [
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "link",
                          "bulletedList",
                          "numberedList",
                          "|",
                          "undo",
                          "redo",
                        ],
                      }}
                      onReady={(editor) => {
                        try {
                          console.log("CKEditor initialized")
                          editorRef.current = editor
                          isEditorReady.current = true
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
                      onChange={(event, editor) => handleChange(null, editor)}
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
                      name="description"
                      value={formData.description}
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
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
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
                    name="categorie"
                    type="text"
                    value={formData.categorie}
                    onChange={handleChange}
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

              <div className="space-y-2">
                <label htmlFor="module" className="block text-sm font-medium text-gray-700">
                  Module <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="module"
                    name="module"
                    value={formData.module}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-md appearance-none bg-gray-50 ${
                      errors.module ? "border-red-500" : "border-gray-300"
                    }`}
                    style={{
                      display: "block",
                      position: "relative",
                      zIndex: 10,
                    }}
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {errors.module && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    {errors.module}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-md hover:from-blue-600 hover:to-purple-700 transition-colors text-lg font-medium shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Mise à jour en cours..." : "Update course"}
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
    </div>
  )
}

export default Editcourse
