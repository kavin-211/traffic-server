const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'driver'], required: true },
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  vehicleNumber: { type: String }, // Only for drivers
});

module.exports = mongoose.model('User', UserSchema);
