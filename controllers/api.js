const Blog = require('../models/blog');

exports.getAllBlogs = async (request, response) => {
  const allBlog = await Blog.find({});
  response.json(allBlog);
};

exports.addNewBlog = async (request, response) => {
  let { title, author, url, likes } = request.body;
  if (!likes) {
    likes = 0;
  }
  if (!title && !url) {
    return response.sendStatus(400);
  }
  const blog = new Blog({ title, author, url, likes });
  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
};
