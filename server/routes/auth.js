const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, birthDate } = req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword || !birthDate) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'User already exists' });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash,
    birthDate
  });

  const token = signToken(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });

  res.json({ message: 'Registered', user: { email: user.email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });

  res.json({ message: 'Logged in', user: { email: user.email } });
});

router.post('/logout', (_, res) => {
  res.cookie('token', '', { maxAge: 0 });
  res.json({ message: 'Logged out' });
});

module.exports = router;
