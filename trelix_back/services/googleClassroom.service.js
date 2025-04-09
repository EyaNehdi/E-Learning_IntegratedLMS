// trelix_back/services/googleClassroom.service.js
const { classroom, oauth2Client } = require('../config/google-classroom.config');
const GoogleAuth = require('../models/googleAuth.model');

// Service pour récupérer tous les cours
const getAllCourses = async (userId) => {
  try {
    // Récupérer les tokens de l'utilisateur
    const userAuth = await GoogleAuth.findOne({ userId });
    
    if (!userAuth) {
      throw new Error('Utilisateur non authentifié avec Google Classroom');
    }
    
    
    // Vérifier si le token est expiré et le rafraîchir si nécessaire
    if (userAuth.isTokenExpired() && userAuth.refreshToken) {
      oauth2Client.setCredentials({
        refresh_token: userAuth.refreshToken
      });
      
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Mettre à jour les tokens dans la base de données
      userAuth.accessToken = credentials.access_token;
      if (credentials.refresh_token) {
        userAuth.refreshToken = credentials.refresh_token;
      }
      userAuth.expiryDate = new Date(credentials.expiry_date);
      await userAuth.save();
    }
    
    // Configurer les credentials pour l'API
    oauth2Client.setCredentials({
      access_token: userAuth.accessToken,
      refresh_token: userAuth.refreshToken,
      expiry_date: userAuth.expiryDate
    });
    
    // Récupérer tous les cours (enseignant et étudiant)
    const [teacherCourses, studentCourses] = await Promise.all([
      classroom.courses.list({
        teacherId: 'me',
        pageSize: 100
      }),
      classroom.courses.list({
        studentId: 'me',
        pageSize: 100
      })
    ]);
    
    // Fusionner les résultats
    const allCourses = [
      ...(teacherCourses.data.courses || []),
      ...(studentCourses.data.courses || [])
    ];
    
    // Éliminer les doublons (si un utilisateur est à la fois enseignant et étudiant dans un cours)
    const uniqueCourses = Array.from(
      new Map(allCourses.map(course => [course.id, course])).values()
    );
    
    return uniqueCourses;
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    throw error;
  }
};

module.exports = {
  getAllCourses
};