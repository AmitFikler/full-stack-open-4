const _ = require('lodash');

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  let counter = 0;
  for (let blog of blogs) {
    counter += Number(blog.likes);
  }
  return counter;
};

const favoriteBlog = (blogs) => {
  let favoriteBlog = blogs[0];
  for (let blog of blogs) {
    if (blog.likes > favoriteBlog.likes) {
      favoriteBlog = blog;
    }
  }
  return favoriteBlog;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
