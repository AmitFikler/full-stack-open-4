const User = require('../models/user');
const Blog = require('../models/blog');

exports.getAllBlogs = async (request, response) => {
  const allBlog = await Blog.find({});
  response.json(allBlog);
};

exports.addNewBlog = async (request, response) => {
  let { title, author, url, likes, userId } = request.body;
  if (!likes) {
    likes = 0;
  }
  if (!title && !url) {
    return response.sendStatus(400);
  }
  const user = await User.findById(userId);
  const blog = new Blog({ title, author, url, likes, user: user._id });
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
};

exports.deleteBlog = async (request, response) => {
  const { id } = request.query;
  console.log(id);
  await Blog.findOneAndDelete({ id });
  response.sendStatus(204);
};

exports.updateLikes = async (request, response) => {
  const { id } = request.param;
  if (request.body.title === '' || request.body.url === '') {
    return response.sendStatus(401);
  }
  await Blog.findOneAndUpdate({ id }, request.body);
  response.sendStatus(200);
};
