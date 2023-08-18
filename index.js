import express from "express"
import mongoose from "mongoose"
import env from "dotenv"
import Book from "./models/book.js"
import User from "./models/user.js"

const app = express();
env.config();

// Connect to MongoDB
const conn = process.env.DataBase;
mongoose.set('strictQuery', false); // not show warning

mongoose.connect(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Database Connected");
}).catch((err) => console.log(err.message));

app.use(express.json());

// Retrieve a list of all books available in the bookshop
app.get("/books", async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

// Search for specific books and retrieve their details based on the book’s ISBN code, author names and titles
app.get("/books/search", async (req, res) => {
    const { isbn, author, title } = req.query;
    const books = await Book.find({
        $or: [
            { id: isbn },
            { author: author },
            { title: title }
        ]
    });
    res.json(books);
});

// Retrieve reviews/comments for specified books
app.get("/books/:id/reviews", async (req, res) => {
    const id = req.params.id;
    const book = await Book.find(book => book.id == id);
    if (book) {
        res.json(book.reviews);
    } else {
        res.status(404).json({ error: "Book not found" });
    }
});

// Register as a new user of the application
app.post("/users", async (req, res) => {
    const user = req.body;
    const newUser = await User.create(user);
    res.json(newUser);
});

// Login to the application
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.find(user => user.username == username);
    if (user) {
        if (user.password == password) {
            res.json(user);
        } else {
            res.status(401).json({ error: "Wrong password" });
        }
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

// Add a new review for a book (logged in users only)
app.post("/books/:id/reviews", async (req, res) => {
    const id = req.params.id;
    const book = await Book.find(book => book.id == id);
    if (book) {
        const review = req.body;
        book.reviews.push(review);
        res.json(review);
    } else {
        res.status(404).json({ error: "Book not found" });
    }
});

// Modify a book review (logged in users can modify only their own reviews)
app.put("/books/:id/reviews/:reviewId", async (req, res) => {
    const id = req.params.id;
    const reviewId = req.params.reviewId;
    const book = await Book.find(book => book.id == id);
    if (book) {
        const review = book.reviews.find(review => review.id == reviewId);
        if (review) {
            const newReview = req.body;
            book.reviews = book.reviews.map(review => review.id == reviewId ? newReview : review);
            res.json(newReview);
        } else {
            res.status(404).json({ error: "Review not found" });
        }
    } else {
        res.status(404).json({ error: "Book not found" });
    }
});

// Delete a book review (logged in users can delete only their own reviews)
app.delete("/books/:id/reviews/:reviewId", async (req, res) => {
    const id = req.params.id;
    const reviewId = req.params.reviewId;
    const book = await Book.find(book => book.id == id);
    if (book) {
        const review = book.reviews.find(review => review.id == reviewId);
        if (review) {
            book.reviews = book.reviews.filter(review => review.id != reviewId);
            res.json({ message: "Review deleted" });
        } else {
            res.status(404).json({ error: "Review not found" });
        }
    } else {
        res.status(404).json({ error: "Book not found" });
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000")
});