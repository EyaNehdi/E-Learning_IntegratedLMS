"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Loader2, RefreshCw } from "lucide-react"
import { useOutletContext } from "react-router-dom"

// Couleurs pour les types de ressources
const COLORS = {
  video: "#4f46e5", // indigo
  pdf: "#0ea5e9", // sky
  audio: "#10b981", // emerald
  other: "#6b7280", // gray
}

// Couleurs pour les moments d'étude
const MOMENT_COLORS = {
  day: "#4f46e5", // indigo
  evening: "#f59e0b", // amber
  night: "#ec4899", // pink
  morning: "#10b981", // emerald
  afternoon: "#0ea5e9", // sky
  weekend: "#8b5cf6", // violet
}

// Couleurs pour les langues
const LANGUE_COLORS = {
  french: "#4f46e5", // indigo
  english: "#0ea5e9", // sky
  spanish: "#10b981", // emerald
  german: "#f59e0b", // amber
  chinese: "#ec4899", // pink
  arabic: "#8b5cf6", // violet
  russian: "#ef4444", // red
}

// Couleurs pour les styles de contenu
const STYLE_COLORS = {
  theoretical: "#4f46e5", // indigo
  practical: "#0ea5e9", // sky
  interactive: "#10b981", // emerald
  visual: "#f59e0b", // amber
  textual: "#ec4899", // pink
  mixed: "#8b5cf6", // violet
}

// Couleurs pour les objectifs
const OBJECTIF_COLORS = {
  certification: "#4f46e5", // indigo
  "professional skills": "#0ea5e9", // sky
  "general knowledge": "#10b981", // emerald
  "academic success": "#f59e0b", // amber
  "personal development": "#ec4899", // pink
  "career change": "#8b5cf6", // violet
}

// Couleurs pour les méthodes d'étude
const METHODE_COLORS = {
  reading: "#4f46e5", // indigo
  discussion: "#0ea5e9", // sky
  project: "#10b981", // emerald
  "practical experience": "#f59e0b", // amber
  research: "#ec4899", // pink
  tutoring: "#8b5cf6", // violet
  "video learning": "#ef4444", // red
  "group study": "#06b6d4", // cyan
  "self-learning": "#4b5563", // gray-600
  other: "#6b7280", // gray
}

// Mock data for fallback (if no local or backend data)
const mockPreferences = [
  {
    typeRessource: "video",
    momentEtude: "morning",
    langue: "french",
    styleContenu: "visual",
    objectif: "academic success",
    methodeEtude: "video learning",
    module: "module1",
  },
  {
    typeRessource: "pdf",
    momentEtude: "afternoon",
    langue: "english",
    styleContenu: "theoretical",
    objectif: "certification",
    methodeEtude: "reading",
    module: "module2",
  },
  {
    typeRessource: "video",
    momentEtude: "evening",
    langue: "spanish",
    styleContenu: "interactive",
    objectif: "personal development",
    methodeEtude: "discussion",
    module: "module1",
  },
]

export default function PreferenceStatistics() {
  // Récupérer l'utilisateur depuis useOutletContext ou localStorage
  const context = useOutletContext() || {}
  const user = context.user || JSON.parse(localStorage.getItem("user") || "{}")
  console.log("User object:", user) // Debug: Vérifier l'objet utilisateur
  const isAuthenticated = !!user?._id

  const [preferences, setPreferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedModule, setSelectedModule] = useState("all")
  const [modules, setModules] = useState([])
  const [activeTab, setActiveTab] = useState("typeRessource")
  const [statsData, setStatsData] = useState({
    typeRessource: [],
    momentEtude: [],
    langue: [],
    styleContenu: [],
    objectif: [],
    methodeEtude: [],
  })

  // Fonction pour récupérer les préférences
  const fetchPreferences = async () => {
    setLoading(true)
    setError("")
    try {
      if (!isAuthenticated) {
        throw new Error("User not authenticated. Please log in.")
      }
      console.log("Fetching preferences for userId:", user._id) // Debug: Vérifier userId envoyé
      const queryParams = [
        `userId=${encodeURIComponent(user._id)}`, // Standard case
        `UserId=${encodeURIComponent(user._id)}`, // Capitalized case
        `userid=${encodeURIComponent(user._id)}`, // Lowercase case
      ]
      let fetchedData = []
      for (const param of queryParams) {
        const query = `?${param}`
        console.log("Trying request URL:", `${import.meta.env.VITE_API_PROXY}/preference/get${query}`) // Debug: Vérifier l'URL testée
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_PROXY}/preference/get${query}`, {
            withCredentials: true, // Inclure les cookies pour l'authentification
          })
          console.log("Preferences fetched from backend:", response.data) // Debug: Vérifier les données reçues
          fetchedData = response.data
          break // Sortir de la boucle si la requête réussit
        } catch (innerError) {
          console.error(`Failed with ${param}:`, innerError)
          if (
            innerError.response?.status === 400 &&
            innerError.response?.data?.message === "L'identifiant de l'utilisateur est requis."
          ) {
            continue // Passer à la prochaine variation si l'erreur persiste
          } else {
            throw innerError // Propager une autre erreur (e.g., 500)
          }
        }
      }

      // Si aucune donnée n'est récupérée, essayer les préférences locales
      if (fetchedData.length === 0) {
        const localPrefs = JSON.parse(localStorage.getItem("preferences") || "[]").filter((p) => p.user === user._id)
        console.log("Local preferences found:", localPrefs) // Debug: Vérifier les préférences locales
        if (localPrefs.length > 0) {
          fetchedData = localPrefs
        } else {
          console.log("No local preferences, using mock data")
          fetchedData = mockPreferences.map((p) => ({ ...p, user: user._id })) // Ajouter userId au mock
        }
      }

      setPreferences(fetchedData)

      // Extraire les modules uniques pour le filtre
      const uniqueModules = [...new Set(fetchedData.map((pref) => pref.module?._id || pref.module))]
      setModules(uniqueModules.map((id) => ({ id, name: `Module ${id}` }))) // Simplifié pour l'exemple
      calculateStats(fetchedData, "all")
    } catch (error) {
      console.error("Erreur lors de la récupération des préférences:", error)
      const errorMessage =
        error.response?.data?.message || error.message || "Unable to load preferences. Using local or mock data."
      setError(errorMessage)
      console.log("Error response:", error.response?.data) // Debug: Vérifier la réponse d'erreur
      console.log("Error config:", error.config) // Debug: Vérifier la configuration de la requête

      // Fallback to local or mock data on error
      const localPrefs = JSON.parse(localStorage.getItem("preferences") || "[]").filter((p) => p.user === user._id)
      if (localPrefs.length > 0) {
        console.log("Falling back to local preferences:", localPrefs)
        setPreferences(localPrefs)
        setModules([...new Set(localPrefs.map((p) => p.module))].map((id) => ({ id, name: `Module ${id}` })))
        calculateStats(localPrefs, "all")
      } else {
        console.log("Falling back to mock data")
        const mockWithUser = mockPreferences.map((p) => ({ ...p, user: user._id }))
        setPreferences(mockWithUser)
        setModules([...new Set(mockWithUser.map((p) => p.module))].map((id) => ({ id, name: `Module ${id}` })))
        calculateStats(mockWithUser, "all")
      }
    } finally {
      setLoading(false)
    }
  }

  // Calculer les statistiques pour chaque catégorie
  const calculateStats = (data, moduleFilter) => {
    const filteredData =
      moduleFilter === "all" ? data : data.filter((pref) => (pref.module?._id || pref.module) === moduleFilter)

    const countOccurrences = (array, property) => {
      const counts = {}
      array.forEach((item) => {
        const value = item[property]
        counts[value] = (counts[value] || 0) + 1
      })
      return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }

    setStatsData({
      typeRessource: countOccurrences(filteredData, "typeRessource"),
      momentEtude: countOccurrences(filteredData, "momentEtude"),
      langue: countOccurrences(filteredData, "langue"),
      styleContenu: countOccurrences(filteredData, "styleContenu"),
      objectif: countOccurrences(filteredData, "objectif"),
      methodeEtude: countOccurrences(filteredData, "methodeEtude"),
    })
  }

  // Charger les données au chargement du composant
  useEffect(() => {
    fetchPreferences()
  }, [])

  // Mettre à jour les statistiques lorsque le module change
  const handleModuleChange = (e) => {
    const value = e.target.value
    setSelectedModule(value)
    calculateStats(preferences, value)
  }

  // Formater les pourcentages pour les tooltips
  const formatPercentage = (value, total) => {
    return `${Math.round((value / total) * 100)}%`
  }

  // Calculer le total pour les pourcentages
  const getTotalCount = (data) => {
    return data.reduce((sum, item) => sum + item.value, 0)
  }

  // Tooltip personnalisé pour les graphiques
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{`${payload[0].name || label}: ${payload[0].value}`}</p>
          {getTotalCount(payload[0].payload.parentData || []) > 0 && (
            <p className="text-gray-600">{`${formatPercentage(
              payload[0].value,
              getTotalCount(payload[0].payload.parentData || []),
            )}`}</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Preference Statistics</h1>
            <p className="text-gray-600 mt-1">Analysis of student learning preferences</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={selectedModule}
              onChange={handleModuleChange}
              className="w-full md:w-[220px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All modules</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={fetchPreferences}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md flex justify-between items-center">
            <span>{error}</span>
            <button onClick={fetchPreferences} className="underline">
              Try Again
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-3 rounded-md">
            <span>You must be logged in to view your preferences.</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading statistics...</span>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
              {Object.keys(statsData).map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 font-medium text-sm rounded-t-md transition-colors ${
                    activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "typeRessource"
                    ? "Resource Type"
                    : tab === "momentEtude"
                      ? "Study Time"
                      : tab === "langue"
                        ? "Language"
                        : tab === "styleContenu"
                          ? "Content Style"
                          : tab === "objectif"
                            ? "Objective"
                            : "Study Method"}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {activeTab === "typeRessource" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Resource Type Distribution</h2>
                    <p className="text-gray-600 mb-4 text-sm">Preferences by resource type</p>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statsData.typeRessource.map((item) => ({
                              ...item,
                              parentData: statsData.typeRessource,
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statsData.typeRessource.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.other} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Preferred Resource Types</h2>
                    <p className="text-gray-600 mb-4 text-sm">Number of preferences by type</p>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statsData.typeRessource.map((item) => ({
                            ...item,
                            parentData: statsData.typeRessource,
                          }))}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" nameKey="name" radius={[0, 4, 4, 0]}>
                            {statsData.typeRessource.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.other} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "momentEtude" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Study Time Distribution</h2>
                    <p className="text-gray-600 mb-4 text-sm">Preferences by time</p>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statsData.momentEtude.map((item) => ({ ...item, parentData: statsData.momentEtude }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statsData.momentEtude.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={MOMENT_COLORS[entry.name] || COLORS.other} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Preferred Study Times</h2>
                    <p className="text-gray-600 mb-4 text-sm">Number of preferences by time</p>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statsData.momentEtude.map((item) => ({ ...item, parentData: statsData.momentEtude }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" nameKey="name" radius={[4, 4, 0, 0]}>
                            {statsData.momentEtude.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={MOMENT_COLORS[entry.name] || COLORS.other} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "langue" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Language Distribution</h2>
                    <p className="text-gray-600 mb-4 text-sm">Preferences by language</p>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statsData.langue.map((item) => ({ ...item, parentData: statsData.langue }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statsData.langue.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={LANGUE_COLORS[entry.name] || COLORS.other} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Preferred Languages</h2>
                    <p className="text-gray-600 mb-4 text-sm">Number of preferences by language</p>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statsData.langue.map((item) => ({ ...item, parentData: statsData.langue }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" nameKey="name" radius={[4, 4, 0, 0]}>
                            {statsData.langue.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={LANGUE_COLORS[entry.name] || COLORS.other} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "styleContenu" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Content Style Distribution</h2>
                    <p className="text-gray-600 mb-4 text-sm">Preferences by content style</p>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statsData.styleContenu.map((item) => ({
                              ...item,
                              parentData: statsData.styleContenu,
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statsData.styleContenu.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={STYLE_COLORS[entry.name] || COLORS.other} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Preferred Content Styles</h2>
                    <p className="text-gray-600 mb-4 text-sm">Number of preferences by style</p>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statsData.styleContenu.map((item) => ({ ...item, parentData: statsData.styleContenu }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" nameKey="name" radius={[4, 4, 0, 0]}>
                            {statsData.styleContenu.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={STYLE_COLORS[entry.name] || COLORS.other} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "objectif" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Objective Distribution</h2>
                    <p className="text-gray-600 mb-4 text-sm">Preferences by objective</p>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statsData.objectif.map((item) => ({ ...item, parentData: statsData.objectif }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statsData.objectif.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={OBJECTIF_COLORS[entry.name] || COLORS.other} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Preferred Objectives</h2>
                    <p className="text-gray-600 mb-4 text-sm">Number of preferences by objective</p>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statsData.objectif.map((item) => ({ ...item, parentData: statsData.objectif }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" nameKey="name" radius={[4, 4, 0, 0]}>
                            {statsData.objectif.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={OBJECTIF_COLORS[entry.name] || COLORS.other} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "methodeEtude" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Study Method Distribution</h2>
                    <p className="text-gray-600 mb-4 text-sm">Preferences by study method</p>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statsData.methodeEtude.map((item) => ({
                              ...item,
                              parentData: statsData.methodeEtude,
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statsData.methodeEtude.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={METHODE_COLORS[entry.name] || COLORS.other} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Preferred Study Methods</h2>
                    <p className="text-gray-600 mb-4 text-sm">Number of preferences by method</p>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statsData.methodeEtude.map((item) => ({ ...item, parentData: statsData.methodeEtude }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" nameKey="name" radius={[4, 4, 0, 0]}>
                            {statsData.methodeEtude.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={METHODE_COLORS[entry.name] || COLORS.other} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && preferences.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-bold mb-1">Statistics Summary</h2>
            <p className="text-gray-600 mb-4 text-sm">Overview of learning preferences</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-800">Total Preferences</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{preferences.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-800">Popular Resource Type</h3>
                {statsData.typeRessource.length > 0 && (
                  <p
                    className="text-2xl font-bold mt-2"
                    style={{
                      color: COLORS[statsData.typeRessource.sort((a, b) => b.value - a.value)[0].name] || COLORS.other,
                    }}
                  >
                    {statsData.typeRessource.sort((a, b) => b.value - a.value)[0].name}
                  </p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-800">Preferred Study Time</h3>
                {statsData.momentEtude.length > 0 && (
                  <p
                    className="text-2xl font-bold mt-2"
                    style={{
                      color:
                        MOMENT_COLORS[statsData.momentEtude.sort((a, b) => b.value - a.value)[0].name] || COLORS.other,
                    }}
                  >
                    {statsData.momentEtude.sort((a, b) => b.value - a.value)[0].name}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
