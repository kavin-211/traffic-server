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
    origin: "*", // Allow all origins for now, restrict in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to Local MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/traffic-system', {
      serverSelectionTimeoutMS: 2000 // Fail fast if not found
    });
    console.log('MongoDB Connected (Local)');
  } catch (err) {
    console.log('Local MongoDB failed (likely not running). Starting In-Memory Database...');
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log('In-Memory DB URI:', uri);
      
      await mongoose.connect(uri, {
        dbName: 'traffic-system'
      });
      console.log('MongoDB Connected (In-Memory)');
      
      // Seed Admin User if using in-memory DB
      // We can just rely on the hardcoded check in auth.js for now
      
    } catch (err2) {
      console.error('CRITICAL: Failed to connect to In-Memory MongoDB:', err2);
    }
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
