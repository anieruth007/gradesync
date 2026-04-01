const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const materialRoutes = require('./routes/materials');
const attemptRoutes = require('./routes/attempts');
const insightRoutes = require('./routes/insights');
const courseRoutes = require('./routes/courses');
const announcementRoutes = require('./routes/announcements');
const queryRoutes = require('./routes/queries');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Ensure MongoDB is connected before handling any request (critical for serverless cold starts)
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_db';

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // already connected
  await mongoose.connect(DB_URI);
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(500).json({ msg: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/queries', queryRoutes);

// Start HTTP server only when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      console.log('MongoDB connected successfully');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.log('MongoDB connection error:', err));
}

module.exports = app;
