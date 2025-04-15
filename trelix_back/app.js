// Au tout début de app.js
require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const googleClassroomRoutes = require('./routes/googleClassroom.routes');
const multer = require('multer');
const socketIo = require('socket.io');
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

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Configuration CORS

//cors

app.use(cors({
  origin: "http://localhost:5173",  // Assurez-vous que le frontend utilise ce port
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
}));










// Autres routes de ton application
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Middleware de logging pour déboguer les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});



// Routes

app.use('/ia', require('./routes/ia'));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/module', Module);
app.use('/course', Course);
app.use('/courses', Course);
app.use('/delete', Course);


// Auth routes

app.use('/api/classroom', googleClassroomRoutes);

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

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Upload Error:', err.message);
  res.status(400).json({ error: err.message });
});
app.get('/api/courses', async (req, res) => {
  try {
      const courses = await getMoodleCourses();
      res.json(courses);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch courses' });
  }
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
initializeSocket(io);  // Pass the socket instance to the controller

module.exports = app;
