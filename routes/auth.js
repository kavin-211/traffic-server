const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Login
router.post('/login', async (req, res) => {
  const { userId, password } = req.body;

  try {
    // Check for hardcoded admin
    if (userId === '1234' && password === '1234') {
       return res.json({
        token: jwt.sign({ userId: '1234', role: 'admin' }, JWT_SECRET),
        user: { userId: '1234', role: 'admin', name: 'Admin' }
      });
    }

    const user = await User.findOne({ userId });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, user });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
