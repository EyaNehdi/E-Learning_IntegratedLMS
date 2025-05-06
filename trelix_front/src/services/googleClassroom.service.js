// services/googleClassroom.service.js
import axios from "axios"

const API_URL = "http://localhost:5000/api" // Ajustez selon votre configuration

// Fonction pour se connecter avec Google
export const loginWithGoogle = async () => {
  window.location.href = `${API_URL}/auth/google/login`
}

// Fonction pour vérifier l'authentification
export const checkAuth = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/google/check-auth`, { withCredentials: true })
    return response.data.isAuthenticated
  } catch (error) {
    console.error("Erreur lors de la vérification de l'authentification:", error)
    return false
  }
}

// Fonction pour se déconnecter
export const logout = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/google/logout`, { withCredentials: true })
    return response.data
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error)
    throw error
  }
}

// Fonction pour récupérer les cours
export const getCourses = async () => {
  try {
    const response = await axios.get(`${API_URL}/classroom/courses`, { withCredentials: true })
    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error)
    throw error
  }
}

// Fonction pour récupérer les détails d'un cours
export const getCourseDetails = async (courseId) => {
  try {
    console.log(`Récupération des détails du cours ${courseId}...`)
    const response = await axios.get(`${API_URL}/classroom/courses/${courseId}`, {
      withCredentials: true,
      timeout: 60000, // Augmenter le timeout à 60 secondes car la récupération des détails peut prendre du temps
    })

    // Log pour déboguer
    console.log("Réponse reçue:", response.data)

    // Vérifier si les données sont présentes
    if (response.data && response.data.data) {
      // Vérifier si les annonces sont présentes mais pas les documents
      if (
        response.data.data.announcements &&
        response.data.data.announcements.length > 0 &&
        (!response.data.data.documents || response.data.data.documents.length === 0)
      ) {
        console.log("Création de documents à partir des annonces...")
        response.data.data.documents = response.data.data.announcements.map((announcement) => ({
          ...announcement,
          id: `announcement-${announcement.id}`,
          name: announcement.text || "Annonce sans titre",
          text: announcement.text || "Annonce sans titre",
        }))
      }

      // Vérifier si les topics sont présents
      if (response.data.data.topics && response.data.data.topics.length > 0) {
        console.log("Traitement des topics...")

        // Créer un index des documents par topic
        const documentsByTopic = {}

        // Si des documents existent, les organiser par topic
        if (response.data.data.documents && response.data.data.documents.length > 0) {
          for (const doc of response.data.data.documents) {
            // Si le document a un topicId explicite
            if (doc.topicId) {
              if (!documentsByTopic[doc.topicId]) {
                documentsByTopic[doc.topicId] = []
              }
              documentsByTopic[doc.topicId].push(doc)
            }
            // Si le document a des documents associés
            else if (doc.associatedDocuments && doc.associatedDocuments.length > 0) {
              for (const associatedDoc of doc.associatedDocuments) {
                if (associatedDoc.topicId) {
                  if (!documentsByTopic[associatedDoc.topicId]) {
                    documentsByTopic[associatedDoc.topicId] = []
                  }
                  documentsByTopic[associatedDoc.topicId].push(associatedDoc)
                }
              }
            }
          }
        }

        // Pour chaque topic, s'assurer qu'il a un document associé
        for (const topic of response.data.data.topics) {
          // Vérifier si ce topic a déjà des documents associés
          const hasDocuments = response.data.data.documents.some(
            (doc) => doc.topicId === topic.topicId || doc.id === `topic-${topic.topicId}`,
          )

          if (!hasDocuments) {
            // Créer un document pour ce topic
            const topicDoc = {
              id: `topic-${topic.topicId}`,
              name: topic.name,
              text: topic.name,
              topicId: topic.topicId,
              creationTime: topic.updateTime || new Date().toISOString(),
              materials: [],
              isEmptyTopic: !documentsByTopic[topic.topicId] || documentsByTopic[topic.topicId].length === 0,
            }

            // Si des documents sont associés à ce topic, ajouter leurs matériels
            if (documentsByTopic[topic.topicId] && documentsByTopic[topic.topicId].length > 0) {
              topicDoc.materials = documentsByTopic[topic.topicId].flatMap((doc) => doc.materials || [])
              topicDoc.associatedDocuments = documentsByTopic[topic.topicId]
              console.log(`Document créé pour le topic "${topic.name}" avec ${topicDoc.materials.length} matériels`)
            } else {
              console.log(`Document vide créé pour le topic "${topic.name}"`)
            }

            response.data.data.documents.push(topicDoc)
          }
        }
      }

      // Vérifier si les documents sont maintenant présents
      if (response.data.data.documents) {
        console.log(`${response.data.data.documents.length} documents trouvés dans la réponse finale`)
      } else {
        console.log("Aucun document trouvé dans la réponse après traitement")
      }
    }

    return response.data
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du cours:", error)
    throw error
  }
}
