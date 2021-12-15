const Blog = require('../models/blog');

exports.getAllBlogs = async (request, response) => {
  const allBlog = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  response.json(allBlog);
};

exports.addNewBlog = async (request, response) => {
  const user = request.user;
  let { title, author, url, likes } = request.body;
  if (!likes) {
    likes = 0;
  }
  if (!title && !url) {
    return response.sendStatus(400);
  }
  const blog = new Blog({ title, author, url, likes, user: user._id });
  const savedBlog = await blog.save();

  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
};

exports.deleteBlog = async (request, response) => {
  const { id } = request.query;
  const blog = await Blog.findById(id);
  const user = request.user;
  if (user._id.toString() === blog.user.toString()) {
    await Blog.findByIdAndDelete(id);
    user.blogs = user.blogs.filter((blog) => blog.id !== id);
    await user.save();
    response.sendStatus(204);
  } else {
    return response.status(401).json({ error: 'you cant delete p' });
  }
};

exports.updateLikes = async (request, response) => {
  const { id } = request.param;
  if (request.body.title === '' || request.body.url === '') {
    return response.sendStatus(401);
  }
  await Blog.findOneAndUpdate({ id }, request.body);
  response.sendStatus(200);
};
