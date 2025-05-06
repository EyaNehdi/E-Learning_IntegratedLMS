"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getCourseDetails } from "../../services/googleClassroom.service"

const CourseDetailsPage = () => {
  const { courseId } = useParams()
  const [courseDetails, setCourseDetails] = useState(null)
  const [loading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("documentation") // Onglet documentation par défaut
  const [debug, setDebug] = useState(null) // Pour le débogage

  useEffect(() => {
    fetchCourseDetails()
  }, [courseId])

  const fetchCourseDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Récupération des détails du cours:", courseId)
      const response = await getCourseDetails(courseId)

      // Débogage
      console.log("Réponse complète:", response)
      setDebug(JSON.stringify(response, null, 2))

      if (response.success === false) {
        throw new Error(response.error || "Erreur lors de la récupération des détails du cours")
      }

      setCourseDetails(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error("Erreur:", error)
      setError("Une erreur est survenue lors de la récupération des détails du cours.")
      setIsLoading(false)
    }
  }

  // Fonction pour obtenir l'icône du matériel
  const getMaterialIcon = (material) => {
    if (!material) return "📄"

    if (material.driveFile) {
      // Vérifier le type de fichier si disponible
      if (material.driveFile.additionalInfo && material.driveFile.additionalInfo.mimeType) {
        const mimeType = material.driveFile.additionalInfo.mimeType
        if (mimeType.includes("pdf")) return "📕"
        if (mimeType.includes("document")) return "📝"
        if (mimeType.includes("spreadsheet")) return "📊"
        if (mimeType.includes("presentation")) return "📊"
        if (mimeType.includes("image")) return "🖼️"
      }
      return "📄"
    }
    if (material.youtubeVideo) return "🎬"
    if (material.link) return "🔗"
    if (material.form) return "📝"
    return "📄"
  }

  // Fonction pour obtenir le lien du matériel
  const getMaterialLink = (material) => {
    if (!material) return "#"

    if (material.driveFile) {
      // Utiliser le lien webViewLink s'il est disponible dans les informations additionnelles
      if (material.driveFile.additionalInfo && material.driveFile.additionalInfo.webViewLink) {
        return material.driveFile.additionalInfo.webViewLink
      }
      // Sinon utiliser le lien alternateLink s'il est disponible
      if (material.driveFile.driveFile && material.driveFile.driveFile.alternateLink) {
        return material.driveFile.driveFile.alternateLink
      }
    }
    if (material.youtubeVideo && material.youtubeVideo.alternateLink) return material.youtubeVideo.alternateLink
    if (material.link && material.link.url) return material.link.url
    if (material.form && material.form.formUrl) return material.form.formUrl
    return "#"
  }

  // Fonction pour obtenir le titre du matériel
  const getMaterialTitle = (material) => {
    if (!material) return "Document"

    if (material.driveFile) {
      // Utiliser le nom du fichier s'il est disponible dans les informations additionnelles
      if (material.driveFile.additionalInfo && material.driveFile.additionalInfo.name) {
        return material.driveFile.additionalInfo.name
      }
      // Sinon utiliser le titre s'il est disponible
      if (material.driveFile.driveFile && material.driveFile.driveFile.title) {
        return material.driveFile.driveFile.title
      }
    }
    if (material.youtubeVideo && material.youtubeVideo.title) return material.youtubeVideo.title
    if (material.link && (material.link.title || material.link.url)) return material.link.title || material.link.url
    if (material.form && material.form.title) return material.form.title
    return "Document"
  }

  // Fonction pour déterminer si un matériel est un PDF
  const isPdfMaterial = (material) => {
    if (!material || !material.driveFile) return false

    // Vérifier via additionalInfo si disponible
    if (material.driveFile.additionalInfo && material.driveFile.additionalInfo.mimeType) {
      return material.driveFile.additionalInfo.mimeType.includes("pdf")
    }

    // Sinon essayer de deviner par le titre
    if (material.driveFile.driveFile && material.driveFile.driveFile.title) {
      return material.driveFile.driveFile.title.toLowerCase().endsWith(".pdf")
    }

    return false
  }

  // NOUVELLE FONCTION: Grouper les documents par topic
  const getDocumentsByTopic = () => {
    if (!courseDetails || !courseDetails.documents || !courseDetails.topics) {
      return {}
    }

    const documentsByTopic = {}

    // Initialiser un groupe pour les documents sans topic
    documentsByTopic["sans-topic"] = {
      name: "Documents sans thème",
      documents: [],
    }

    // Pour chaque topic, créer un groupe
    courseDetails.topics.forEach((topic) => {
      documentsByTopic[topic.topicId] = {
        name: topic.name,
        documents: [],
      }
    })

    // Répartir les documents dans les groupes
    courseDetails.documents.forEach((document) => {
      // Si le document est explicitement lié à un topic
      if (document.id && document.id.startsWith("topic-")) {
        const topicId = document.id.replace("topic-", "")
        if (documentsByTopic[topicId]) {
          documentsByTopic[topicId].documents.push(document)
        } else {
          documentsByTopic["sans-topic"].documents.push(document)
        }
      }
      // Si le document a un topicId explicite
      else if (document.topicId) {
        if (documentsByTopic[document.topicId]) {
          documentsByTopic[document.topicId].documents.push(document)
        } else {
          documentsByTopic["sans-topic"].documents.push(document)
        }
      }
      // Sinon, essayer de faire correspondre par nom
      else {
        const documentName = (document.name || document.text || "").toLowerCase()
        let matched = false

        for (const topicId in documentsByTopic) {
          if (topicId === "sans-topic") continue

          const topicName = documentsByTopic[topicId].name.toLowerCase()
          if (documentName.includes(topicName) || topicName.includes(documentName)) {
            documentsByTopic[topicId].documents.push(document)
            matched = true
            break
          }
        }

        if (!matched) {
          documentsByTopic["sans-topic"].documents.push(document)
        }
      }
    })

    // Filtrer les groupes vides
    const filteredGroups = {}
    for (const topicId in documentsByTopic) {
      if (documentsByTopic[topicId].documents.length > 0) {
        filteredGroups[topicId] = documentsByTopic[topicId]
      }
    }

    return filteredGroups
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-lg shadow-md">
        <h1 className="text-xl font-bold text-red-700 mb-2">Erreur</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex space-x-4">
          <button onClick={fetchCourseDetails} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
            Réessayer
          </button>
          <Link to="/classroom" className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">
            Retour aux cours
          </Link>
        </div>
      </div>
    )
  }

  if (!courseDetails) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-yellow-50 rounded-lg shadow-md">
        <h1 className="text-xl font-bold text-yellow-700 mb-2">Cours non trouvé</h1>
        <p className="text-yellow-600 mb-4">
          Le cours demandé n'existe pas ou vous n'avez pas les permissions nécessaires.
        </p>
        <Link to="/classroom" className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded">
          Retour aux cours
        </Link>
      </div>
    )
  }

  const { course, topics, courseWork, announcements, courseWorkMaterials, documents } = courseDetails
  const documentsByTopic = getDocumentsByTopic()

  // Bouton de débogage (à supprimer en production)
  const toggleDebug = () => {
    const debugElement = document.getElementById("debug-info")
    if (debugElement) {
      debugElement.style.display = debugElement.style.display === "none" ? "block" : "none"
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Link to="/classroom" className="inline-flex items-center text-blue-500 hover:text-blue-700 mb-6">
        <svg
          className="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to course
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{course.name}</h1>
            <p className="text-gray-600 mb-4">{course.section || "Aucune section"}</p>
            <p className="text-gray-500">{course.description || "Aucune description disponible"}</p>
          </div>
        
        </div>
      </div>

      {/* Section de débogage (à supprimer en production) */}
      <div
        id="debug-info"
        style={{ display: "none" }}
        className="bg-gray-100 p-4 mb-6 rounded-lg overflow-auto max-h-96"
      >
        <h3 className="font-bold mb-2">Informations de débogage:</h3>
        <pre className="text-xs">{debug}</pre>
      </div>

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-medium ${activeTab === "documentation" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("documentation")}
          >
            Documentation ({documents ? documents.length : 0})
          </button>
       
          <button
            className={`py-2 px-4 font-medium ${activeTab === "materials" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("materials")}
          >
            Materials
            ({courseWorkMaterials ? courseWorkMaterials.length : 0})
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === "courseWork" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("courseWork")}
          >
            Works ({courseWork ? courseWork.length : 0})
          </button>
        </div>
      </div>

      {/* Onglet Documentation */}
      {activeTab === "documentation" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Course documentation  </h2>
          {!documents || documents.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Aucune documentation trouvée pour ce cours.</p>
              <p className="text-gray-500 mt-2 text-sm">
                Pour ajouter de la documentation, allez dans Google Classroom, ouvrez ce cours, cliquez sur "Créer" puis
                "Documentation".
              </p>
              <a
                href={course.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
              >
                Ajouter de la documentation dans Google Classroom
              </a>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Afficher les documents groupés par topic */}
              {Object.keys(documentsByTopic).map((topicId) => (
                <div key={topicId} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 pb-2 border-b">{documentsByTopic[topicId].name}</h3>
                  <div className="space-y-4">
                    {documentsByTopic[topicId].documents.map((document) => (
                      <div key={document.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                        <h4 className="text-lg font-medium mb-2">
                          {document.text || document.name || "Document sans titre"}
                        </h4>
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">
                            {new Date(document.updateTime || document.creationTime).toLocaleDateString()}
                          </span>
                        </div>
                        {document.isEmptyTopic ? (
                          <div className="bg-yellow-50 p-3 rounded-md">
                            <p className="text-yellow-700 text-sm">
                              Aucun document n'a été trouvé pour ce thème. Ajoutez des documents dans Google Classroom.
                            </p>
                          </div>
                        ) : document.materials && document.materials.length > 0 ? (
                          <div>
                            <h5 className="text-md font-medium mb-2">Fichiers:</h5>
                            <ul className="space-y-2">
                              {document.materials.map((material, idx) => {
                                const isPdf = isPdfMaterial(material)
                                return (
                                  <li
                                    key={idx}
                                    className={`flex items-center p-2 rounded ${isPdf ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}
                                  >
                                    <span className="mr-2 text-xl">{getMaterialIcon(material)}</span>
                                    <a
                                      href={getMaterialLink(material)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline flex-1"
                                    >
                                      {getMaterialTitle(material)}
                                    </a>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-gray-500 text-sm">Aucun fichier attaché à ce document.</p>
                          </div>
                        )}
                        {document.alternateLink && (
                          <div className="mt-4">
                            <a
                              href={document.alternateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline text-sm inline-flex items-center"
                            >
                              Voir dans Google Classroom
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                ></path>
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onglet Chapitres */}
      {activeTab === "topics" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Chapitres du cours</h2>
          {!topics || topics.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Aucun chapitre trouvé pour ce cours.</p>
              <p className="text-gray-500 mt-2 text-sm">
                Pour ajouter des chapitres, allez dans Google Classroom, ouvrez ce cours, cliquez sur l'onglet "Travaux
                et devoirs", puis sur "Créer" et sélectionnez "Thème".
              </p>
              <a
                href={course.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
              >
                Ajouter des chapitres dans Google Classroom
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.topicId} className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-medium mb-2">{topic.name}</h3>
                  {topic.updateTime && (
                    <p className="text-sm text-gray-500 mb-3">
                      Mis à jour: {new Date(topic.updateTime).toLocaleDateString()}
                    </p>
                  )}

                  {/* Afficher les documents associés à ce topic */}
                  {documentsByTopic[topic.topicId] && documentsByTopic[topic.topicId].documents.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium mb-2">Documents associés:</h4>
                      <ul className="space-y-2">
                     
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onglet Matériels */}
      {activeTab === "materials" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Matériels de cours</h2>
          {!courseWorkMaterials || courseWorkMaterials.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Aucun matériel trouvé pour ce cours.</p>
              <p className="text-gray-500 mt-2 text-sm">
                Pour ajouter des matériels, allez dans Google Classroom, ouvrez ce cours, cliquez sur "Créer" puis
                "Matériel".
              </p>
              <a
                href={course.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
              >
                Ajouter des matériels dans Google Classroom
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {courseWorkMaterials.map((material) => (
                <div key={material.id} className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-medium mb-2">{material.title}</h3>
                  {material.description && <p className="mb-4 text-gray-700">{material.description}</p>}
                  {material.materials && material.materials.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium mb-2">Fichiers:</h4>
                      <ul className="space-y-2">
                        {material.materials.map((item, idx) => {
                          const isPdf = isPdfMaterial(item)
                          return (
                            <li
                              key={idx}
                              className={`flex items-center p-2 rounded ${isPdf ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}
                            >
                              <span className="mr-2 text-xl">{getMaterialIcon(item)}</span>
                              <a
                                href={getMaterialLink(item)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline flex-1"
                              >
                                {getMaterialTitle(item)}
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  {material.alternateLink && (
                    <div className="mt-4">
                      <a
                        href={material.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm inline-flex items-center"
                      >
                        Voir dans Google Classroom
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          ></path>
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onglet Travaux */}
      {activeTab === "courseWork" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Travaux du cours</h2>
          {!courseWork || courseWork.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Aucun travail trouvé pour ce cours.</p>
              <p className="text-gray-500 mt-2 text-sm">
                Pour ajouter des travaux, allez dans Google Classroom, ouvrez ce cours, cliquez sur l'onglet "Travaux et
                devoirs", puis sur "Créer" et sélectionnez "Devoir".
              </p>
              <a
                href={course.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
              >
                Ajouter des travaux dans Google Classroom
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {courseWork.map((work) => (
                <div key={work.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium mb-2">{work.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${work.state === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {work.state === "PUBLISHED" ? "Publié" : "Brouillon"}
                    </span>
                  </div>

                  {work.description && <p className="text-gray-600 mb-3">{work.description}</p>}

                  <div className="flex text-sm text-gray-500 mb-3">
                    <span className="mr-4">Créé: {new Date(work.creationTime).toLocaleDateString()}</span>
                    {work.dueDate && (
                      <span>
                        Date limite: {`${work.dueDate.month}/${work.dueDate.day}/${work.dueDate.year}`}
                        {work.dueTime && ` à ${work.dueTime.hours}:${work.dueTime.minutes || "00"}`}
                      </span>
                    )}
                  </div>

                  {/* Afficher les matériels attachés au travail */}
                  {work.materials && work.materials.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-md font-medium mb-2">Matériels:</h4>
                      <ul className="space-y-2">
                        {work.materials.map((material, idx) => {
                          const isPdf = isPdfMaterial(material)
                          return (
                            <li
                              key={idx}
                              className={`flex items-center p-2 rounded ${isPdf ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}
                            >
                              <span className="mr-2 text-xl">{getMaterialIcon(material)}</span>
                              <a
                                href={getMaterialLink(material)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline flex-1"
                              >
                                {getMaterialTitle(material)}
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  <a
                    href={work.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm inline-flex items-center"
                  >
                    Voir dans Google Classroom
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      ></path>
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CourseDetailsPage
