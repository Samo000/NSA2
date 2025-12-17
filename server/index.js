require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URL) throw new Error('Missing MONGO_URL in server/.env');
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET in server/.env');

mongoose
  .connect(MONGO_URL, { autoIndex: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
    lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 120 },
    passwordHash: { type: String, required: true },
    birthDate: { type: Date, required: true }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const firstName = String(req.body.firstName || '').trim();
    const lastName = String(req.body.lastName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const confirmPassword = String(req.body.confirmPassword || '');
    const birthDateRaw = String(req.body.birthDate || '').trim();

    if (!firstName || !lastName || !email || !password || !confirmPassword || !birthDateRaw) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const birthDate = new Date(birthDateRaw);
    if (Number.isNaN(birthDate.getTime())) return res.status(400).json({ message: 'Invalid birthDate' });

    const exists = await User.findOne({ email }).lean();
    if (exists) return res.status(409).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      birthDate
    });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, firstName: user.firstName, lastName: user.lastName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: { id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Invalid email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, firstName: user.firstName, lastName: user.lastName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email }
    });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/me', auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select('firstName lastName email birthDate createdAt').lean();
  if (!user) return res.status(404).json({ message: 'Not found' });
  return res.json({ user: { ...user, id: user._id.toString() } });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
