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
const preference = require("./routes/preference");
const Goal = require('./models/calanderGoal'); // Assurez-vous que le chemin est correct


// Correction des imports pour Google Classroom
const googleAuthRoutes = require('./routes/googleAuth');
const classroomRoutes = require('./routes/classroom');
// Dans app.js, après les imports
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Avant les routes, après les middlewares comme cors, etc.


// Middleware pour déboguer les sessions

const axios = require('axios');
const fetch = require('node-fetch');
var app = express();





app.use(cors({
  origin: "http://localhost:5173",  // Assurez-vous que le frontend utilise ce port
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: '100mb' }));





// Route POST pour la création de salle
app.post('/createRoom', async (req, res) => {
  try {
    // Création d'un nom de salle unique
    const roomName = "room-" + Math.random().toString(36).substring(2, 9);
    console.log("Nom de la salle générée:", roomName);  // Log pour vérifier

    // Renvoie du nom de la salle en réponse
    res.status(200).json({ roomName });
  } catch (error) {
    console.error("Erreur lors de la création de la salle:", error);
    res.status(500).json({ error: "Erreur serveur lors de la création" });
  }
});


// POST /api/goals










require('dotenv').config(); // Charger les variables d'environnement



const { getMoodleCourses,getCourseContents  } = require('./API/Moodle'); 



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mfaRoutes = require('./routes/mfaRoutes');
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const quizzRoutes = require("./routes/quizzRoutes");
const Module = require("./routes/module");
const Course = require("./routes/course");

var app = express();


// Configuration du moteur de vues et des middlewares

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
  // console.log('Session:', req.session);
  // console.log('Session ID:', req.sessionID);
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
  origin: "http://localhost:5173",  // Assurez-vous que le frontend utilise ce port
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





// Autres routes de ton application
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Middleware de logging pour déboguer les requêtes
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
//   next();
// });


// In app.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));
app.get('/download-certificate/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'certificates', req.params.filename);
  res.download(filePath, err => {
    if (err) {
      console.error("Download error:", err);
      res.status(404).send("File not found");
    }
  });
});

app.use('/ia', require('./routes/ia'));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/module', Module);
app.use('/course', Course);
app.use('/courses', Course);
app.use('/delete', Course);
app.use('/preference',preference);


// Routes Google Classroom (corrigées)
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/classroom', classroomRoutes);


//auth routes

const mailersRoutes = require('./routes/mailroute');
app.use('/', mailersRoutes);
const ExamRoutes = require('./routes/ExamRoutes');
const quizRoutes = require('./routes/quizRoutes');
const authRouteschapter = require('./routes/chapterRoutes');
const authRoutes = require('./routes/authRoutes');
const authRoutesIA = require('./routes/ia');
const certifRoutes = require('./routes/certif.routes');
const badgesRoutes = require('./routes/badge.routes');
app.use('/api/auth', authRoutes);
app.use('/ia/auth', authRoutesIA);
app.use('/chapter', authRouteschapter);
app.use("/signup/mfa", mfaRoutes);
app.use("/api/info", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/quiz", quizzRoutes);
app.use("/certificates", certifRoutes);
app.use("/api/badges-r", badgesRoutes);

app.use("/quiz", quizRoutes);
app.use("/Exam", ExamRoutes);

// Gestion des erreurs
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

app.get('/api/courses', async (req, res) => {
  try {
      const courses = await getMoodleCourses();
      res.json(courses);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch courses' });
  }
});
app.post('/api/goals', async (req, res) => {
  try {
    const newGoal = new Goal(req.body);
    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/goals', async (req, res) => {
  try {
    const goals = await Goal.find().sort({ date: 1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/goals/:id', async (req, res) => {
  try {
    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return updated document
      runValidators: true,
    });

    if (!updatedGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json(updatedGoal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.delete('/api/goals/:id', async (req, res) => {
  try {
    const deletedGoal = await Goal.findByIdAndDelete(req.params.id);

    if (!deletedGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/goals/:id', async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal updated successfully', goal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const words = ["apple", "brain", "chair", "dream", "eagle"]; // Ideally from MongoDB!

app.get('/api/wordle/word', (req, res) => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    res.json({ word: randomWord });
});
app.get('/api/courses/:id/contents', async (req, res) => {
  try {
      const courseId = parseInt(req.params.id, 10);
      if (isNaN(courseId)) {
          return res.status(400).json({ error: 'Invalid course ID' });
      }


// Catch 404 and forward to error handler

      const contents = await getCourseContents(courseId);

      if (!Array.isArray(contents)) {
          console.error('⚠️ Unexpected response from Moodle:', contents);
          return res.status(500).json({ error: 'Expected array of contents from Moodle' });
      }

      console.log(`✅ Course ${courseId} contents:`, contents);
      res.json(contents);
  } catch (error) {
      console.error(`❌ Failed to fetch course contents:`, error.message);
      res.status(500).json({ error: 'Failed to fetch course contents' });
  }

});

// catch 404 and forward to error handler

app.use(function(req, res, next) {
  console.log(`Route non trouvée: ${req.method} ${req.url}`);
  next(createError(404));
});

// Error handler
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



// Testing connectivity
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


const PORT = process.env.PORT || 5000;

// 1. Get the server instance from Express
const server = app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  console.log(`Google Auth URL: http://localhost:${PORT}/api/auth/google/login`);
});

// 2. Attach Socket.IO to the existing Express server
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",  // Assurez-vous que le frontend utilise ce port
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket Initialization
const { initializeSocket } = require('./controllers/quizzLeaderboardController');
const { initSocket } = require('./utils/socket');
initializeSocket(io);  // Pass the socket instance to the controller
initSocket(io);

module.exports = app;