const { importCourses, importOpenLearnCourses } = require('../controllers/importedCourses');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

require('../config/db'); // connect to MongoDB
const mongoose = require('mongoose');
const {connectDB} = require('../config/db');
(async () => {
    try {
      console.log("⏳ Connecting to MongoDB...");
      await connectDB(); // 👈 important
      console.log("✅ Connected!");
      await importCourses(); 
      /*await importOpenLearnCourses();*/
      console.log("✅ Courses imported successfully!"); 
    } catch (err) {
      console.error("❌ Script failed:", err);
      process.exit(1);
    }
  })();