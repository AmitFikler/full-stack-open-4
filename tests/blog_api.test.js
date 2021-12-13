const { TestWatcher } = require('jest');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../index');
const Blog = require('../models/blog');
const api = supertest(app);

const initialBlogs = [
  {
    title: 'test blog',
    author: 'admin',
    url: 'https://github.com/',
    likes: 10,
  },
  {
    title: 'test blog',
    author: 'admin',
    url: 'https://github.com/',
    likes: 10,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
});

describe('api testing', () => {
  test('blogs are returned as json', () => {
    api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
  test('should be 2 blogs ', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(2);
  });
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'test blog',
      author: 'tester',
      url: 'http://localhost:3003/api/blogs',
      likes: 3,
    };
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    const response = await api.get('/api/blogs');
    const titles = response.body.map((r) => r.title);
    expect(response.body).toHaveLength(initialBlogs.length + 1);
    expect(titles).toContain('test blog');
  });
  test('The unique identifier property of the blog posts is by default _id', async () => {
    const blogs = await Blog.find({});
    console.log(blogs[0]._id);
    expect(blogs[0].id).toBeDefined();
  });
});

afterAll(() => {
  mongoose.connection.close();
});
