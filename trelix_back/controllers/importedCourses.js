const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load models
const Course = require('../models/course');
const Chapter = require('../models/chapterModels');
// 🔁 Your JSON file path
const dataPath = path.join(__dirname, '../utils', 'courses.json');

// 👤 Dummy IDs (these must exist in your DB)
const dummyUserId = '67f68a159fba1c57c0871a65'; // Admin or system user
const dummyModuleId = '67f68b259fba1c57c0871a66'; // Module for OpenClassrooms
const importCourses = async()=> {
    try {
      const rawData = fs.readFileSync(dataPath);
      const courses = JSON.parse(rawData);
  
      for (const course of courses) {
        const existing = await Course.findOne({ title: course.course_title });
        if (existing) {
          console.log(`⛔ Skipped (already exists): ${course.course_title}`);
          continue;
        }
        const chapterIds = [];
  
        for (const part of course.parts || []) {
          for (const chapter of part.chapters || []) {
            const newChapter = new Chapter({
              title: chapter.chapter_title,
              description: "OpenClassrooms scraped course",
              courseId: [], // will add this later
              userid: dummyUserId,
              pdf: null,
              video: null,
            });
  
            await newChapter.save();
            chapterIds.push(newChapter._id);
          }
        }
  
        const newCourse = new Course({
          title: course.course_title,
          description: "Openclassrooms scraped course",
          price: 0,
          level: 'Beginner',
          categorie: 'OpenClassrooms',
          module: dummyModuleId,
          user: dummyUserId,
          chapters: chapterIds,
          exams: [] // You can add some dummy exams if needed
        });
  
        await newCourse.save();
  
        // Update courseId for all the chapters
        await Chapter.updateMany(
          { _id: { $in: chapterIds } },
          { $push: { courseId: newCourse._id } }
        );
  
        console.log(`✅ Imported: ${newCourse.title}`);
      }
  
      console.log('🎉 All courses imported!');
      process.exit();
    } catch (err) {
      console.error('❌ Error importing courses:', err);
      process.exit(1);
    }}
    module.exports={importCourses};