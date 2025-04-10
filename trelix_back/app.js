var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const socketIo = require('socket.io');

const { getMoodleCourses,getCourseContents  } = require('./API/Moodle'); 

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mfaRoutes = require('./routes/mfaRoutes');
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const quizzRoutes = require("./routes/quizzRoutes");
const Module =require("./routes/module");
const Course =require("./routes/course");


var app = express();
require('dotenv').config();
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
}));;
// In app.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/ia', require('./routes/ia'));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/module', Module);
app.use('/course', Course);
app.use('/courses', Course);
app.use('/delete', Course);


//auth routes

const ExamRoutes = require('./routes/ExamRoutes');
const quizRoutes = require('./routes/quizRoutes');
const authRouteschapter = require('./routes/chapterRoutes'); 
const authRoutes = require('./routes/authRoutes');
const authRoutesIA = require('./routes/ia');
const certifRoutes = require('./routes/certif.routes');
app.use('/api/auth', authRoutes);
app.use('/ia/auth', authRoutesIA);
app.use('/chapter', authRouteschapter);
app.use("/signup/mfa", mfaRoutes);
app.use("/api/info", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use ("/api/quiz",quizzRoutes);
app.use ("/certificates",certifRoutes);

app.use("/quiz", quizRoutes);
app.use("/Exam", ExamRoutes);
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
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// Set up the socket connection

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
// app.listen(PORT, () => {
//   console.log("Server is running on port " + PORT);
// });
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

