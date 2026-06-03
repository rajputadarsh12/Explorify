import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import userRoutes from './routes/userRoutes.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  socket.on('join-trip', (tripId) => {
    socket.join(tripId);
  });

  socket.on('edit-trip', ({ tripId, data }) => {
    socket.to(tripId).emit('trip-updated', data);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads statically
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Explorify API is running...');
  });
}

// Demo account seed
const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL || 'rajputadarsh12@gmail.com';
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Adarsh1234';
const DEMO_USER_NAME = process.env.DEMO_USER_NAME || 'Demo User';

const createDemoUser = async () => {
  try {
    const existingDemoUser = await User.findOne({ email: DEMO_USER_EMAIL });
    if (!existingDemoUser) {
      await User.create({
        name: DEMO_USER_NAME,
        email: DEMO_USER_EMAIL,
        password: DEMO_USER_PASSWORD,
      });
      console.log(`Demo user created: ${DEMO_USER_EMAIL}`);
    } else {
      console.log(`Demo user already exists: ${DEMO_USER_EMAIL}`);
    }
  } catch (error) {
    console.log('Error creating demo user:', error);
  }
};

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await createDemoUser();
  })
  .catch((err) => console.log('MongoDB Connection Error: ', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
