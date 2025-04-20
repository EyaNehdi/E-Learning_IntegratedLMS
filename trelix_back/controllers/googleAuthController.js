// controllers/googleAuthController.js
const { OAuth2Client } = require('google-auth-library');
const classroomService = require('../services/classroomService');

// Rediriger vers l'URL d'authentification Google
exports.googleLogin = (req, res) => {
  try {
    const authUrl = classroomService.getAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Erreur lors de la redirection vers Google:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/classroom?auth=error`);
  }
};

// Gérer le callback de Google
exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      throw new Error('Code d\'autorisation manquant');
    }
    
    console.log("Code reçu:", code);
    
    // Obtenir les tokens
    const tokens = await classroomService.getTokensFromCode(code);
    console.log("Tokens reçus de Google:", tokens ? "Oui" : "Non");
    
    // Décoder le token pour obtenir les informations utilisateur
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const userId = payload.sub;
    const email = payload.email;
    
    console.log("Informations utilisateur:", { userId, email });
    
    // Stocker les informations dans la session
    req.session.userId = userId;
    req.session.email = email;
    req.session.accessToken = tokens.access_token;
    req.session.refreshToken = tokens.refresh_token;
    req.session.tokenExpiry = Date.now() + tokens.expires_in * 1000;
    req.session.isAuthenticated = true;
    
    // Sauvegarder la session
    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) {
          console.error("Erreur lors de la sauvegarde de la session:", err);
          reject(err);
        } else {
          console.log("Session sauvegardée avec succès");
          resolve();
        }
      });
    });
    
    console.log("Session après sauvegarde:", req.session);
    
    // Rediriger vers le frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/classroom?auth=success`);
  } catch (error) {
    console.error('Erreur détaillée lors du callback Google:', error);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/classroom?auth=error&message=${encodeURIComponent(error.message)}`);
  }
};

// Route pour vérifier l'état d'authentification
exports.checkAuth = (req, res) => {
  console.log("Vérification de l'authentification, session:", req.session);
  
  if (req.session && req.session.isAuthenticated) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.session.userId,
        email: req.session.email
      }
    });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
};

// Déconnexion
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Erreur lors de la déconnexion:", err);
      return res.status(500).json({ success: false, error: "Erreur lors de la déconnexion" });
    }
    
    res.json({ success: true, message: "Déconnecté avec succès" });
  });
};