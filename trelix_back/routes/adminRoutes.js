const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser, getAuditLogs, archiveUser, unarchiveUser,countStudents,countInstructors, getInstructors } = require('../controllers/adminController');
const { identifyActingUser, logActivityMiddleware } = require('../middlewares/logActivityMiddleware');

router.get('/allUsers', getUsers);
router.get('/user/:id', getUserById);
router.post('/createUser', identifyActingUser, logActivityMiddleware('createUser', 'User'), createUser);
router.put('/updateUser/:id', identifyActingUser, logActivityMiddleware('updateUser', 'User'), updateUser);
router.put('/archiveUser/:id', identifyActingUser, logActivityMiddleware('archiveUser', 'User'), archiveUser);
router.put('/unarchiveUser/:id', identifyActingUser, logActivityMiddleware('unarchiveUser', 'User'), unarchiveUser);
// router.delete('/deleteUser/:id',deleteUser);
router.get('/audit-logs', getAuditLogs);
router.get('/count/student',countStudents);
router.get('/count/instructor',countInstructors);
router.get('/instructors', getInstructors);

module.exports = router;