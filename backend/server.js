require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const Book = require('./models/Book');

const app = express();
const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ratings', ratingRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Book Recommendation Backend is running.');
});

// 1. GET /api/books - Fetch a list of books with optional title search, limited to 50
app.get('/api/books', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    const books = await Book.find(query).limit(50);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// 2. GET /api/books/:id - Fetch a single book by its book_id
app.get('/api/books/:id', async (req, res) => {
  try {
    const book_id = Number(req.params.id);
    const book = await Book.findOne({ book_id });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch book details' });
  }
});

// 3. GET /api/recommendations/:book_id - Proxy route to ML service
app.get('/api/recommendations/:book_id', async (req, res) => {
  try {
    const book_id = Number(req.params.book_id);

    // Call the Python FastAPI ML Service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/recommend`, {
      book_id: book_id,
      top_n: 5
    });

    // The ML service returns an array of BookResponse objects containing book_id
    const recommendedBooksFromML = mlResponse.data;
    const recommendedBookIds = recommendedBooksFromML.map(b => b.book_id);

    // Query our MongoDB to get full details for these recommended books
    // Using $in operator, but we also want to maintain the order returned by the ML model
    const books = await Book.find({ book_id: { $in: recommendedBookIds } });

    // Sort the results based on the ML service's returned order
    const sortedBooks = recommendedBookIds.map(id => books.find(b => b.book_id === id)).filter(Boolean);

    res.json(sortedBooks);
  } catch (err) {
    console.error('Error fetching recommendations:', err.message);
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: 'Book not found in ML model or no recommendations available.' });
    }
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
