const Blog = require('../models/blog');

exports.getAllBlogs = async (request, response) => {
  const allBlog = await Blog.find({});
  response.json(allBlog);
};

exports.addNewBlog = async (request, response) => {
  const blog = new Blog(request.body);
  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
};
