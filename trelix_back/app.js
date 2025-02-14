var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mfaRoutes = require('./routes/mfaRoutes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//cors
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));



app.use('/', indexRouter);
app.use('/users', usersRouter);
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

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
module.exports = app;
