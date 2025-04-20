// controllers/classroomController.js
const classroomService = require("../services/classroomService")

// Obtenir tous les cours
exports.getCourses = async (req, res) => {
  try {
    console.log("Récupération des cours pour l'utilisateur:", req.user._id)

    // Utiliser directement le token de la session
    const accessToken = req.user.accessToken

    // Vérifier si le token est expiré
    if (Date.now() > req.user.tokenExpiry) {
      console.log("Token expiré, rafraîchissement...")

      // Rafraîchir le token
      const newTokens = await classroomService.refreshAccessToken(req.user.refreshToken)

      // Mettre à jour la session
      req.session.accessToken = newTokens.accessToken
      req.session.tokenExpiry = newTokens.expiryDate.getTime()
      await req.session.save()

      // Utiliser le nouveau token
      const courses = await classroomService.getCourses(newTokens.accessToken)
      res.status(200).json({ success: true, data: courses })
    } else {
      // Utiliser le token existant
      const courses = await classroomService.getCourses(accessToken)
      res.status(200).json({ success: true, data: courses })
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// Obtenir les détails d'un cours
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params

    console.log("Récupération des détails du cours:", courseId, "pour l'utilisateur:", req.user._id)

    // Utiliser directement le token de la session
    const accessToken = req.user.accessToken

    // Vérifier si le token est expiré
    if (Date.now() > req.user.tokenExpiry) {
      console.log("Token expiré, rafraîchissement...")

      // Rafraîchir le token
      const newTokens = await classroomService.refreshAccessToken(req.user.refreshToken)

      // Mettre à jour la session
      req.session.accessToken = newTokens.accessToken
      req.session.tokenExpiry = newTokens.expiryDate.getTime()
      await req.session.save()

      // Utiliser le nouveau token
      const courseDetails = await classroomService.getCourseDetails(newTokens.accessToken, courseId)

      // Log pour déboguer
      console.log(
        `Détails récupérés: Cours: ${courseDetails.course.name}, Topics: ${courseDetails.topics.length}, Travaux: ${courseDetails.courseWork.length}, Annonces: ${courseDetails.announcements ? courseDetails.announcements.length : 0}, Matériels: ${courseDetails.courseWorkMaterials ? courseDetails.courseWorkMaterials.length : 0}, Documents: ${courseDetails.documents ? courseDetails.documents.length : 0}`
      )

      // Vérifier si les documents sont présents
      if (courseDetails.documents && courseDetails.documents.length > 0) {
        console.log(`${courseDetails.documents.length} documents trouvés`);
        console.log("Premier document:", JSON.stringify(courseDetails.documents[0], null, 2));
      } else {
        console.log("Aucun document trouvé");
      }

      res.status(200).json({ success: true, data: courseDetails })
    } else {
      // Utiliser le token existant
      const courseDetails = await classroomService.getCourseDetails(accessToken, courseId)

      // Log pour déboguer
      console.log(
        `Détails récupérés: Cours: ${courseDetails.course.name}, Topics: ${courseDetails.topics.length}, Travaux: ${courseDetails.courseWork.length}, Annonces: ${courseDetails.announcements ? courseDetails.announcements.length : 0}, Matériels: ${courseDetails.courseWorkMaterials ? courseDetails.courseWorkMaterials.length : 0}, Documents: ${courseDetails.documents ? courseDetails.documents.length : 0}`
      )
      
      // Vérifier si les documents sont présents
      if (courseDetails.documents && courseDetails.documents.length > 0) {
        console.log(`${courseDetails.documents.length} documents trouvés`);
        console.log("Premier document:", JSON.stringify(courseDetails.documents[0], null, 2));
      } else {
        console.log("Aucun document trouvé");
      }

      res.status(200).json({ success: true, data: courseDetails })
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du cours:", error)
    res.status(500).json({ success: false, error: error.message })
  }
}