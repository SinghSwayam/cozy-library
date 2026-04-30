const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book_id: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, { timestamps: true });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
