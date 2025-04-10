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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json({ limit: '100mb' }));  
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//cors
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
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
app.use((err, req, res, next) => {
  console.error('Upload Error:', err.message);
  res.status(400).json({ error: err.message });
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
