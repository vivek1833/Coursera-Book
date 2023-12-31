import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const bookSchema = new Schema({
    "isbn": Number,
    "author": String,
    "title": String,
    "reviews": [
        {
            "username": String,
            "text": String
        }
    ]
});

const Book = mongoose.model('book', bookSchema);

export default Book;
