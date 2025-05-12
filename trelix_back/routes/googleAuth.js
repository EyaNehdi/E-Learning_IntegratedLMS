const express = require('express');
const router = express.Router();
const classroomService = require('../services/classroomService');

// Route pour initier la connexion Google
router.get('/login', (req, res) => {
  const url = classroomService.getAuthUrl();
  console.log("Redirection vers l'URL d'authentification Google:", url);
  res.redirect(url);
});

// Callback après l'authentification Google
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    console.error("Code d'authentification manquant dans la requête de callback");
    return res.redirect('http://localhost:5173/classroom?auth=error&reason=no_code');
  }

  try {
    const tokens = await classroomService.getTokensFromCode(code);
    console.log("Tokens reçus:", {
      accessToken: tokens.access_token ? tokens.access_token.slice(0, 10) + "..." : "non défini",
      refreshToken: tokens.refresh_token ? "présent" : "non défini",
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : "non défini",
    });

    // Stocker les tokens dans la session
    req.session.user = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: tokens.expiry_date,
    };

    await req.session.save();
    console.log("Session après sauvegarde:", req.session.user);

    res.redirect('http://localhost:5173/classroom?auth=success');
  } catch (error) {
    console.error('Erreur lors du callback Google:', error.message);
    res.redirect('http://localhost:5173/classroom?auth=error&reason=token_exchange_failed');
  }
});

// Route pour vérifier l'authentification
router.get('/check-auth', (req, res) => {
  if (req.session.user && req.session.user.accessToken) {
    console.log("Vérification d'authentification: Utilisateur authentifié");
    res.json({ isAuthenticated: true });
  } else {
    console.log("Vérification d'authentification: Utilisateur non authentifié");
    res.json({ isAuthenticated: false });
  }
});

// Route pour la déconnexion
router.get('/logout', (req, res) => {
  console.log("Déconnexion de l'utilisateur, destruction de la session...");
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion:', err);
      return res.status(500).json({ success: false, error: 'Erreur lors de la déconnexion' });
    }
    res.clearCookie('connect.sid');
    console.log("Session détruite avec succès");
    res.json({ success: true, message: 'Déconnexion réussie' });
  });
});

module.exports = router;