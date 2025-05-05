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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n// Module\nvar code = `// Au tout début de app.js\nrequire('dotenv').config();\nvar createError = require('http-errors');\nvar express = require('express');\nvar path = require('path');\nvar cookieParser = require('cookie-parser');\nvar logger = require('morgan');\nconst cors = require('cors');\nconst googleClassroomRoutes = require('./routes/googleClassroom.routes');\nconst multer = require('multer');\nconst socketIo = require('socket.io');\n\nconst certifRoutes = require('./routes/certif.routes');\n\nconst axios = require('axios');\n\nrequire('dotenv').config(); // Charger les variables d'environnement\n\n\n\nconst { getMoodleCourses,getCourseContents  } = require('./API/Moodle'); \n\n\nvar indexRouter = require('./routes/index');\nvar usersRouter = require('./routes/users');\nvar mfaRoutes = require('./routes/mfaRoutes');\nconst profileRoutes = require(\"./routes/profileRoutes\");\nconst adminRoutes = require(\"./routes/adminRoutes\");\nconst quizzRoutes = require(\"./routes/quizzRoutes\");\nconst Module = require(\"./routes/module\");\nconst Course = require(\"./routes/course\");\n\nvar app = express();\n\n\n// Configuration du moteur de vues et des middlewares\n\nconsole.log(\"MONGO_URI:\", process.env.MONGO_URI);  // Debug\n\n// view engine setup\n\napp.set('views', path.join(__dirname, 'views'));\napp.set('view engine', 'jade');\n\napp.use(logger('dev'));\napp.use(express.json({ limit: '100mb' }));\napp.use(express.urlencoded({ extended: true, limit: '100mb' }));\napp.use(cookieParser());\napp.use(express.static(path.join(__dirname, 'public')));\n\n\n// Configuration CORS\n\n//cors\n\napp.use(cors({\n  origin: \"http://localhost:5173\",  // Assurez-vous que le frontend utilise ce port\n  credentials: true,\n  methods: \"GET,HEAD,PUT,PATCH,POST,DELETE\",\n  allowedHeaders: [\"Content-Type\", \"Authorization\"],\n}));\n\n\napp.post('/chatbot', async (req, res) => {\n  console.log(\"Requête reçue:\", req.body); // Debug important\n  \n  try {\n    const { question } = req.body;\n    \n    // Validation renforcée\n    if (!question || typeof question !== 'string' || question.trim().length === 0) {\n      console.error(\"Question invalide:\", question);\n      return res.status(400).json({ \n        error: 'Question invalide',\n        details: 'La question doit être une chaîne non vide' \n      });\n    }\n\n    // Log pour vérifier la clé API\n    console.log(\"Clé API utilisée:\", process.env.DEEPSEEK_API_KEY ? \"***\" : \"MANQUANTE\");\n\n    const response = await axios.post(\n      'https://api.deepseek.com/v1/chat/completions',\n      {\n        model: 'deepseek-chat',\n        messages: [{ \n          role: 'user', \n          content: question.substring(0, 1000) // Protection\n        }],\n        max_tokens: 200,\n        temperature: 0.7\n      },\n      {\n        headers: {\n          'Authorization': \\`Bearer \\${process.env.DEEPSEEK_API_KEY}\\`,\n          'Content-Type': 'application/json',\n          'Accept': 'application/json'\n        },\n        timeout: 10000 // 10s timeout\n      }\n    );\n\n    console.log(\"Réponse API:\", response.data); // Debug\n\n    if (!response.data.choices?.[0]?.message?.content) {\n      throw new Error(\"Structure de réponse inattendue\");\n    }\n\n    res.json({ \n      reply: response.data.choices[0].message.content \n    });\n\n  } catch (error) {\n    console.error(\"ERREUR COMPLÈTE:\", {\n      message: error.message,\n      code: error.code,\n      response: error.response?.data,\n      stack: error.stack\n    });\n    \n  }\n});\n\n\n// Autres routes de ton application\napp.use('/uploads', express.static(path.join(__dirname, 'uploads')));\n\n\n// Middleware de logging pour déboguer les requêtes\napp.use((req, res, next) => {\n  console.log(\\`\\${new Date().toISOString()} - \\${req.method} \\${req.url}\\`);\n  next();\n});\n\n\n// In app.js\napp.use('/uploads', express.static(path.join(__dirname, 'uploads')));\napp.use('/certificates', express.static(path.join(__dirname, 'certificates')));\napp.use(\"/certificates\", certifRoutes);\n\n// Routes\n\napp.use('/ia', require('./routes/ia'));\napp.use('/', indexRouter);\napp.use('/users', usersRouter);\napp.use('/module', Module);\napp.use('/course', Course);\napp.use('/courses', Course);\napp.use('/delete', Course);\n\n\n// Auth routes\n\napp.use('/api/classroom', googleClassroomRoutes);\n\n//auth routes\n\nconst mailersRoutes = require('./routes/mailroute');\napp.use('/', mailersRoutes);\nconst ExamRoutes = require('./routes/ExamRoutes');\nconst quizRoutes = require('./routes/quizRoutes');\nconst authRouteschapter = require('./routes/chapterRoutes');\nconst authRoutes = require('./routes/authRoutes');\nconst authRoutesIA = require('./routes/ia');\napp.use('/api/auth', authRoutes);\napp.use('/ia/auth', authRoutesIA);\napp.use('/chapter', authRouteschapter);\napp.use(\"/signup/mfa\", mfaRoutes);\napp.use(\"/api/info\", profileRoutes);\napp.use(\"/api/admin\", adminRoutes);\napp.use(\"/api/quiz\", quizzRoutes);\n\napp.use(\"/quiz\", quizRoutes);\napp.use(\"/Exam\", ExamRoutes);\n\n// Gestion des erreurs\napp.use((err, req, res, next) => {\n  console.error('Upload Error:', err.message);\n  res.status(400).json({ error: err.message });\n});\napp.get('/api/courses', async (req, res) => {\n  try {\n      const courses = await getMoodleCourses();\n      res.json(courses);\n  } catch (error) {\n      res.status(500).json({ error: 'Failed to fetch courses' });\n  }\n});\n\n\napp.get('/api/courses/:id/contents', async (req, res) => {\n  try {\n      const courseId = parseInt(req.params.id, 10);\n      if (isNaN(courseId)) {\n          return res.status(400).json({ error: 'Invalid course ID' });\n      }\n\n\n// Catch 404 and forward to error handler\n\n      const contents = await getCourseContents(courseId);\n\n      if (!Array.isArray(contents)) {\n          console.error('⚠️ Unexpected response from Moodle:', contents);\n          return res.status(500).json({ error: 'Expected array of contents from Moodle' });\n      }\n\n      console.log(\\`✅ Course \\${courseId} contents:\\`, contents);\n      res.json(contents);\n  } catch (error) {\n      console.error(\\`❌ Failed to fetch course contents:\\`, error.message);\n      res.status(500).json({ error: 'Failed to fetch course contents' });\n  }\n});\n\n// catch 404 and forward to error handler\n\napp.use(function(req, res, next) {\n  console.log(\\`Route non trouvée: \\${req.method} \\${req.url}\\`);\n  next(createError(404));\n});\n\n// Error handler\napp.use(function(err, req, res, next) {\n\n  // Log l'erreur pour le débogage\n  console.error(\\`Erreur: \\${err.status || 500} - \\${err.message}\\`);\n  console.error(\\`URL: \\${req.method} \\${req.originalUrl}\\`);\n  \n  // set locals, only providing error in development\n  res.locals.message = err.message;\n  res.locals.error = req.app.get('env') === 'development' ? err : {};\n\n  // Pour les API, renvoyer une réponse JSON si c'est une route API\n  if (req.originalUrl.startsWith('/api/')) {\n    return res.status(err.status || 500).json({\n      error: err.message,\n      status: err.status || 500\n    });\n  }\n\n  // render the error page pour les autres routes\n  res.status(err.status || 500);\n  res.render('error');\n});\n\n\n// Testing connectivity\nconst { connectDB } = require(\"./config/db\");\n\nasync function startApp() {\n  console.log(\"🚀 Starting Application...\");\n\n  // Connect to MongoDB\n  try {\n    const db = await connectDB();\n    console.log(\" Connected to MongoDB!\");\n  } catch (error) {\n    console.error(\" MongoDB connection failed:\", error);\n  }\n}\n\nstartApp();\n\n\nconst PORT = process.env.PORT || 5000;\n\n// 1. Get the server instance from Express\nconst server = app.listen(PORT, () => {\n  console.log(\"Server is running on port \" + PORT);\n});\n\n// 2. Attach Socket.IO to the existing Express server\nconst io = socketIo(server, {\n  cors: {\n    origin: \"http://localhost:5173\",  // Assurez-vous que le frontend utilise ce port\n    methods: [\"GET\", \"POST\"],\n    credentials: true\n  }\n});\n\n\n// Socket Initialization\nconst { initializeSocket } = require('./controllers/quizzLeaderboardController');\ninitializeSocket(io);  // Pass the socket instance to the controller\n\nmodule.exports = app;\n`;\n// Exports\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);\n\n//# sourceURL=webpack://trelix-back/./app.js?");

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