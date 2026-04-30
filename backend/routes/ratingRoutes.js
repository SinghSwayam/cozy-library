const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/ratings
// @desc    Create or update a rating for a book
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const book_id = Number(req.body.book_id);
    const score = Number(req.body.score);

    if (!book_id || !score) {
      return res.status(400).json({ message: 'book_id and score are required' });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Score must be between 1 and 5' });
    }

    // Check if a rating already exists for this user and book
    let rating = await Rating.findOne({ user_id: req.user._id, book_id });

    if (rating) {
      // Update existing rating
      rating.score = score;
      await rating.save();
    } else {
      // Create new rating
      rating = await Rating.create({
        user_id: req.user._id,
        book_id,
        score
      });
    }

    res.status(201).json(rating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ratings
// @desc    Get all ratings for the logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const ratings = await Rating.find({ user_id: req.user._id });
    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ratings/:book_id
// @desc    Get the logged-in user's rating for a specific book
// @access  Private
router.get('/:book_id', protect, async (req, res) => {
  try {
    const rating = await Rating.findOne({
      user_id: req.user._id,
      book_id: Number(req.params.book_id),
    });
    if (!rating) {
      return res.json({ score: 0 });
    }
    res.json(rating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
