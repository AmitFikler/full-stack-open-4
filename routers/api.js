const express = require('express');
const router = express.Router();

const { getAllBlogs, addNewBlog, deleteBlog } = require('../controllers/api');

router.get('/', getAllBlogs);

router.post('/', addNewBlog);

router.delete('/', deleteBlog);

module.exports = router;
