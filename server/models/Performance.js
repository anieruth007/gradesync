const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  },
  type: {
    type: String,
    enum: ['flashcard', 'quiz'],
    required: true,
  },
  concept: {
    type: String, // The concept or topic being tested
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Performance', performanceSchema);
