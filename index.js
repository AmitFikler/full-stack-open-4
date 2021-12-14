const express = require('express');
const app = express();
require('express-async-errors');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const apiRouter = require('./routers/api');
const userRouter = require('./routers/user');
const loginRouter = require('./routers/login');

const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.mongoUrlTest
    : process.env.mongoUrl;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connect to database');
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());

app.use('/api/blogs', apiRouter);
app.use('/api/users', userRouter);
app.use('/api/login', loginRouter);

const PORT = 3003;

const listener = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.killServer = () => {
  listener.close();
};

module.exports = app;
