/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./app.js":
/*!****************!*\
  !*** ./app.js ***!
  \****************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n// Module\nvar code = `var createError = require('http-errors');\r\nvar express = require('express');\r\nvar path = require('path');\r\nvar cookieParser = require('cookie-parser');\r\nvar logger = require('morgan');\r\nvar cookieParser = require('cookie-parser');\r\nconst cors = require('cors');\r\nconst multer = require('multer');\r\n\r\n\r\n\r\nvar indexRouter = require('./routes/index');\r\nvar usersRouter = require('./routes/users');\r\nvar mfaRoutes = require('./routes/mfaRoutes');\r\nconst profileRoutes = require(\"./routes/profileRoutes\");\r\nconst adminRoutes = require(\"./routes/adminRoutes\");\r\n\r\nvar app = express();\r\nrequire('dotenv').config();\r\nconsole.log(\"MONGO_URI:\", process.env.MONGO_URI);  // Debug\r\n\r\n\r\n// view engine setup\r\napp.set('views', path.join(__dirname, 'views'));\r\napp.set('view engine', 'jade');\r\n\r\napp.use(logger('dev'));\r\napp.use(express.json({ limit: '100mb' }));  \r\napp.use(express.urlencoded({ extended: true, limit: '100mb' }));\r\napp.use(cookieParser());\r\napp.use(express.static(path.join(__dirname, 'public')));\r\n//cors\r\napp.use(cors({\r\n  origin: \"http://localhost:5173\",\r\n  credentials: true,\r\n  methods: \"GET,HEAD,PUT,PATCH,POST,DELETE\",\r\n  allowedHeaders: [\"Content-Type\", \"Authorization\"],\r\n}));;\r\n// In app.js\r\napp.use('/uploads', express.static(path.join(__dirname, 'uploads')));\r\n\r\n\r\napp.use('/ia', require('./routes/ia'));\r\napp.use('/', indexRouter);\r\napp.use('/users', usersRouter);\r\n//auth routes\r\nconst authRoutes = require('./routes/authRoutes');\r\nconst authRoutesIA = require('./routes/ia');\r\napp.use('/api/auth', authRoutes);\r\napp.use('/ia/auth', authRoutesIA);\r\n\r\napp.use(\"/signup/mfa\", mfaRoutes);\r\napp.use(\"/api/info\", profileRoutes);\r\napp.use(\"/api/admin\", adminRoutes);\r\n\r\napp.use((err, req, res, next) => {\r\n  console.error('Upload Error:', err.message);\r\n  res.status(400).json({ error: err.message });\r\n});\r\n\r\n// catch 404 and forward to error handler\r\napp.use(function(req, res, next) {\r\n  next(createError(404));\r\n});\r\n\r\n// error handler\r\napp.use(function(err, req, res, next) {\r\n  // set locals, only providing error in development\r\n  res.locals.message = err.message;\r\n  res.locals.error = req.app.get('env') === 'development' ? err : {};\r\n\r\n  // render the error page\r\n  res.status(err.status || 500);\r\n  res.render('error');\r\n});\r\n\r\n\r\n//testing connectivity \r\nconst { connectDB } = require(\"./config/db\");\r\n\r\nasync function startApp() {\r\n  console.log(\"🚀 Starting Application...\");\r\n\r\n  // Connect to MongoDB\r\n  try {\r\n    const db = await connectDB(); \r\n    console.log(\" Connected to MongoDB!\");\r\n  } catch (error) {\r\n    console.error(\" MongoDB connection failed:\", error);\r\n  }\r\n}\r\n\r\nstartApp();\r\n//port number from .env\r\nconst PORT = process.env.PORT || 5000;\r\napp.listen(PORT, () => {\r\n  console.log(\"Server is running on port \" + PORT);\r\n});\r\nmodule.exports = app;\r\n\r\n`;\n// Exports\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);\n\n//# sourceURL=webpack://trelix-back/./app.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./app.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;