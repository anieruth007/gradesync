const express = require('express');
const multer = require('multer');
const pdfModule = require('pdf-parse');
const pdf = pdfModule.default || pdfModule;
const path = require('path');
const mammoth = require('mammoth');
const Material = require('../models/Material');
const {
  generateSummary,
  generateNotes,
  generateFlashcards,
  generateQuiz
} = require('../utils/ai');
const auth = require('../middleware/auth');

const router = express.Router();

// Multer Storage Configuration (memory storage for serverless/Vercel compatibility)
const upload = multer({ storage: multer.memoryStorage() });

// Upload Material (Teacher only)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  console.log(`[UPLOAD] Starting process for title: "${req.body.title}"`);
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Only teachers can upload materials' });
    }

    const { title } = req.body;
    const fileBuffer = req.file.buffer;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    // ── Extract text from PDF or plain text file ──────────────────
    let extractedText = '';

    if (fileExt === '.pdf') {
      console.log('[UPLOAD] Parsing PDF from memory buffer, size:', fileBuffer.length);
      const pdfData = await pdf(fileBuffer);
      extractedText = pdfData.text;
      console.log('[UPLOAD] Extracted text length:', extractedText.length);

    } else if (fileExt === '.txt') {
      extractedText = fileBuffer.toString('utf8');
      console.log('[UPLOAD] Read text file, length:', extractedText.length);

    } else if (fileExt === '.docx') {
      console.log('[UPLOAD] Parsing DOCX from memory buffer');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
      console.log('[UPLOAD] Extracted DOCX text length:', extractedText.length);

    } else {
      return res.status(400).json({ msg: 'Only PDF, DOCX, or TXT files are supported' });
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(400).json({ 
        msg: 'Could not extract text from file. Make sure the PDF is not scanned/image-only.' 
      });
    }

    // ── Call Gemini AI in parallel ────────────────────────────────
    console.log('[UPLOAD] Calling Gemini AI...');

    const [summary, notes, flashcards, quiz] = await Promise.allSettled([
      generateSummary(extractedText),
      generateNotes(extractedText),
      generateFlashcards(extractedText),
      generateQuiz(extractedText)
    ]);

    // Use result if fulfilled, fallback to empty if failed
    const getValue = (result, fallback) =>
      result.status === 'fulfilled' ? result.value : fallback;

    // ── Save to MongoDB ───────────────────────────────────────────
    const material = new Material({
      title,
      teacher: req.user.id,
      filename: req.file.originalname,
      content: extractedText,
      summary: getValue(summary, 'Summary unavailable.'),
      notes: getValue(notes, []),
      flashcards: getValue(flashcards, []),
      quiz: getValue(quiz, [])
    });

    await material.save();
    console.log('[UPLOAD] Material saved successfully:', material._id);

    res.json(material);

  } catch (err) {
    console.error('[UPLOAD ERROR]', err.message);
    console.error(err.stack);
    fs.appendFileSync(path.join(__dirname, '../upload_error.log'), `${new Date().toISOString()} ERROR: ${err.message}\n${err.stack}\n---\n`);
    res.status(500).json({ msg: 'Failed to process material', error: err.message });
  }
});

// Get All Materials (filtered by enrollment for students)
router.get('/', auth, async (req, res) => {
  try {
    let materials;
    if (req.user.role === 'teacher') {
      materials = await Material.find({ teacher: req.user.id }).select('-content').populate('teacher', 'name subject');
    } else {
      const User = require('../models/User');
      const student = await User.findById(req.user.id).select('enrolledTeachers');
      materials = await Material.find({ teacher: { $in: student.enrolledTeachers } }).select('-content').populate('teacher', 'name subject');
    }
    res.json(materials);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get Single Material by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ msg: 'Material not found' });
    }
    res.json(material);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete Material (Teacher only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ msg: 'Only teachers can delete materials' });
    }
    await Material.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Material deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
