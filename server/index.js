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
const progressRoutes = require('./routes/progress');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/progress', progressRoutes);

// Database connection
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_db';

mongoose.connect(DB_URI).catch((err) => console.log('MongoDB connection error:', err));

// Only start HTTP listener locally
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  mongoose.connection.once('open', () => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;
