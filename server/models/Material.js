const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  content: {
    type: String, // Extracted text content
  },
  summary: {
    type: String,
  },
  notes: {
    type: [String], // Key bullet points
  },
  flashcards: [{
    front: String,
    back: String,
    concept: String,
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: String,
    concept: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Material', materialSchema);
