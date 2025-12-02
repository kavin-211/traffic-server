const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // Allow local dev frontend plus deployed frontend
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://traffic-client.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Allow CORS for API routes (permits dev localhost and deployed frontend)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://traffic-client.vercel.app'
    ];
    if (allowed.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/traffic-system';
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('Continuing without MongoDB — server will still start for frontend development.');
  }
};

connectDB();

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Root route to handle GET /
app.get('/', (req, res) => {
  res.send('Traffic Server is running!');
});

// Socket.io Logic
const { handleSocketConnection } = require('./utils/socketHandler');
handleSocketConnection(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
