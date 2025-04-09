// trelix_back/config/google-classroom.config.js
const { google } = require('googleapis');

// Assurez-vous que ces variables d'environnement sont correctement définies
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;


// Vérifiez que les identifiants sont bien définis
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.error('ERREUR: Variables d\'environnement Google manquantes!');
  console.error(`CLIENT_ID: ${CLIENT_ID ? 'Défini' : 'MANQUANT'}`);
  console.error(`CLIENT_SECRET: ${CLIENT_SECRET ? 'Défini' : 'MANQUANT'}`);
  console.error(`REDIRECT_URI: ${REDIRECT_URI ? 'Défini' : 'MANQUANT'}`);
}

// Configuration des identifiants OAuth2
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Création de l'instance de l'API Classroom
const classroom = google.classroom({
  version: 'v1',
  auth: oauth2Client
});

// Générer l'URL d'autorisation
const getAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly',
    'https://www.googleapis.com/auth/classroom.profile.emails'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
};

// Échanger le code contre des tokens
const getTokens = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('Erreur lors de l\'obtention des tokens:', error);
    throw error;
  }
};

// Définir les tokens pour l'authentification
const setCredentials = (tokens) => {
  oauth2Client.setCredentials(tokens);
};

module.exports = {
  classroom,
  oauth2Client,
  getAuthUrl,
  getTokens,
  setCredentials
};