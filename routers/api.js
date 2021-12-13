const express = require('express');
const router = express.Router();

const { getAllBlogs, addNewBlog } = require('../controllers/api');

router.get('/', getAllBlogs);

router.post('/', addNewBlog);

module.exports = router;
