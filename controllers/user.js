const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.addNewUser = async (request, response) => {
  const { username, name, password } = request.body;
  const salt = 10;
  const passwordHash = await bcrypt.hash('' + password, salt);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();
  response.json(savedUser);
};

exports.getAllUsers = async (request, response) => {
  const users = await User.find({}).populate('blogs');
  response.json(users);
};
