// middlewares/auth.middleware.js
const isAuthenticated = (req, res, next) => {
  console.log("Vérification de l'authentification, session:", req.session);
  
  if (req.session && req.session.isAuthenticated) {
    // Ajouter les informations utilisateur à la requête
    req.user = {
      _id: req.session.userId,
      email: req.session.email,
      accessToken: req.session.accessToken,
      refreshToken: req.session.refreshToken,
      tokenExpiry: req.session.tokenExpiry
    };
    
    console.log("Utilisateur authentifié:", req.user._id);
    next();
  } else {
    console.log("Aucun utilisateur dans la session");
    res.status(401).json({ error: "Non authentifié" });
  }
};

module.exports = isAuthenticated;