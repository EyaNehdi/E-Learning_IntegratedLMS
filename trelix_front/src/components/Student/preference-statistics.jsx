"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Loader2, RefreshCw } from "lucide-react"

// Définition des couleurs pour les différents types de ressources
const COLORS = {
  vidéo: "#4f46e5", // indigo
  pdf: "#0ea5e9", // sky
  audio: "#10b981", // emerald
  quiz: "#f59e0b", // amber
  "exercice interactif": "#ec4899", // pink
  webinaire: "#8b5cf6", // violet
  infographie: "#ef4444", // red
  diapositives: "#06b6d4", // cyan
  autre: "#6b7280", // gray
}

// Couleurs pour les autres catégories
const MOMENT_COLORS = {
  jour: "#4f46e5", // indigo
  soir: "#f59e0b", // amber
}

const LANGUE_COLORS = {
  français: "#4f46e5", // indigo
  anglais: "#0ea5e9", // sky
  espagnol: "#10b981", // emerald
}

const STYLE_COLORS = {
  théorique: "#4f46e5", // indigo
  pratique: "#0ea5e9", // sky
  "exercices interactifs": "#10b981", // emerald
}

const OBJECTIF_COLORS = {
  certification: "#4f46e5", // indigo
  "compétence métier": "#0ea5e9", // sky
  "culture générale": "#10b981", // emerald
}

const METHODE_COLORS = {
  lecture: "#4f46e5", // indigo
  discussion: "#0ea5e9", // sky
  projet: "#10b981", // emerald
  "expérience pratique": "#f59e0b", // amber
  recherche: "#ec4899", // pink
  tutorat: "#8b5cf6", // violet
  autre: "#6b7280", // gray
}

export default function PreferenceStatistics() {
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
      const response = await axios.get("http://localhost:5000/preference/get")
      setPreferences(response.data)

      // Extraire les modules uniques pour le filtre
      const uniqueModules = [...new Set(response.data.map((pref) => pref.module?._id || pref.module))]

      // Récupérer les détails des modules
      const moduleResponse = await axios.get("http://localhost:5000/module")
      const moduleData = moduleResponse.data

      // Créer la liste des modules pour le filtre
      const moduleList = uniqueModules.map((moduleId) => {
        const moduleInfo = Array.isArray(moduleData)
          ? moduleData.find((m) => m._id === moduleId)
          : moduleData.modules?.find((m) => m._id === moduleId)

        return {
          id: moduleId,
          name: moduleInfo
            ? moduleInfo.title || moduleInfo.name || moduleInfo.moduleName || moduleInfo.nom || "Module sans nom"
            : "Module inconnu",
        }
      })

      setModules(moduleList)

      // Calculer les statistiques
      calculateStats(response.data, "all")
    } catch (error) {
      console.error("Erreur lors de la récupération des préférences:", error)
      setError("Impossible de charger les préférences. Veuillez réessayer plus tard.")
    } finally {
      setLoading(false)
    }
  }

  // Calculer les statistiques pour chaque catégorie
  const calculateStats = (data, moduleFilter) => {
    // Filtrer par module si nécessaire
    const filteredData =
      moduleFilter === "all" ? data : data.filter((pref) => (pref.module?._id || pref.module) === moduleFilter)

    // Fonction pour compter les occurrences
    const countOccurrences = (array, property) => {
      const counts = {}
      array.forEach((item) => {
        const value = item[property]
        counts[value] = (counts[value] || 0) + 1
      })
      return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }

    // Calculer les statistiques pour chaque catégorie
    const typeRessourceStats = countOccurrences(filteredData, "typeRessource")
    const momentEtudeStats = countOccurrences(filteredData, "momentEtude")
    const langueStats = countOccurrences(filteredData, "langue")
    const styleContenuStats = countOccurrences(filteredData, "styleContenu")
    const objectifStats = countOccurrences(filteredData, "objectif")
    const methodeEtudeStats = countOccurrences(filteredData, "methodeEtude")

    setStatsData({
      typeRessource: typeRessourceStats,
      momentEtude: momentEtudeStats,
      langue: langueStats,
      styleContenu: styleContenuStats,
      objectif: objectifStats,
      methodeEtude: methodeEtudeStats,
    })
  }

  // Charger les données au chargement du composant
  useEffect(() => {
    fetchPreferences()
  }, [])

  // Mettre à jour les statistiques lorsque le module sélectionné change
  const handleModuleChange = (e) => {
    const value = e.target.value
    setSelectedModule(value)
    calculateStats(preferences, value)
  }

  // Fonction pour formater les pourcentages
  const formatPercentage = (value, total) => {
    return `${Math.round((value / total) * 100)}%`
  }

  // Calculer le total pour les pourcentages
  const getTotalCount = (data) => {
    return data.reduce((sum, item) => sum + item.value, 0)
  }

  // Composant personnalisé pour le tooltip des graphiques
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

  // Rendu du composant
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Preference statistics
            </h1>
            <p className="text-gray-600 mt-1">Analysis of Students' Learning Preferences
</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={selectedModule}
              onChange={handleModuleChange}
              className="w-full md:w-[220px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les modules</option>
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
              Actualiser
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md">{error}</div>}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Chargement des statistiques...</span>
          </div>
        ) : (
          <div className="w-full">
            {/* Onglets personnalisés */}
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
                    ? "Type de ressource"
                    : tab === "momentEtude"
                      ? "Moment d'étude"
                      : tab === "langue"
                        ? "Langue"
                        : tab === "styleContenu"
                          ? "Style de contenu"
                          : tab === "objectif"
                            ? "Objectif"
                            : "Méthode d'étude"}
                </button>
              ))}
            </div>

            {/* Contenu des onglets */}
            <div className="space-y-6">
              {/* Onglet Type de ressource */}
              {activeTab === "typeRessource" && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-bold mb-1">Distribution of resource types                      </h2>
                      <p className="text-gray-600 mb-4 text-sm">Distribution of preferences by resource type                      </p>
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
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.autre} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-bold mb-1">Preferred resource types
                      </h2>
                      <p className="text-gray-600 mb-4 text-sm">Number of preferences per resource type</p>
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
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.autre} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                
                </>
              )}

              {/* Onglet Moment d'étude */}
              {activeTab === "momentEtude" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Distribution of study times                    </h2>
                    <p className="text-gray-600 mb-4 text-sm">Preference between day and evening</p>
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
                              <Cell key={`cell-${index}`} fill={MOMENT_COLORS[entry.name] || COLORS.autre} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Favorite study times                    </h2>
                    <p className="text-gray-600 mb-4 text-sm">Number of preferences per study time                    </p>
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
                              <Cell key={`cell-${index}`} fill={MOMENT_COLORS[entry.name] || COLORS.autre} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Langue */}
              {activeTab === "langue" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Distribution of languages                    </h2>
                    <p className="text-gray-600 mb-4 text-sm">Distribution of preferences by language</p>
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
                              <Cell key={`cell-${index}`} fill={LANGUE_COLORS[entry.name] || COLORS.autre} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Preferred languages
                    </h2>
                    <p className="text-gray-600 mb-4 text-sm">Number of preferences per language</p>
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
                              <Cell key={`cell-${index}`} fill={LANGUE_COLORS[entry.name] || COLORS.autre} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Style de contenu */}
              {activeTab === "styleContenu" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Distribution of content styles</h2>
                    <p className="text-gray-600 mb-4 text-sm">Distribution of preferences by content style</p>
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
                              <Cell key={`cell-${index}`} fill={STYLE_COLORS[entry.name] || COLORS.autre} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Preferred Content Styles</h2>
                    <p className="text-gray-600 mb-4 text-sm">Number of preferences per content style</p>
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
                              <Cell key={`cell-${index}`} fill={STYLE_COLORS[entry.name] || COLORS.autre} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Objectif */}
              {activeTab === "objectif" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Distribution of objectives</h2>
                    <p className="text-gray-600 mb-4 text-sm">Distribution of preferences by objective
                    </p>
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
                              <Cell key={`cell-${index}`} fill={OBJECTIF_COLORS[entry.name] || COLORS.autre} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Favorite goals
                    </h2>
                    <p className="text-gray-600 mb-4 text-sm">Number of preferences per goal</p>
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
                              <Cell key={`cell-${index}`} fill={OBJECTIF_COLORS[entry.name] || COLORS.autre} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Méthode d'étude */}
              {activeTab === "methodeEtude" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Distribution of study methods</h2>
                    <p className="text-gray-600 mb-4 text-sm">Distribution of preferences by study method</p>
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
                              <Cell key={`cell-${index}`} fill={METHODE_COLORS[entry.name] || COLORS.autre} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-1">Preferred study methods</h2>
                    <p className="text-gray-600 mb-4 text-sm">Number of preferences by study method</p>
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
                              <Cell key={`cell-${index}`} fill={METHODE_COLORS[entry.name] || COLORS.autre} />
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

        {/* Résumé des statistiques */}
        {!loading && preferences.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-bold mb-1">Summary of statistics
            </h2>
            <p className="text-gray-600 mb-4 text-sm">Overview of learning preferences</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-800">Total preferences
                </h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{preferences.length}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-800">Most popular resource type
                </h3>
                {statsData.typeRessource.length > 0 && (
                  <p
                    className="text-2xl font-bold mt-2"
                    style={{
                      color: COLORS[statsData.typeRessource.sort((a, b) => b.value - a.value)[0].name] || COLORS.autre,
                    }}
                  >
                    {statsData.typeRessource.sort((a, b) => b.value - a.value)[0].name}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-800">Favorite study time
                </h3>
                {statsData.momentEtude.length > 0 && (
                  <p
                    className="text-2xl font-bold mt-2"
                    style={{
                      color:
                        MOMENT_COLORS[statsData.momentEtude.sort((a, b) => b.value - a.value)[0].name] || COLORS.autre,
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
