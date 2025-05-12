const { google } = require("googleapis");

// Configurer le client OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

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
    "https://www.googleapis.com/auth/drive.readonly",
    "profile",
    "email",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
};

// Échanger le code contre des tokens
const getTokensFromCode = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error("Erreur lors de l'échange du code contre des tokens:", error.message);
    console.error("Détails erreur:", JSON.stringify(error, null, 2));
    throw new Error("Échec de l'échange du code contre des tokens");
  }
};

// Rafraîchir un token expiré
const refreshAccessToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new Error("Refresh token manquant");
    }
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return {
      accessToken: credentials.access_token,
      expiryDate: new Date(Date.now() + credentials.expires_in * 1000),
    };
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error.message);
    console.error("Détails erreur:", JSON.stringify(error, null, 2));
    throw new Error("Échec du rafraîchissement du token");
  }
};

// Obtenir les cours
const getCourses = async (accessToken) => {
  try {
    if (!accessToken) {
      throw new Error("Access token manquant");
    }
    console.log("Récupération des cours avec le token:", accessToken.slice(0, 10) + "...");
    oauth2Client.setCredentials({ access_token: accessToken });
    const classroom = google.classroom({ version: "v1", auth: oauth2Client });

    const response = await classroom.courses.list({
      teacherId: "me",
      courseStates: ["ACTIVE", "ARCHIVED", "PROVISIONED", "DECLINED"],
    });

    console.log("Réponse API Google Classroom:", JSON.stringify(response.data, null, 2));
    console.log("Cours récupérés:", response.data.courses ? response.data.courses.length : 0);
    return response.data.courses || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error.message);
    console.error("Code erreur:", error.code);
    console.error("Détails erreur:", JSON.stringify(error, null, 2));
    throw new Error(`Échec de la récupération des cours: ${error.message}`);
  }
};

// Obtenir les détails d'un cours
const getCourseDetails = async (accessToken, courseId) => {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    const classroom = google.classroom({ version: "v1", auth: oauth2Client });
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    console.log(`Récupération des détails du cours ${courseId}...`);

    const course = await classroom.courses.get({ id: courseId });
    console.log("Informations du cours récupérées:", course.data.name);

    let topics = [];
    try {
      const topicsResponse = await classroom.courses.topics.list({ courseId });
      topics = topicsResponse.data.topic || [];
      console.log(`${topics.length} topics récupérés`);
    } catch (topicError) {
      console.error("Erreur lors de la récupération des topics:", topicError);
      topics = [];
    }

    let courseWork = [];
    try {
      const courseWorkResponse = await classroom.courses.courseWork.list({ courseId });
      courseWork = courseWorkResponse.data.courseWork || [];
      console.log(`${courseWork.length} travaux récupérés`);

      for (let i = 0; i < courseWork.length; i++) {
        if (courseWork[i].materials && courseWork[i].materials.length > 0) {
          for (let j = 0; j < courseWork[i].materials.length; j++) {
            const material = courseWork[i].materials[j];
            if (material.driveFile && material.driveFile.driveFile && material.driveFile.driveFile.id) {
              try {
                const fileInfo = await drive.files.get({
                  fileId: material.driveFile.driveFile.id,
                  fields: "id,name,mimeType,webViewLink,thumbnailLink",
                });
                courseWork[i].materials[j].driveFile.additionalInfo = fileInfo.data;
              } catch (driveError) {
                console.error(
                  `Erreur lors de la récupération des infos du fichier ${material.driveFile.driveFile.id}:`,
                  driveError,
                );
              }
            }
          }
        }
      }
    } catch (workError) {
      console.error("Erreur lors de la récupération des travaux:", workError);
      courseWork = [];
    }

    let announcements = [];
    try {
      const announcementsResponse = await classroom.courses.announcements.list({ courseId });
      announcements = announcementsResponse.data.announcements || [];

      for (let i = 0; i < announcements.length; i++) {
        if (announcements[i].materials && announcements[i].materials.length > 0) {
          for (let j = 0; j < announcements[i].materials.length; j++) {
            const material = announcements[i].materials[j];
            if (material.driveFile && material.driveFile.driveFile && material.driveFile.driveFile.id) {
              try {
                const fileInfo = await drive.files.get({
                  fileId: material.driveFile.driveFile.id,
                  fields: "id,name,mimeType,webViewLink,thumbnailLink",
                });
                announcements[i].materials[j].driveFile.additionalInfo = fileInfo.data;
              } catch (driveError) {
                console.error(
                  `Erreur lors de la récupération des infos du fichier ${material.driveFile.driveFile.id}:`,
                  driveError,
                );
              }
            }
          }
        }
      }
      console.log(`${announcements.length} annonces récupérées et enrichies`);
    } catch (announcementError) {
      console.error("Erreur détaillée lors de la récupération des annonces:", announcementError);
      announcements = [];
    }

    let courseWorkMaterials = [];
    try {
      const materialsResponse = await classroom.courses.courseWorkMaterials.list({ courseId });
      courseWorkMaterials = materialsResponse.data.courseWorkMaterial || [];

      for (let i = 0; i < courseWorkMaterials.length; i++) {
        if (courseWorkMaterials[i].materials && courseWorkMaterials[i].materials.length > 0) {
          for (let j = 0; j < courseWorkMaterials[i].materials.length; j++) {
            const material = courseWorkMaterials[i].materials[j];
            if (material.driveFile && material.driveFile.driveFile && material.driveFile.driveFile.id) {
              try {
                const fileInfo = await drive.files.get({
                  fileId: material.driveFile.driveFile.id,
                  fields: "id,name,mimeType,webViewLink,thumbnailLink",
                });
                courseWorkMaterials[i].materials[j].driveFile.additionalInfo = fileInfo.data;
              } catch (driveError) {
                console.error(
                  `Erreur lors de la récupération des infos du fichier ${material.driveFile.driveFile.id}:`,
                  driveError,
                );
              }
            }
          }
        }
      }
      console.log(`${courseWorkMaterials.length} matériels récupérés et enrichis`);
    } catch (materialsError) {
      console.error("Erreur détaillée lors de la récupération des matériels:", materialsError);
      courseWorkMaterials = [];
    }

    const driveFiles = [];
    try {
      const courseFolder = await classroom.courses.get({
        id: courseId,
        fields: "teacherFolder",
      });

      if (courseFolder.data.teacherFolder && courseFolder.data.teacherFolder.id) {
        const folderId = courseFolder.data.teacherFolder.id;
        console.log(`Dossier Drive du cours trouvé: ${folderId}`);

        const listFiles = async (folderId) => {
          const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: "files(id, name, mimeType, webViewLink, thumbnailLink, parents)",
            pageSize: 100,
          });

          let files = response.data.files || [];
          console.log(`${files.length} fichiers/dossiers trouvés dans le dossier ${folderId}`);

          for (const file of files) {
            if (file.mimeType === "application/vnd.google-apps.folder") {
              const subFiles = await listFiles(file.id);
              files = [...files, ...subFiles];
            }
          }
          return files;
        };

        const allFiles = await listFiles(folderId);
        console.log(`Total de ${allFiles.length} fichiers trouvés dans le Drive du cours`);

        const filesByFolder = {};
        for (const file of allFiles) {
          if (file.parents && file.parents.length > 0) {
            const parentId = file.parents[0];
            if (!filesByFolder[parentId]) {
              filesByFolder[parentId] = [];
            }
            filesByFolder[parentId].push(file);
          }
        }

        for (const folderId in filesByFolder) {
          const folderFiles = filesByFolder[folderId];
          if (folderFiles.length > 0) {
            const folderInfo = allFiles.find((f) => f.id === folderId);
            const folderName = folderInfo ? folderInfo.name : "Dossier sans nom";

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
            };
            driveFiles.push(folderDocument);
          }
        }
        console.log(`${driveFiles.length} documents créés à partir des fichiers Drive`);
      } else {
        console.log("Aucun dossier Drive associé au cours trouvé");
      }
    } catch (driveError) {
      console.error("Erreur lors de la récupération des fichiers Drive:", driveError);
    }

    let documents = [];
    try {
      if (announcements && announcements.length > 0) {
        documents = announcements.filter((announcement) => announcement.materials && announcement.materials.length > 0);
        console.log(`${documents.length} documents extraits des annonces`);
      } else {
        console.log("Aucune annonce trouvée, impossible d'extraire des documents");
      }

      documents = [...documents, ...driveFiles];
      console.log(`Total après ajout des documents Drive: ${documents.length} documents`);

      if (topics && topics.length > 0 && documents.length > 0) {
        console.log("Association des documents aux topics par nom...");
        for (const topic of topics) {
          const topicName = topic.name.toLowerCase();
          const existingTopicDoc = documents.find(
            (doc) =>
              (doc.name && doc.name.toLowerCase() === topicName) || (doc.text && doc.text.toLowerCase() === topicName),
          );

          if (!existingTopicDoc) {
            const relatedDocs = documents.filter((doc) => {
              const docName = (doc.name || doc.text || "").toLowerCase();
              return docName.includes(topicName) || topicName.includes(docName);
            });

            if (relatedDocs.length > 0) {
              const topicDoc = {
                id: `topic-${topic.topicId}`,
                name: topic.name,
                text: topic.name,
                creationTime: topic.updateTime || topic.creationTime,
                materials: relatedDocs.flatMap((doc) => doc.materials || []),
              };
              documents.push(topicDoc);
              console.log(`Document créé pour le topic "${topic.name}" avec ${topicDoc.materials.length} matériels`);
            }
          }
        }
      }
    } catch (documentsError) {
      console.error("Erreur détaillée lors de l'extraction des documents:", documentsError);
      documents = [];
    }

    return {
      course: course.data,
      topics: topics,
      courseWork: courseWork,
      announcements: announcements,
      courseWorkMaterials: courseWorkMaterials,
      documents: documents,
      driveFiles: driveFiles,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du cours:", error);
    throw error;
  }
};

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  refreshAccessToken,
  getCourses,
  getCourseDetails,
};