const express = require('express');
const router = express.Router();
const { getUsers, getUserById,
     createUser, updateUser, UserStats, 
     getAuditLogs, archiveUser, unarchiveUser,
      countStudents, countInstructors, getInstructors, RegistrationStats,
      createProductWithStripe,
    getProducts,updateProductAndPrice,
getProductById,archiveProduct,
unarchiveProduct } = require('../controllers/adminController');
const { identifyActingUser, logActivityMiddleware } = require('../middlewares/logActivityMiddleware');

//Stripe routes
router.post('/addPack', createProductWithStripe); 
router.get('/packs',getProducts);
router.get('/pack/:id', getProductById); // Get product by ID
router.put('/update-pack/:id', updateProductAndPrice); // Update product and price
router.put('/archive-pack/:id', archiveProduct); // Archive product
router.put('/unarchive-pack/:id', unarchiveProduct); // Unarchive product


router.get('/allUsers', getUsers);
router.get('/user/:id', getUserById);
router.post('/createUser', identifyActingUser, logActivityMiddleware('createUser', 'User'), createUser);
router.put('/updateUser/:id', identifyActingUser, logActivityMiddleware('updateUser', 'User'), updateUser);
router.put('/archiveUser/:id', identifyActingUser, logActivityMiddleware('archiveUser', 'User'), archiveUser);
router.put('/unarchiveUser/:id', identifyActingUser, logActivityMiddleware('unarchiveUser', 'User'), unarchiveUser);
// router.delete('/deleteUser/:id',deleteUser);
router.get('/audit-logs', getAuditLogs);
router.get('/count/student', countStudents);
router.get('/count/instructor', countInstructors);
router.get('/instructors', getInstructors);
router.get('/users/stats', UserStats);
router.get('/users/registration-stats', RegistrationStats);


module.exports = router;