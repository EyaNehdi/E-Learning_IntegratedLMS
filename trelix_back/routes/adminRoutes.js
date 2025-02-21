const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/adminController');

router.get('/allUsers',getUsers);
router.get('/user/:id',getUserById);
router.post('/createUser',createUser);
router.put('/updateUser/:id',updateUser);
router.delete('/deleteUser/:id',deleteUser);

module.exports = router;