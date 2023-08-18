import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const bookSchema = new Schema({
    id: Number,
    "author": String,
    "title": String,
    "reviews": {}
});

const Book = mongoose.model('book', bookSchema);

export default Book;