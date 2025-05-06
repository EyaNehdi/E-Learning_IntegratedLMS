"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { AlertCircle, CheckCircle2, Info, ChevronDown, ChevronUp } from "lucide-react"
import { useNavigate, useOutletContext } from "react-router-dom"

function AddPreference() {
  const [typeRessource, setTypeRessource] = useState("vidéo")
  const [momentEtude, setMomentEtude] = useState("jour")
  const [langue, setLangue] = useState("français")
  const [styleContenu, setStyleContenu] = useState("théorique")
  const [objectif, setObjectif] = useState("certification")
  const [methodeEtude, setMethodeEtude] = useState("lecture")
  const [modules, setModules] = useState([])
  const [selectedModule, setSelectedModule] = useState("")
  const [selectedModuleName, setSelectedModuleName] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [clickEffect, setClickEffect] = useState("") // Déplace le hook ici

  // Préchargement du son pour une lecture instantanée
  const [clickSoundObj] = useState(() => {
    const sound = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3")
    sound.volume = 0.5
    sound.load()
    return sound
  })

  const [message, setMessage] = useState({ text: "", type: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingModules, setIsLoadingModules] = useState(false)
  const [errors, setErrors] = useState({})
  const [formProgress, setFormProgress] = useState(0)

  const dropdownRef = useRef(null)
  const context = useOutletContext() || {}
  const user = context.user || {}
  const navigate = useNavigate()

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
  ]
  const momentEtudeOptions = ["Day", "Evening"]
  const langueOptions = ["French", "English", "Spanish"]
  const styleContenuOptions = ["theoretical", "practice", "interactive exercises"]
  const objectifOptions = ["certification", "professional skills", "general knowledge"]
  const methodeEtudeOptions = [
    "reading",
    "discussion",
    "project",
    "practical experience",
    "research",
    "tutoring",
    "other",
  ]

  useEffect(() => {
    fetchModules()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  useEffect(() => {
    calculateFormProgress()
  }, [typeRessource, momentEtude, langue, styleContenu, objectif, methodeEtude, selectedModule])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownRef])

  const fetchModules = async () => {
    setIsLoadingModules(true)
    try {
      const response = await axios.get("https://trelix-xj5h.onrender.com/module")
      const data = response.data
      const extractModules = (data) => {
        if (Array.isArray(data)) return data
        if (typeof data === "object") {
          for (const key of ["modules", "data", "results", "items"]) {
            if (Array.isArray(data[key])) return data[key]
          }
          for (const key in data) {
            if (Array.isArray(data[key])) return data[key]
          }
        }
        return []
      }
      const extracted = extractModules(data)
      const valid = extracted.filter((m) => m && m._id && (m.title || m.name || m.moduleName || m.nom))
      setModules(valid)
      if (valid.length > 0) {
        setSelectedModule(valid[0]._id)
        setSelectedModuleName(
          valid[0].title || valid[0].name || valid[0].moduleName || valid[0].nom || "Module sans nom",
        )
      } else {
        setMessage({ text: "Aucun module valide trouvé", type: "error" })
      }
    } catch (error) {
      setMessage({ text: `Erreur: ${error.message}`, type: "error" })
    } finally {
      setIsLoadingModules(false)
    }
  }

  const calculateFormProgress = () => {
    const required = [selectedModule]
    const filled = required.filter((field) => field !== "").length
    setFormProgress((filled / required.length) * 100)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })
    setIsSubmitting(true)
    const newErrors = {}

    if (!selectedModule) newErrors.module = "Veuillez sélectionner un module"
    if (!user || !user._id) newErrors.user = "Utilisateur non identifié. Veuillez vous connecter."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setMessage({ text: "Veuillez corriger les erreurs dans le formulaire", type: "error" })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await axios.post("https://trelix-xj5h.onrender.com/preference/add", {
        typeRessource,
        momentEtude,
        langue,
        styleContenu,
        objectif,
        methodeEtude,
        moduleId: selectedModule,
        userId: user._id,
      })

      if (response.status === 200 || response.status === 201) {
        setMessage({ text: "Préférences ajoutées avec succès !", type: "success" })
        setTypeRessource("vidéo")
        setMomentEtude("jour")
        setLangue("français")
        setStyleContenu("théorique")
        setObjectif("certification")
        setMethodeEtude("lecture")
        setSelectedModule("")
        setSelectedModuleName("")
        setErrors({})
        setTimeout(() => {
          navigate(`/profile/intelligent-courses?moduleId=${response.data.moduleId}&userId=${user._id}`)
        }, 3000)
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Erreur lors de l'ajout des préférences.", type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderRadioGroup = (name, options, value, setValue, label) => {
    const colors = {
      bg: "bg-blue-100",
      border: "border-blue-500",
      text: "text-blue-700",
      ring: "ring-blue-300",
      checked: "peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:text-blue-700",
    }

    const handleClick = (option) => {
      // Joue le son préchargé
      clickSoundObj.currentTime = 0 // Réinitialise le son pour permettre des clics rapides
      clickSoundObj.play().catch((error) => console.error("Erreur de lecture audio :", error))

      // Applique l'effet visuel
      setClickEffect("scale-105 shadow-lg")
      setTimeout(() => setClickEffect(""), 100) // Retire l'effet après 100ms

      // Logique de bascule
      if (value === option) {
        setValue("") // Désélectionne si déjà sélectionné
      } else {
        setValue(option) // Sélectionne si non sélectionné
      }
    }

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
                onChange={() => handleClick(option)}
                className="hidden peer"
              />
              <label
                htmlFor={`${name}-${option}`}
                className={`w-full text-sm text-gray-700 cursor-pointer transition-all duration-300 ease-in-out flex items-center space-x-3 px-4 py-3 rounded-lg border-2 hover:shadow-md ${colors.checked} peer-checked:ring-2 ${colors.ring} ${clickEffect}`}
              >
                <span className={`h-5 w-5 border-2 ${colors.border} rounded-full flex items-center justify-center`}>
                  <span className={`w-2.5 h-2.5 ${colors.bg} rounded-full peer-checked:block hidden`}></span>
                </span>
                <span className="font-medium">{option}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const selectModule = (moduleId, moduleName) => {
    setSelectedModule(moduleId)
    setSelectedModuleName(moduleName)
    setIsDropdownOpen(false)
  }

  const isUserLoggedIn = user && user._id

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
                    <span className={selectedModuleName ? "text-gray-800 font-medium" : "text-gray-500 italic"}>
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
                "typeRessource",
                typeRessourceOptions,
                typeRessource,
                setTypeRessource,
                "Type de ressource préféré ?",
              )}
              {renderRadioGroup(
                "momentEtude",
                momentEtudeOptions,
                momentEtude,
                setMomentEtude,
                "Moment préféré de la journée pour étudier ?",
              )}
              {renderRadioGroup("langue", langueOptions, langue, setLangue, "Langue préférée ?")}
              {renderRadioGroup(
                "styleContenu",
                styleContenuOptions,
                styleContenu,
                setStyleContenu,
                "Style de contenu ?",
              )}
              {renderRadioGroup("objectif", objectifOptions, objectif, setObjectif, "Objectif d'apprentissage ?")}
              {renderRadioGroup(
                "methodeEtude",
                methodeEtudeOptions,
                methodeEtude,
                setMethodeEtude,
                "Méthode d'étude préférée ?",
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-purple-800 transition-colors text-lg font-medium shadow-md"
                  disabled={isSubmitting || !isUserLoggedIn || modules.length === 0}
                >
                  {isSubmitting ? "Enregistrement en cours..." : "Enregistrer mes préférences"}
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
  )
}

export default AddPreference
