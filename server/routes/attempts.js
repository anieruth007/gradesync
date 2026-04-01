const express = require('express');
const Performance = require('../models/Performance');
const auth = require('../middleware/auth');

const router = express.Router();

// Record a single attempt (Flashcard or Quiz question)
router.post('/record', auth, async (req, res) => {
  try {
    const { materialId, type, concept, isCorrect } = req.body;
    
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can record performance' });
    }

    const newPerformance = new Performance({
      student: req.user.id,
      materialId,
      type,
      concept,
      isCorrect,
    });

    await newPerformance.save();
    res.json(newPerformance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get Student's Own Performance for a Material
router.get('/my-stats/:materialId', auth, async (req, res) => {
  try {
    const stats = await Performance.find({ 
      student: req.user.id, 
      materialId: req.params.materialId 
    });
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
