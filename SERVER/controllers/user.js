const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../auth');

const { errorHandler } = auth;


module.exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, mobileNo, password } = req.body;

  if (!email.includes("@")) {
    return res.status(400).send({ message: 'Email invalid' });
  }

  if (mobileNo.length !== 11) {
    return res.status(400).send({ message: 'Mobile number invalid' });
  }

  if (password.length < 8) {
    return res.status(400).send({ message: 'Password must be at least 8 characters long' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send({ message: 'Email already in use' });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      mobileNo,
      password: bcrypt.hashSync(password, 10)
    });

    await newUser.save();
    res.status(201).send({ message: 'Registered successfully' });
  } catch (error) {
    errorHandler(error, req, res);
  }
};


module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email.includes("@")) {
    return res.status(400).send({ message: 'Invalid email format' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'No email found' });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).send({ message: 'Incorrect email or password' });
    }

    const accessToken = auth.createAccessToken(user);
    res.status(200).send({
      message: 'User logged in successfully',
      access: accessToken
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id)
    .then(user => {

        if(!user){
            return res.status(403).send({ message: 'invalid signature' })
        }else {
            user.password = "";
            return res.status(200).send(user);
        }  
    })
    .catch(error => errorHandler(error, req, res));
};