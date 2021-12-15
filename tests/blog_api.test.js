const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../index');
const Blog = require('../models/blog');
const User = require('../models/user');
const e = require('express');
const api = supertest(app);

let userToken;
const initialBlogs = [
  {
    title: 'test blog',
    author: 'admin',
    url: 'https://github.com/',
    likes: 10,
    user: '61b9ee228793e10ffb494be8',
  },
  {
    title: 'test blog1',
    author: 'admin',
    url: 'https://github.com/',
    likes: 10,
    user: '61b9ee228793e10ffb494be8',
  },
];
const users = [
  {
    _id: '61b9ee228793e10ffb494be8',
    username: 'admin',
    name: 'admin',
    passwordHash:
      '$2b$10$55rL9YQPxyEL9UVxK2hLBudlmyEFtNDUYbXba8D/fRC3zjK/IHmWq',
    blogs: [],
  },
  {
    _id: '61b9ebfd54b7ff4fdf503ea5',
    username: 'user1',
    name: 'user1',
    passwordHash:
      '$2b$10$jg/uclIeaAi71lxy3BY59uXhq3hppEgTEzqc0wpiTyBv/C/e61oia',
    blogs: [],
  },
];

beforeEach(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});
  await User.insertMany(users);
  const response = await api.post('/api/login').send({
    username: 'admin',
    password: 'admin',
  });
  userToken = response.body.token;
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
        .set({ Authorization: 'Bearer ' + userToken })
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });
    test('GET /api/blogs: should be 2 blogs', async () => {
      const response = await api
        .get('/api/blogs')
        .set({ Authorization: 'Bearer ' + userToken });
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
        .set({ Authorization: 'Bearer ' + userToken })
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      const response = await api
        .get('/api/blogs')
        .set({ Authorization: 'Bearer ' + userToken });
      const titles = response.body.map((r) => r.title);
      expect(response.body).toHaveLength(initialBlogs.length + 1);
      expect(titles).toContain('test blog');
    });
    test('POST /api/blogs: invalid token throw an error status 401', async () => {
      const newBlog = {
        title: 'test blog',
        author: 'tester',
        url: 'http://localhost:3003/api/blogs',
        likes: 10,
      };
      await api
        .post('/api/blogs')
        .set({ Authorization: 'Bearer ' + 'invalidToken' })
        .send(newBlog)
        .expect(401);
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
        .set({ Authorization: 'Bearer ' + userToken })
        .expect(201)
        .expect('Content-Type', /application\/json/);
      const response = await api
        .get('/api/blogs')
        .set({ Authorization: 'Bearer ' + userToken });
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
        .set({ Authorization: 'Bearer ' + userToken })
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
  describe('Delete blog by Id', () => {
    test('DELETE /api/blogs: Deletes a blog by its ID ', async () => {
      const blogs = await Blog.find({});
      const idToDelete = blogs[0].id;
      await api
        .delete(`/api/blogs/?id=${idToDelete}`)
        .set({ Authorization: 'Bearer ' + userToken })
        .expect(204);
      const blogsAfterDel = await Blog.find({});
      expect(blogsAfterDel.length).toBe(blogs.length - 1);
    });

    describe('Update blog', () => {
      test('should be able to update blog', async () => {
        const blogs = await Blog.find({});
        const idToUpdate = blogs[0].id;
        await api
          .put(`/api/blogs/${idToUpdate}`)
          .set({ Authorization: 'Bearer ' + userToken })
          .send({ likes: 111 })
          .expect(200);
        const updatedOne = await Blog.findOne({ id: idToUpdate });
        expect(updatedOne.likes).toBe(111);
      });
      describe('should be throw error if try to update with empty title or url', () => {
        test('empty url ', async () => {
          const blogs = await Blog.find({});
          const idToUpdate = blogs[0].id;
          await api
            .put(`/api/blogs/${idToUpdate}`)
            .set({ Authorization: 'Bearer ' + userToken })
            .send({ url: '' })
            .expect(401);
        });
        test('empty title', async () => {
          const blogs = await Blog.find({});
          const idToUpdate = blogs[0].id;
          await api
            .put(`/api/blogs/${idToUpdate}`)
            .set({ Authorization: 'Bearer ' + userToken })
            .send({ title: '' })
            .expect(401);
        });
      });
      describe('when there is initially one user in db', () => {
        beforeEach(async () => {
          await User.deleteMany({});

          const passwordHash = await bcrypt.hash('sekret', 10);
          const user = new User({ username: 'root', passwordHash });

          await user.save();
        });
        test('creation succeeds with a fresh username', async () => {
          const usersAtStart = await User.find({});

          const newUser = {
            username: 'tester',
            name: 'Amir',
            password: 'amirKi',
          };

          await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/);
          const usersAtEnd = await User.find({});
          expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

          const usernames = usersAtEnd.map((user) => user.username);
          expect(usernames).toContain(newUser.username);
        });
        test('creation fails with proper statusCode and message if username already taken', async () => {
          const usersAtStart = await User.find({});
          const newUser = {
            username: 'root',
            name: 'need to',
            password: 'fail',
          };
          await api.post('/api/users').send(newUser).expect(500);

          const usersAtEnd = await User.find({});
          expect(usersAtEnd).toHaveLength(usersAtStart.length);
        });

        test('creation fails with proper statusCode and message if username has less then 3 keys', async () => {
          const usersAtStart = await User.find({});
          const newUser = {
            username: 'ro',
            name: 'need to',
            password: 'fail',
          };
          await api.post('/api/users').send(newUser).expect(400);

          const usersAtEnd = await User.find({});
          expect(usersAtEnd).toHaveLength(usersAtStart.length);
        });
        test('creation fails with proper statusCode and message if password has less then 3 keys', async () => {
          const usersAtStart = await User.find({});
          const newUser = {
            username: 'testing',
            name: 'need to',
            password: '12',
          };
          await api.post('/api/users').send(newUser).expect(400);

          const usersAtEnd = await User.find({});
          expect(usersAtEnd).toHaveLength(usersAtStart.length);
        });
        describe('POST /api/login ', () => {
          test('should return token when the user enters correct details', async () => {
            await User.insertMany(users);
            const response = await api.post('/api/login').send({
              username: 'admin',
              password: 'admin',
            });
            let hasToken = response.body.hasOwnProperty('token');
            expect(hasToken).toBe(true);
          });
          test('should throw 401 when the user enters incorrect details', async () => {
            await api
              .post('/api/login')
              .send({
                username: 'admin',
                password: 'incorrectPassword',
              })
              .expect(401);
          });
        });
      });
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
  app.killServer();
});
