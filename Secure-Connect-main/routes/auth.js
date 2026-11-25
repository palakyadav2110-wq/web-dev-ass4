const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const events = require('../events/emitter');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'username, email and password are required' });

    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    // Only allow admin if explicitly requested (fine for a lab; lock down in production)
    const user = await User.create({
      username, email, password: hashed, role: role === 'admin' ? 'admin' : 'user',
    });

    events.emit('user:signup', user);
    res.status(201).json({
      message: 'User registered', id: user._id, username: user.username, email: user.email,
    });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 60 * 60 * 1000 });
    events.emit('user:login', user);
    res.status(200).json({ message: 'Login successful', token });
  } catch (e) { next(e); }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// Protected route
router.get('/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// RBAC: admin only
router.get('/users', authenticate, requireRole('admin'), async (req, res) => {
  res.json(await User.find().select('-password'));
});

module.exports = router;
