const express = require('express');
const { addNewUser, getAllUsers } = require('../controllers/user');
const router = express.Router();

router.post('/', addNewUser);

router.get('/', getAllUsers);

module.exports = router;
