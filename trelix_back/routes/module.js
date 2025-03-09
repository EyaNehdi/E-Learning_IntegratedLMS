var express = require('express');
var router = express.Router();
const {createModule, getModules} = require('../controllers/moduleController');

router.post("/addmodule",createModule)
router.get("/",getModules); // Ajouter cette ligne pour la récupération des modules






module.exports = router;
