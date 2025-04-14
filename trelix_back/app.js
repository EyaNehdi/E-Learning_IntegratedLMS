// Au tout début de app.js
require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const multer = require('multer');
const socketIo = require('socket.io');


// Correction des imports pour Google Classroom
const googleAuthRoutes = require('./routes/googleAuth');
const classroomRoutes = require('./routes/classroom');
// Dans app.js, après les imports
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Avant les routes, après les middlewares comme cors, etc.


// Middleware pour déboguer les sessions


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mfaRoutes = require('./routes/mfaRoutes');
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const quizzRoutes = require("./routes/quizzRoutes");
const Module = require("./routes/module");
const Course = require("./routes/course");

var app = express();
console.log("MONGO_URI:", process.env.MONGO_URI);  // Debug

// Vérification des variables d'environnement pour Google Classroom
console.log("Google Classroom Config:", {
  clientId: process.env.GOOGLE_CLIENT_ID ? "Défini" : "Non défini",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Défini" : "Non défini",
  redirectUri: process.env.GOOGLE_REDIRECT_URI ? "Défini" : "Non défini",
  frontendUrl: process.env.FRONTEND_URL ? "Défini" : "Non défini"
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json({ limit: '100mb' }));  
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'classroom_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60 // 14 jours
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 jours
  }
}));

app.use((req, res, next) => {
  console.log('Session:', req.session);
  console.log('Session ID:', req.sessionID);
  next();
});
app.use(cors({
  origin: "http://localhost:5173", // URL de votre frontend
  credentials: true, // Important pour les cookies de session
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
}));


//cors
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_secret_de_session',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60 // 14 jours
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 jours
  }
}));
// Middleware de logging pour déboguer les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// In app.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/ia', require('./routes/ia'));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/module', Module);
app.use('/course', Course);
app.use('/courses', Course);
app.use('/delete', Course);

// Routes Google Classroom (corrigées)
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/classroom', classroomRoutes);

//auth routes
const ExamRoutes = require('./routes/ExamRoutes');
const quizRoutes = require('./routes/quizRoutes');
const authRouteschapter = require('./routes/chapterRoutes'); 
const authRoutes = require('./routes/authRoutes');
const authRoutesIA = require('./routes/ia');
app.use('/api/auth', authRoutes);
app.use('/ia/auth', authRoutesIA);
app.use('/chapter', authRouteschapter);
app.use("/signup/mfa", mfaRoutes);
app.use("/api/info", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/quiz", quizzRoutes);

app.use("/quiz", quizRoutes);
app.use("/Exam", ExamRoutes);
app.use((err, req, res, next) => {
  console.error('Upload Error:', err.message);
  res.status(400).json({ error: err.message });
});
// Middleware de débogage pour les redirections
app.use((req, res, next) => {
  const originalRedirect = res.redirect;
  res.redirect = function(url) {
    console.log(`Redirection vers: ${url}`);
    return originalRedirect.call(this, url);
  };
  next();
});

// Placez ce middleware avant vos routes

// Route de test pour Google Classroom
app.get('/api/classroom-test', (req, res) => {
  res.json({
    message: 'Google Classroom API est configurée',
    config: {
      clientId: process.env.GOOGLE_CLIENT_ID ? "Défini" : "Non défini",
      redirectUri: process.env.GOOGLE_REDIRECT_URI ? "Défini" : "Non défini",
      frontendUrl: process.env.FRONTEND_URL ? "Défini" : "Non défini"
    }
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log(`Route non trouvée: ${req.method} ${req.url}`);
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // Log l'erreur pour le débogage
  console.error(`Erreur: ${err.status || 500} - ${err.message}`);
  console.error(`URL: ${req.method} ${req.originalUrl}`);
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Pour les API, renvoyer une réponse JSON si c'est une route API
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      error: err.message,
      status: err.status || 500
    });
  }

  // render the error page pour les autres routes
  res.status(err.status || 500);
  res.render('error');
});

//testing connectivity 
const { connectDB } = require("./config/db");

async function startApp() {
  console.log("🚀 Starting Application...");

  // Connect to MongoDB
  try {
    const db = await connectDB(); 
    console.log(" Connected to MongoDB!");
  } catch (error) {
    console.error(" MongoDB connection failed:", error);
  }
}

startApp();

//port number from .env
const PORT = process.env.PORT || 5000;

// 1. Get the server instance from Express
const server = app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  console.log(`Google Auth URL: http://localhost:${PORT}/api/auth/google/login`);
});

// 2. Attach Socket.IO to the existing Express server
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket Initialization
const { initializeSocket } = require('./controllers/quizzLeaderboardController'); 
initializeSocket(io);  // Pass the socket instance to the controller

module.exports = app;