const express = require('express');
const Performance = require('../models/Performance');
const Material = require('../models/Material');
const User = require('../models/User');
const { generateTeacherInsights } = require('../utils/ai');
const auth = require('../middleware/auth');

const router = express.Router();

// Get AI Analysis for a Teacher's Materials
router.get('/:materialId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Only teachers can view insights' });
    }

    const materialId = req.params.materialId;
    
    // Fetch all student performance data for this material
    const performances = await Performance.find({ materialId });
    
    if (performances.length === 0) {
      return res.json({ insights: [], message: 'Not enough data yet' });
    }

    // AI Analysis
    const insights = await generateTeacherInsights(performances);

    res.json({ insights });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get Aggregate Stats for Teacher Dashboard
router.get('/stats/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const materialCount = await Material.countDocuments({ teacher: req.user.id });

    const teacher = await User.findById(req.user.id).select('enrolledTeachers');
    const enrolledStudentCount = teacher.enrolledTeachers.length;

    const materials = await Material.find({ teacher: req.user.id }).select('_id');
    const materialIds = materials.map(m => m._id);
    const totalAttempts = await Performance.countDocuments({ materialId: { $in: materialIds } });

    res.json({
      materialCount,
      studentCount: enrolledStudentCount,
      totalAttempts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
