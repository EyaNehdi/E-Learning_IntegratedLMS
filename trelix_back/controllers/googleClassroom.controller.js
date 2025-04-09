const { getAuthUrl, getTokens } = require('../config/google-classroom.config');
const GoogleAuth = require('../models/googleAuth.model');
const googleClassroomService = require('../services/googleClassroom.service');

// Contrôleur pour obtenir l'URL d'authentification
const getGoogleAuthUrl = (req, res) => {
  try {
    const authUrl = getAuthUrl();
    console.log('URL d\'authentification générée:', authUrl);
    res.json({ authUrl });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'authentification:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Contrôleur pour le callback de l'authentification Google
const handleGoogleCallback = async (req, res) => {
  try {
    console.log('Callback Google reçu avec code:', req.query.code ? 'Présent' : 'Absent');
    const { code } = req.query;
    
    if (!code) {
      console.error('Pas de code d\'autorisation reçu');
      return res.status(400).json({ message: 'Pas de code d\'autorisation reçu' });
    }
    
    // Pour les tests, utilisez un ID utilisateur fixe
    const userId = '65f1a2b3c4d5e6f7a8b9c0d1'; // ID utilisateur fictif
    
    // Échanger le code contre des tokens
    const tokens = await getTokens(code);
    console.log('Tokens obtenus:', tokens ? 'Oui' : 'Non');
    
    // Enregistrer ou mettre à jour les tokens dans la base de données
    await GoogleAuth.findOneAndUpdate(
      { userId },
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date)
      },
      { upsert: true, new: true }
    );
    
    // Rediriger vers le frontend avec une page HTML
    console.log('Redirection vers le frontend');
    res.send(`
      <html>
        <head>
          <title>Redirection...</title>
          <script>
            window.location.href = 'http://localhost:5173/classroom/dashboard';
          </script>
        </head>
        <body>
          <p>Authentification réussie ! Redirection en cours...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Erreur lors du traitement du callback Google:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Contrôleur pour récupérer tous les cours
const getAllCourses = async (req, res) => {
  try {
    // Pour les tests, utilisez un ID utilisateur fixe
    const userId = '65f1a2b3c4d5e6f7a8b9c0d1'; // ID utilisateur fictif
    const courses = await googleClassroomService.getAllCourses(userId);
    res.json(courses);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getGoogleAuthUrl,
  handleGoogleCallback,
  getAllCourses
};