const express = require('express');
const Performance = require('../models/Performance');
const Material = require('../models/Material');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/progress — student's performance breakdown per material
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Students only' });
    }

    const records = await Performance.find({ student: req.user.id });
    console.log(`[PROGRESS] student=${req.user.id} found=${records.length} records`);

    if (records.length === 0) {
      // Fallback: check if records exist with string comparison issue
      const allRecords = await Performance.find({}).limit(5).select('student materialId type');
      console.log('[PROGRESS] Sample records in DB:', JSON.stringify(allRecords));
      return res.json([]);
    }

    // Group by materialId
    const byMaterial = {};
    for (const r of records) {
      const key = r.materialId.toString();
      if (!byMaterial[key]) {
        byMaterial[key] = { quiz: { correct: 0, total: 0 }, flashcard: { correct: 0, total: 0 }, lastAttempt: r.timestamp };
      }
      byMaterial[key][r.type].total++;
      if (r.isCorrect) byMaterial[key][r.type].correct++;
      if (new Date(r.timestamp) > new Date(byMaterial[key].lastAttempt)) {
        byMaterial[key].lastAttempt = r.timestamp;
      }
    }

    const materialIds = Object.keys(byMaterial);
    const materials = await Material.find({ _id: { $in: materialIds } }).select('title');

    const result = materials.map(m => {
      const data = byMaterial[m._id.toString()];
      const quizScore = data.quiz.total > 0 ? Math.round((data.quiz.correct / data.quiz.total) * 100) : null;
      const flashcardScore = data.flashcard.total > 0 ? Math.round((data.flashcard.correct / data.flashcard.total) * 100) : null;
      return {
        materialId: m._id,
        title: m.title,
        quiz: { ...data.quiz, score: quizScore },
        flashcard: { ...data.flashcard, score: flashcardScore },
        lastAttempt: data.lastAttempt,
      };
    });

    // Sort by last attempt (most recent first)
    result.sort((a, b) => new Date(b.lastAttempt) - new Date(a.lastAttempt));

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
