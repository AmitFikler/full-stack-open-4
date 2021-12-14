const express = require('express');
const router = express.Router();

const {
  getAllBlogs,
  addNewBlog,
  deleteBlog,
  updateLikes,
} = require('../controllers/api');

router.get('/', getAllBlogs);

router.post('/', addNewBlog);

router.delete('/', deleteBlog);

router.put('/:id', updateLikes);

module.exports = router;
