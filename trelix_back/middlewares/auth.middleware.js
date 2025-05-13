// middlewares/auth.middleware.js
const isAuthenticated = (req, res, next) => {
  console.log('Middleware isAuthenticated - Session:', req.session);

  if (req.session.user && req.session.user.accessToken) {
    req.user = req.session.user;
    console.log('Utilisateur authentifié:', req.user);
    next();
  } else {
    console.log('Utilisateur non authentifié');
    return res.status(401).json({ success: false, error: 'Non authentifié' });
  }
};

module.exports = isAuthenticated;