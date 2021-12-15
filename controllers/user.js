const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.addNewUser = async (request, response) => {
  let { username, name, password } = request.body;
  password = '' + password;
  if (password.length <= 3) {
    return response.status(400).json({
      error: 'The password should consist of four characters or more',
    });
  }
  if (username.length <= 3) {
    return response.status(400).json({
      error: 'The username should consist of four characters or more',
    });
  }
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
