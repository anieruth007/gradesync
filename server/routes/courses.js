const express = require('express');
const User = require('../models/User');
const Material = require('../models/Material');
const Performance = require('../models/Performance');
const auth = require('../middleware/auth');

const router = express.Router();

// GET all courses (all teachers) with enrollment status for current student
router.get('/', auth, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('name subject createdAt enrolledTeachers');
    const courses = teachers.map(t => ({
      _id: t._id,
      teacherName: t.name,
      subject: t.subject || t.name,
      enrolledCount: t.enrolledTeachers.length,
      isEnrolled: req.user.role === 'student'
        ? t.enrolledTeachers.map(id => id.toString()).includes(req.user.id)
        : false,
    }));
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST enroll in a course (student enrolls with a teacher)
router.post('/enroll/:teacherId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can enroll' });
    }
    const teacher = await User.findById(req.params.teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ msg: 'Course not found' });
    }

    const { enrollmentKey } = req.body;
    if (!enrollmentKey || enrollmentKey.trim().toUpperCase() !== teacher.enrollmentKey) {
      return res.status(400).json({ msg: 'Invalid enrollment key. Please check with your teacher.' });
    }

    // Add student to teacher's enrolledTeachers list
    if (!teacher.enrolledTeachers.map(id => id.toString()).includes(req.user.id)) {
      teacher.enrolledTeachers.push(req.user.id);
      await teacher.save();
    }

    // Add teacher to student's enrolledTeachers list
    const student = await User.findById(req.user.id);
    if (!student.enrolledTeachers.map(id => id.toString()).includes(req.params.teacherId)) {
      student.enrolledTeachers.push(req.params.teacherId);
      await student.save();
    }

    res.json({ msg: 'Enrolled successfully', enrolledTeachers: student.enrolledTeachers });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST unenroll from a course
router.post('/unenroll/:teacherId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can unenroll' });
    }

    // Remove student from teacher's list
    await User.findByIdAndUpdate(req.params.teacherId, {
      $pull: { enrolledTeachers: req.user.id }
    });

    // Remove teacher from student's list
    const student = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { enrolledTeachers: req.params.teacherId } },
      { new: true }
    );

    res.json({ msg: 'Unenrolled successfully', enrolledTeachers: student.enrolledTeachers });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET student dashboard stats
router.get('/stats/student', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    const student = await User.findById(req.user.id).select('enrolledTeachers');
    const enrolledCount = student.enrolledTeachers.length;

    const materials = await Material.find({ teacher: { $in: student.enrolledTeachers } }).select('_id flashcards');
    const totalFlashcards = materials.reduce((sum, m) => sum + (m.flashcards?.length || 0), 0);

    const testsTaken = await Performance.countDocuments({ student: req.user.id, type: 'quiz' });

    res.json({ enrolledCount, totalFlashcards, testsTaken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST regenerate enrollment key (teacher only)
router.post('/regenerate-key', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Only teachers can regenerate keys' });
    }
    const newKey = Math.random().toString(36).substring(2, 8).toUpperCase();
    await User.findByIdAndUpdate(req.user.id, { enrollmentKey: newKey });
    res.json({ enrollmentKey: newKey });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT update teacher's subject/course name
router.put('/my-subject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Only teachers can update course name' });
    }
    const { subject } = req.body;
    if (!subject || !subject.trim()) {
      return res.status(400).json({ msg: 'Subject name cannot be empty' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { subject: subject.trim() },
      { new: true }
    ).select('name subject');
    res.json({ subject: user.subject });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
