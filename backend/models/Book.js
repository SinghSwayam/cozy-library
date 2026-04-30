const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  book_id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  authors: {
    type: String,
    required: true
  },
  average_rating: {
    type: Number
  },
  image_url: {
    type: String
  }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
