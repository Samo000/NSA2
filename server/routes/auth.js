const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || 'user',
      firstName: user.firstName,
      lastName: user.lastName
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function toAuthPayload(user) {
  return {
    token: signToken(user),
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      birthDate: user.birthDate,
      role: user.role || 'user'
    }
  };
}

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, birthDate } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !birthDate) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: 'User already exists' });

    const hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      password: hash,
      birthDate,
      role: 'user'
    });

    const payload = toAuthPayload(user);
    res.cookie('token', payload.token, { httpOnly: true, sameSite: 'lax' });

    return res.status(201).json(payload);
  } catch {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(String(password), String(user.password || ''));
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = toAuthPayload(user);
    res.cookie('token', payload.token, { httpOnly: true, sameSite: 'lax' });

    return res.json(payload);
  } catch {
    return res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/logout', (_req, res) => {
  res.cookie('token', '', { maxAge: 0 });
  res.json({ message: 'Logged out' });
});

module.exports = router;
