const mongoose = require('mongoose');

const conceptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a concept title'],
    trim: true,
    maxlength: [50, 'Title cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'Database', 'General'],
    default: 'General'
  },
  points: {
    type: Number,
    default: 0.1
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Concept', conceptSchema);
