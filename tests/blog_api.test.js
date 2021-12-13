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
    title: 'test blog1',
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
  describe('GET /api/blogs:', () => {
    test('GET /api/blogs: blogs are returned as json', () => {
      api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });
    test('GET /api/blogs: should be 2 blogs ', async () => {
      const response = await api.get('/api/blogs');

      expect(response.body).toHaveLength(2);
    });
  });
  describe('POST /api/blogs:', () => {
    test('POST /api/blogs: a valid blog can be added', async () => {
      const newBlog = {
        title: 'test blog',
        author: 'tester',
        url: 'http://localhost:3003/api/blogs',
        likes: 10,
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
    test('POST /api/blogs: when likes is missing it will default to value 0 ', async () => {
      const blogWithoutLikes = {
        title: 'without likes',
        author: 'tester',
        url: 'http://localhost:3003/withoutLikes',
      };
      await api
        .post('/api/blogs')
        .send(blogWithoutLikes)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      const response = await api.get('/api/blogs');
      const withoutLikes = response.body.find(
        (blog) => blog.title === 'without likes'
      );
      expect(response.body).toHaveLength(initialBlogs.length + 1);
      expect(withoutLikes.likes).toBe(0);
    });

    test('POST /api/blogs: when title and url is missing it will throw status 400', async () => {
      const blogWithoutTitleUri = {
        author: 'tester',
        likes: 11,
      };
      await api
        .post('/api/blogs')
        .send(blogWithoutTitleUri)
        .expect(400)
        .expect('Content-Type', 'text/plain; charset=utf-8');
    });
  });
  describe('viewing a specific blog', () => {
    test('The unique identifier property of the blog posts is by default _id', async () => {
      const blogs = await Blog.find({});
      expect(blogs[0].id).toBeDefined();
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
