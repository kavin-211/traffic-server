const mongoose = require('mongoose');

const SignalSchema = new mongoose.Schema({
  signalId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  district: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  gateways: { type: Number, required: true },
  runwayTime: { type: Number, default: 60 }, // Seconds per gateway
  radius: { type: Number, default: 500 }, // Meters
});

module.exports = mongoose.model('Signal', SignalSchema);
