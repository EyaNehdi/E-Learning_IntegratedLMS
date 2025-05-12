const classroomService = require("../services/classroomService");

// Obtenir tous les cours
exports.getCourses = async (req, res) => {
  try {
    if (!req.user || !req.user.accessToken || !req.user.tokenExpiry) {
      console.error("Données utilisateur manquantes dans la session:", req.user);
      return res.status(401).json({ success: false, error: "Utilisateur non authentifié ou données manquantes" });
    }

    console.log("Récupération des cours pour l'utilisateur:", req.user._id || "ID non défini");
    const accessToken = req.user.accessToken;
    console.log("Token expiry:", new Date(req.user.tokenExpiry).toISOString());

    if (Date.now() > req.user.tokenExpiry) {
      console.log("Token expiré, rafraîchissement...");
      if (!req.user.refreshToken) {
        console.error("Refresh token manquant dans la session");
        return res.status(401).json({ success: false, error: "Refresh token manquant, veuillez vous reconnecter" });
      }

      try {
        const newTokens = await classroomService.refreshAccessToken(req.user.refreshToken);
        req.session.user.accessToken = newTokens.accessToken;
        req.session.user.tokenExpiry = newTokens.expiryDate.getTime();
        await req.session.save();
        console.log("Nouveau token généré:", newTokens.accessToken.slice(0, 10) + "...");

        const courses = await classroomService.getCourses(newTokens.accessToken);
        return res.status(200).json({ success: true, data: courses });
      } catch (refreshError) {
        console.error("Échec du rafraîchissement du token:", refreshError.message);
        return res.status(401).json({ success: false, error: "Échec du rafraîchissement du token, veuillez vous reconnecter" });
      }
    }

    const courses = await classroomService.getCourses(accessToken);
    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("Erreur dans getCourses:", error.message, error.stack);
    if (error.message.includes("403") || error.message.includes("access_denied")) {
      return res.status(403).json({
        success: false,
        error: "Accès refusé : L'application est en mode 'Test' et n'a pas été validée par Google.",
        solution: "Ajoutez votre compte (ex. lourassijihed@gmail.com) comme testeur dans la Google Cloud Console (API > Écran de consentement OAuth) et acceptez l'invitation, ou soumettez l'application à la vérification pour un accès public.",
      });
    }
    if (error.message.includes("401") || error.message.includes("Invalid Credentials")) {
      return res.status(401).json({
        success: false,
        error: "Token invalide ou expiré. Veuillez vous reconnecter.",
      });
    }
    return res.status(500).json({ success: false, error: error.message || "Erreur serveur lors de la récupération des cours" });
  }
};

// Obtenir les détails d'un cours
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log("Récupération des détails du cours:", courseId, "pour l'utilisateur:", req.user._id || "ID non défini");

    const accessToken = req.user.accessToken;

    if (Date.now() > req.user.tokenExpiry) {
      console.log("Token expiré, rafraîchissement...");

      const newTokens = await classroomService.refreshAccessToken(req.user.refreshToken);

      req.session.user.accessToken = newTokens.accessToken;
      req.session.user.tokenExpiry = newTokens.expiryDate.getTime();
      await req.session.save();

      const courseDetails = await classroomService.getCourseDetails(newTokens.accessToken, courseId);

      console.log(
        `Détails récupérés: Cours: ${courseDetails.course.name}, Topics: ${courseDetails.topics.length}, Travaux: ${courseDetails.courseWork.length}, Annonces: ${courseDetails.announcements ? courseDetails.announcements.length : 0}, Matériels: ${courseDetails.courseWorkMaterials ? courseDetails.courseWorkMaterials.length : 0}, Documents: ${courseDetails.documents ? courseDetails.documents.length : 0}`
      );

      if (courseDetails.documents && courseDetails.documents.length > 0) {
        console.log(`${courseDetails.documents.length} documents trouvés`);
        console.log("Premier document:", JSON.stringify(courseDetails.documents[0], null, 2));
      } else {
        console.log("Aucun document trouvé");
      }

      res.status(200).json({ success: true, data: courseDetails });
    } else {
      const courseDetails = await classroomService.getCourseDetails(accessToken, courseId);

      console.log(
        `Détails récupérés: Cours: ${courseDetails.course.name}, Topics: ${courseDetails.topics.length}, Travaux: ${courseDetails.courseWork.length}, Annonces: ${courseDetails.announcements ? courseDetails.announcements.length : 0}, Matériels: ${courseDetails.courseWorkMaterials ? courseDetails.courseWorkMaterials.length : 0}, Documents: ${courseDetails.documents ? courseDetails.documents.length : 0}`
      );

      if (courseDetails.documents && courseDetails.documents.length > 0) {
        console.log(`${courseDetails.documents.length} documents trouvés`);
        console.log("Premier document:", JSON.stringify(courseDetails.documents[0], null, 2));
      } else {
        console.log("Aucun document trouvé");
      }

      res.status(200).json({ success: true, data: courseDetails });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du cours:", error.message);
    if (error.message.includes("403") || error.message.includes("access_denied")) {
      return res.status(403).json({
        success: false,
        error: "Accès refusé : L'application est en mode 'Test' et n'a pas été validée par Google.",
        solution: "Ajoutez votre compte comme testeur dans la Google Cloud Console (API > Écran de consentement OAuth) et acceptez l'invitation, ou soumettez l'application à la vérification pour un accès public.",
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};