const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  replies: [
    {
      senderRole: { type: String, enum: ['student', 'teacher'] },
      senderName: { type: String },
      message: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Query', querySchema);
