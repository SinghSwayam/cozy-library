require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Book = require('./models/Book');

const csvFilePath = path.join(__dirname, '../ml-service/data/books.csv');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully for seeding');
    seedData();
  })
  .catch(err => console.error('MongoDB connection error:', err));

const seedData = async () => {
  try {
    // Optional: Clear existing books before seeding
    await Book.deleteMany({});
    console.log('Cleared existing books');

    const results = [];
    let count = 0;

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        if (count < 1000) {
          results.push({
            book_id: Number(data.book_id),
            title: data.original_title || data.title,
            authors: data.authors,
            average_rating: Number(data.average_rating) || 0,
            image_url: data.image_url
          });
          count++;
        }
      })
      .on('end', async () => {
        console.log(`Parsed ${results.length} books from CSV.`);
        try {
          await Book.insertMany(results);
          console.log('Successfully seeded 1000 books to MongoDB.');
        } catch (err) {
          console.error('Error inserting books:', err);
        } finally {
          mongoose.connection.close();
        }
      });
  } catch (error) {
    console.error('Error during seeding process:', error);
    mongoose.connection.close();
  }
};
