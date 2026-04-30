const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/users/collection
// @desc    Add a book to the user's collection (favorites)
// @access  Private
router.post('/collection', protect, async (req, res) => {
  try {
    const book_id = Number(req.body.book_id);

    if (!book_id) {
      return res.status(400).json({ message: 'book_id is required' });
    }

    const user = await User.findById(req.user._id);

    // Ensure no duplicates — compare as Numbers
    if (!user.favorites.includes(book_id)) {
      user.favorites.push(book_id);
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      favorites: user.favorites,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/collection/:book_id
// @desc    Remove a book from the user's collection
// @access  Private
router.delete('/collection/:book_id', protect, async (req, res) => {
  try {
    const book_id = Number(req.params.book_id);
    const user = await User.findById(req.user._id);

    user.favorites = user.favorites.filter((id) => id !== book_id);
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      favorites: user.favorites,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/collection
// @desc    Get the user's collection (full book objects)
// @access  Private
router.get('/collection', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Fetch the actual book documents based on the book_ids in favorites
    const books = await Book.find({ book_id: { $in: user.favorites } });

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
