// services/classroomService.js
const { google } = require("googleapis")

// Configurer le client OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

// Générer l'URL d'authentification
const getAuthUrl = () => {
  const scopes = [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
    "https://www.googleapis.com/auth/classroom.topics.readonly",
    "https://www.googleapis.com/auth/classroom.rosters.readonly",
    "https://www.googleapis.com/auth/classroom.announcements.readonly",
    "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
    "https://www.googleapis.com/auth/drive.readonly", // Accès aux fichiers Drive
    "profile",
    "email",
  ]

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  })
}

// Échanger le code contre des tokens
const getTokensFromCode = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code)
    return tokens
  } catch (error) {
    console.error("Erreur lors de l'échange du code contre des tokens:", error)
    throw error
  }
}

// Rafraîchir un token expiré
const refreshAccessToken = async (refreshToken) => {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    const { credentials } = await oauth2Client.refreshAccessToken()

    return {
      accessToken: credentials.access_token,
      expiryDate: new Date(Date.now() + credentials.expires_in * 1000),
    }
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error)
    throw error
  }
}

// Obtenir les cours
const getCourses = async (accessToken) => {
  try {
    console.log("Récupération des cours avec le token:", accessToken ? "Token présent" : "Token absent")

    oauth2Client.setCredentials({ access_token: accessToken })
    const classroom = google.classroom({ version: "v1", auth: oauth2Client })

    const response = await classroom.courses.list({
      teacherId: "me",
      courseStates: ["ACTIVE", "ARCHIVED", "PROVISIONED", "DECLINED"],
    })

    console.log("Cours récupérés:", response.data.courses ? response.data.courses.length : 0)
    return response.data.courses || []
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error)
    throw error
  }
}

// Obtenir les détails d'un cours
const getCourseDetails = async (accessToken, courseId) => {
  try {
    oauth2Client.setCredentials({ access_token: accessToken })
    const classroom = google.classroom({ version: "v1", auth: oauth2Client })
    const drive = google.drive({ version: "v3", auth: oauth2Client })

    console.log(`Récupération des détails du cours ${courseId}...`)

    // Récupérer les informations du cours
    const course = await classroom.courses.get({ id: courseId })
    console.log("Informations du cours récupérées:", course.data.name)

    // Récupérer les topics (chapitres)
    console.log(`Récupération des topics pour le cours ${courseId}...`)
    let topics = []
    try {
      const topicsResponse = await classroom.courses.topics.list({ courseId })
      topics = topicsResponse.data.topic || []
      console.log(`${topics.length} topics récupérés`)
    } catch (topicError) {
      console.error("Erreur lors de la récupération des topics:", topicError)
      topics = []
    }

    // Récupérer les travaux du cours
    console.log(`Récupération des travaux pour le cours ${courseId}...`)
    let courseWork = []
    try {
      const courseWorkResponse = await classroom.courses.courseWork.list({ courseId })
      courseWork = courseWorkResponse.data.courseWork || []
      console.log(`${courseWork.length} travaux récupérés`)

      // Enrichir les travaux avec des informations supplémentaires sur les fichiers
      for (let i = 0; i < courseWork.length; i++) {
        if (courseWork[i].materials && courseWork[i].materials.length > 0) {
          for (let j = 0; j < courseWork[i].materials.length; j++) {
            const material = courseWork[i].materials[j]
            if (material.driveFile && material.driveFile.driveFile && material.driveFile.driveFile.id) {
              try {
                // Récupérer plus d'informations sur le fichier Drive
                const fileInfo = await drive.files.get({
                  fileId: material.driveFile.driveFile.id,
                  fields: "id,name,mimeType,webViewLink,thumbnailLink",
                })

                // Ajouter ces informations au matériel
                courseWork[i].materials[j].driveFile.additionalInfo = fileInfo.data
              } catch (driveError) {
                console.error(
                  `Erreur lors de la récupération des infos du fichier ${material.driveFile.driveFile.id}:`,
                  driveError,
                )
              }
            }
          }
        }
      }
    } catch (workError) {
      console.error("Erreur lors de la récupération des travaux:", workError)
      courseWork = []
    }

    // Récupérer les annonces (documentation)
    console.log(`Récupération des annonces pour le cours ${courseId}...`)
    let announcements = []
    try {
      const announcementsResponse = await classroom.courses.announcements.list({ courseId })
      announcements = announcementsResponse.data.announcements || []

      // Enrichir les annonces avec des informations supplémentaires sur les fichiers
      for (let i = 0; i < announcements.length; i++) {
        if (announcements[i].materials && announcements[i].materials.length > 0) {
          for (let j = 0; j < announcements[i].materials.length; j++) {
            const material = announcements[i].materials[j]
            if (material.driveFile && material.driveFile.driveFile && material.driveFile.driveFile.id) {
              try {
                // Récupérer plus d'informations sur le fichier Drive
                const fileInfo = await drive.files.get({
                  fileId: material.driveFile.driveFile.id,
                  fields: "id,name,mimeType,webViewLink,thumbnailLink",
                })

                // Ajouter ces informations au matériel
                announcements[i].materials[j].driveFile.additionalInfo = fileInfo.data
              } catch (driveError) {
                console.error(
                  `Erreur lors de la récupération des infos du fichier ${material.driveFile.driveFile.id}:`,
                  driveError,
                )
              }
            }
          }
        }
      }

      console.log(`${announcements.length} annonces récupérées et enrichies`)
    } catch (announcementError) {
      console.error("Erreur détaillée lors de la récupération des annonces:", announcementError)
      announcements = []
    }

    // Récupérer les matériels de cours
    console.log(`Récupération des matériels pour le cours ${courseId}...`)
    let courseWorkMaterials = []
    try {
      const materialsResponse = await classroom.courses.courseWorkMaterials.list({ courseId })
      courseWorkMaterials = materialsResponse.data.courseWorkMaterial || []

      // Enrichir les matériels avec des informations supplémentaires sur les fichiers
      for (let i = 0; i < courseWorkMaterials.length; i++) {
        if (courseWorkMaterials[i].materials && courseWorkMaterials[i].materials.length > 0) {
          for (let j = 0; j < courseWorkMaterials[i].materials.length; j++) {
            const material = courseWorkMaterials[i].materials[j]
            if (material.driveFile && material.driveFile.driveFile && material.driveFile.driveFile.id) {
              try {
                // Récupérer plus d'informations sur le fichier Drive
                const fileInfo = await drive.files.get({
                  fileId: material.driveFile.driveFile.id,
                  fields: "id,name,mimeType,webViewLink,thumbnailLink",
                })

                // Ajouter ces informations au matériel
                courseWorkMaterials[i].materials[j].driveFile.additionalInfo = fileInfo.data
              } catch (driveError) {
                console.error(
                  `Erreur lors de la récupération des infos du fichier ${material.driveFile.driveFile.id}:`,
                  driveError,
                )
              }
            }
          }
        }
      }

      console.log(`${courseWorkMaterials.length} matériels récupérés et enrichis`)
    } catch (materialsError) {
      console.error("Erreur détaillée lors de la récupération des matériels:", materialsError)
      courseWorkMaterials = []
    }

    // NOUVELLE APPROCHE: Récupérer directement les fichiers du Drive associé au cours
    console.log(`Récupération des fichiers Drive associés au cours ${courseId}...`)
    const driveFiles = []
    try {
      // 1. Récupérer le dossier Drive associé au cours
      const courseFolder = await classroom.courses.get({
        id: courseId,
        fields: "teacherFolder",
      })

      if (courseFolder.data.teacherFolder && courseFolder.data.teacherFolder.id) {
        const folderId = courseFolder.data.teacherFolder.id
        console.log(`Dossier Drive du cours trouvé: ${folderId}`)

        // 2. Récupérer tous les fichiers dans ce dossier et ses sous-dossiers
        const listFiles = async (folderId) => {
          const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: "files(id, name, mimeType, webViewLink, thumbnailLink, parents)",
            pageSize: 100,
          })

          let files = response.data.files || []
          console.log(`${files.length} fichiers/dossiers trouvés dans le dossier ${folderId}`)

          // Pour chaque sous-dossier, récupérer récursivement les fichiers
          for (const file of files) {
            if (file.mimeType === "application/vnd.google-apps.folder") {
              const subFiles = await listFiles(file.id)
              files = [...files, ...subFiles]
            }
          }

          return files
        }

        const allFiles = await listFiles(folderId)
        console.log(`Total de ${allFiles.length} fichiers trouvés dans le Drive du cours`)

        // 3. Organiser les fichiers par dossier (qui pourrait correspondre aux topics)
        const filesByFolder = {}
        for (const file of allFiles) {
          if (file.parents && file.parents.length > 0) {
            const parentId = file.parents[0]
            if (!filesByFolder[parentId]) {
              filesByFolder[parentId] = []
            }
            filesByFolder[parentId].push(file)
          }
        }

        // 4. Créer des "documents" pour chaque dossier contenant des fichiers
        for (const folderId in filesByFolder) {
          const folderFiles = filesByFolder[folderId]
          if (folderFiles.length > 0) {
            // Trouver le dossier parent
            const folderInfo = allFiles.find((f) => f.id === folderId)
            const folderName = folderInfo ? folderInfo.name : "Dossier sans nom"

            // Créer un document pour ce dossier
            const folderDocument = {
              id: `drive-folder-${folderId}`,
              name: folderName,
              text: folderName,
              creationTime: new Date().toISOString(),
              materials: folderFiles.map((file) => ({
                driveFile: {
                  additionalInfo: {
                    id: file.id,
                    name: file.name,
                    mimeType: file.mimeType,
                    webViewLink: file.webViewLink,
                    thumbnailLink: file.thumbnailLink,
                  },
                },
              })),
            }

            driveFiles.push(folderDocument)
          }
        }

        console.log(`${driveFiles.length} documents créés à partir des fichiers Drive`)
      } else {
        console.log("Aucun dossier Drive associé au cours trouvé")
      }
    } catch (driveError) {
      console.error("Erreur lors de la récupération des fichiers Drive:", driveError)
    }

    // Récupérer les documents (annonces avec matériels)
    console.log(`Extraction des documents à partir des annonces pour le cours ${courseId}...`)
    let documents = []
    try {
      // Filtrer les annonces qui contiennent des matériels
      if (announcements && announcements.length > 0) {
        documents = announcements.filter((announcement) => announcement.materials && announcement.materials.length > 0)
        console.log(`${documents.length} documents extraits des annonces`)
      } else {
        console.log("Aucune annonce trouvée, impossible d'extraire des documents")
      }

      // NOUVEAU: Ajouter les documents du Drive
      documents = [...documents, ...driveFiles]
      console.log(`Total après ajout des documents Drive: ${documents.length} documents`)

      // NOUVEAU: Associer les documents aux topics par nom
      if (topics && topics.length > 0 && documents.length > 0) {
        console.log("Association des documents aux topics par nom...")

        // Pour chaque topic, chercher des documents qui pourraient lui être associés
        for (const topic of topics) {
          const topicName = topic.name.toLowerCase()

          // Créer un document spécifique pour ce topic s'il n'existe pas déjà
          const existingTopicDoc = documents.find(
            (doc) =>
              (doc.name && doc.name.toLowerCase() === topicName) || (doc.text && doc.text.toLowerCase() === topicName),
          )

          if (!existingTopicDoc) {
            // Chercher des documents qui pourraient être liés à ce topic
            const relatedDocs = documents.filter((doc) => {
              // Vérifier si le nom du document contient le nom du topic
              const docName = (doc.name || doc.text || "").toLowerCase()
              return docName.includes(topicName) || topicName.includes(docName)
            })

            // Si on trouve des documents liés, créer un document pour ce topic
            if (relatedDocs.length > 0) {
              const topicDoc = {
                id: `topic-${topic.topicId}`,
                name: topic.name,
                text: topic.name,
                creationTime: topic.updateTime || topic.creationTime,
                materials: relatedDocs.flatMap((doc) => doc.materials || []),
              }

              documents.push(topicDoc)
              console.log(`Document créé pour le topic "${topic.name}" avec ${topicDoc.materials.length} matériels`)
            }
          }
        }
      }
    } catch (documentsError) {
      console.error("Erreur détaillée lors de l'extraction des documents:", documentsError)
      documents = []
    }

    return {
      course: course.data,
      topics: topics,
      courseWork: courseWork,
      announcements: announcements,
      courseWorkMaterials: courseWorkMaterials,
      documents: documents,
      driveFiles: driveFiles, // NOUVEAU: Ajouter les fichiers Drive
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du cours:", error)
    throw error
  }
}

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  refreshAccessToken,
  getCourses,
  getCourseDetails,
}
