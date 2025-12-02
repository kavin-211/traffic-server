const express = require('express');
const router = express.Router();
const Signal = require('../models/Signal');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// --- Signals ---

// Get all signals
router.get('/signals', async (req, res) => {
  try {
    const signals = await Signal.find();
    res.json(signals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add signal
router.post('/signals', async (req, res) => {
  try {
    const newSignal = new Signal(req.body);
    await newSignal.save();
    res.status(201).json(newSignal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update signal
router.put('/signals/:id', async (req, res) => {
  try {
    const updatedSignal = await Signal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSignal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete signal
router.delete('/signals/:id', async (req, res) => {
  try {
    await Signal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Signal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Drivers ---

// Get all drivers
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add driver
router.post('/drivers', async (req, res) => {
  try {
    const { userId, password, name, email, phone, vehicleNumber } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newDriver = new User({
      userId,
      password: hashedPassword,
      role: 'driver',
      name,
      email,
      phone,
      vehicleNumber
    });
    
    await newDriver.save();
    res.status(201).json(newDriver);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update driver
router.put('/drivers/:id', async (req, res) => {
  try {
     // If password is being updated, hash it
    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const updatedDriver = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDriver);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete driver
router.delete('/drivers/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
