const express = require('express');
const Query = require('../models/Query');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET queries
// Student: their own queries | Teacher: queries sent to them
router.get('/', auth, async (req, res) => {
  try {
    let queries;
    if (req.user.role === 'student') {
      queries = await Query.find({ student: req.user.id })
        .populate('teacher', 'name subject')
        .sort({ createdAt: -1 });
    } else {
      queries = await Query.find({ teacher: req.user.id })
        .populate('student', 'name')
        .sort({ createdAt: -1 });
    }
    res.json(queries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST create a new query (student only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can submit queries' });
    }
    const { teacherId, subject, message } = req.body;
    if (!teacherId || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ msg: 'Teacher, subject and message are required' });
    }
    const student = await User.findById(req.user.id).select('name');
    const query = new Query({
      student: req.user.id,
      teacher: teacherId,
      subject,
      replies: [{ senderRole: 'student', senderName: student.name, message }],
    });
    await query.save();
    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST reply to a query (teacher or student)
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ msg: 'Message is required' });
    }
    const sender = await User.findById(req.user.id).select('name role');
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ msg: 'Query not found' });

    query.replies.push({ senderRole: sender.role, senderName: sender.name, message });
    await query.save();
    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT mark query as resolved
router.put('/:id/resolve', auth, async (req, res) => {
  try {
    const query = await Query.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    res.json(query);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
