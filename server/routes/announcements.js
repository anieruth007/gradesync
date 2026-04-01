const express = require('express');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET announcements
// Teacher: their own | Student: from enrolled teachers
router.get('/', auth, async (req, res) => {
  try {
    let announcements;
    if (req.user.role === 'teacher') {
      announcements = await Announcement.find({ teacher: req.user.id }).sort({ createdAt: -1 });
    } else {
      const student = await User.findById(req.user.id).select('enrolledTeachers');
      announcements = await Announcement.find({ teacher: { $in: student.enrolledTeachers } })
        .populate('teacher', 'name subject')
        .sort({ createdAt: -1 });
    }
    res.json(announcements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST create announcement (teacher only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Only teachers can post announcements' });
    }
    const { title, content } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ msg: 'Title and content are required' });
    }
    const announcement = new Announcement({ teacher: req.user.id, title, content });
    await announcement.save();
    res.json(announcement);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE announcement (teacher only, own announcements)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Only teachers can delete announcements' });
    }
    await Announcement.findOneAndDelete({ _id: req.params.id, teacher: req.user.id });
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
