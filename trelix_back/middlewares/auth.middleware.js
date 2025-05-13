// middlewares/auth.middleware.js
const classroomService = require('../services/classroomService');

const isAuthenticated = async (req, res, next) => {
  console.log('Middleware isAuthenticated - Session:', req.session);

  if (req.session.user && req.session.user.accessToken) {
    // Check if token is expired
    const tokenExpiry = req.session.user.tokenExpiry;
    const now = Date.now();
    
    if (tokenExpiry && now >= tokenExpiry) {
      console.log('Token expiré, tentative de rafraîchissement');
      
      try {
        // Try to refresh the token
        if (req.session.user.refreshToken) {
          const refreshedTokens = await classroomService.refreshAccessToken(req.session.user.refreshToken);
          
          // Update session with new tokens
          req.session.user.accessToken = refreshedTokens.accessToken;
          req.session.user.tokenExpiry = refreshedTokens.expiryDate;
          
          await new Promise((resolve, reject) => {
            req.session.save(err => {
              if (err) {
                console.error("Erreur lors de la sauvegarde de la session après rafraîchissement:", err);
                reject(err);
              } else {
                console.log("Session mise à jour avec le nouveau token");
                resolve();
              }
            });
          });
        } else {
          throw new Error('Refresh token manquant');
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error);
        return res.status(401).json({ success: false, error: 'Session expirée' });
      }
    }
    
    req.user = req.session.user;
    console.log('Utilisateur authentifié:', req.user);
    next();
  } else {
    console.log('Utilisateur non authentifié');
    return res.status(401).json({ success: false, error: 'Non authentifié' });
  }
};

module.exports = isAuthenticated;