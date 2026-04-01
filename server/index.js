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

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_db';

// Ensure DB is connected before every request (handles serverless cold starts)
let dbConnected = false;
app.use(async (req, res, next) => {
  if (dbConnected) return next();
  try {
    await mongoose.connect(DB_URI);
    dbConnected = true;
    next();
  } catch (err) {
    console.error('DB connect error:', err.message);
    return res.status(500).json({ msg: 'Database unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/progress', progressRoutes);

// Local development only
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  mongoose.connect(DB_URI)
    .then(() => {
      console.log('MongoDB connected successfully');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.log('MongoDB connection error:', err));
}

module.exports = app;
