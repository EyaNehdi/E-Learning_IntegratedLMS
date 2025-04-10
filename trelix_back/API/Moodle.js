const axios = require('axios');

const MOODLE_URL = 'http://localhost/webservice/rest/server.php';
const MOODLE_TOKEN = '18d62fbe2429478edc4d42c1d35c3e60';  // Replace with your real Moodle token

// ✅ Get all courses (as you already had)
async function getMoodleCourses() {
    try {
        const response = await axios.get(MOODLE_URL, {
            params: {
                wstoken: MOODLE_TOKEN,
                wsfunction: 'core_course_get_courses',
                moodlewsrestformat: 'json',
            },
        });

        // Check if response is array
        if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.error('Unexpected data format:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching Moodle courses:', error?.response?.data || error.message);
        return [];
    }
}

// ✅ Get contents of a specific course (modules like videos, files, etc.)

async function getCourseContents(courseId) {
    try {
        const response = await axios.get(MOODLE_URL, {
            params: {
                wstoken: MOODLE_TOKEN,
                wsfunction: 'core_course_get_contents',
                moodlewsrestformat: 'json',
                courseid: courseId,
            },
        });
        
        console.log('Moodle course contents:', JSON.stringify(response.data, null, 2)); // 🔍
        return response.data;
    } catch (error) {
        console.error(`Error fetching contents for course ${courseId}:`, error?.response?.data || error.message);
        throw new Error('Moodle API failed');
    }
}

module.exports = {
    getMoodleCourses,
    getCourseContents, // ✅ Export this too
};
