const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load models
const Course = require('../models/course');
const Chapter = require('../models/chapterModels');
// 🔁 Your JSON file path
const dataPath = path.join(__dirname, '../utils', 'courses.json');
const dataPath2 = path.join(__dirname, '../utils', 'openlearn_courses.json');

// 👤 Dummy IDs (these must exist in your DB)
const dummyUserId = '67f68a159fba1c57c0871a65'; // Admin or system user
const dummyModuleId = '67f68b259fba1c57c0871a66'; // Module for OpenClassrooms
// dummy IDs for OpenLearn courses
const dummyOpenLearnUserId = '67f705126b473aa9398bf92b'; // Admin or system user
const dummyOpenLearnModuleId = '67f68b259fba1c57c0871a66'; // Module for OpenLearn
// Function to import OpenClassrooms courses
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
              description: chapter.chapter_content,
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
    // Function to import OpenLearn courses
    const importOpenLearnCourses = async () => {
      try {
        const rawOpenData = fs.readFileSync(dataPath2);
        const courses = JSON.parse(rawOpenData);
    
        for (const course of courses) {
          // ⛔ Skip courses without chapters
          if (!course.chapters || course.chapters.length === 0) {
            console.log(`⏭️ Skipped (no chapters): ${course.title}`);
            continue;
          }
    
          const existing = await Course.findOne({ title: course.title });
          if (existing) {
            console.log(`⛔ Skipped (already exists): ${course.title}`);
            continue;
          }
    
          const chapterIds = [];
    
          for (const chapter of course.chapters) {
            const newChapter = new Chapter({
              title: chapter.title,
              description: chapter.content,
              courseId: [], // will update after saving course
              userid: dummyOpenLearnUserId,
              pdf: null,
              video: null,
            });
    
            await newChapter.save();
            chapterIds.push(newChapter._id);
          }
    
          const newCourse = new Course({
            title: course.title,
            description: course.description || 'OpenLearn course',
            price: 0,
            level: 'Beginner',
            categorie: course.category || 'OpenLearn',
            module: dummyOpenLearnModuleId,
            user: dummyOpenLearnUserId,
            chapters: chapterIds,
            exams: []
          });
    
          await newCourse.save();
    
          // ✅ Link course to chapters
          await Chapter.updateMany(
            { _id: { $in: chapterIds } },
            { $push: { courseId: newCourse._id } }
          );
    
          console.log(`✅ Imported: ${newCourse.title}`);
        }
    
        console.log('🎉 All OpenLearn courses imported!');
        process.exit();
      } catch (err) {
        console.error('❌ Error importing OpenLearn courses:', err);
        process.exit(1);
      }
    }
module.exports={importCourses, importOpenLearnCourses};