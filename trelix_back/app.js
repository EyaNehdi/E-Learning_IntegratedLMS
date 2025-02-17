var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mfaRoutes = require('./routes/mfaRoutes');
var app = express();
require('dotenv').config();
console.log("MONGO_URI:", process.env.MONGO_URI);  // Debug


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//cors
app.use(cors({
  origin: "http://localhost:5173", // Allow only your frontend URL
  credentials: true, // Allow cookies and credentials
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
}));



app.use('/', indexRouter);
app.use('/users', usersRouter);
//auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use("/signup/mfa", mfaRoutes);



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
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
module.exports = app;

