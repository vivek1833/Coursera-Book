import express from "express";
import mongoose from "mongoose";
import env from "dotenv";
import Book from "./models/book.js";
import User from "./models/user.js";

const app = express();
env.config();

// Connect to MongoDB
const conn = process.env.DataBase;
mongoose.set("strictQuery", false); // not show warning

mongoose
  .connect(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => console.log(err.message));

app.use(express.json());

app.get("/", (req, res) => {
  res.json("BackEnd Working");
});

// Retrieve a list of all books available in the bookshop
app.get("/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

// Search for specific books and retrieve their details based on the book’s ISBN code, author names and titles
app.get("/books/search", async (req, res) => {
  const { isbn, author, title } = req.body;
  const books = await Book.find({
    $or: [{ isbn: isbn }, { author: author }, { title: title }],
  });
  res.json(books);
});

// Retrieve reviews/comments for specified books
app.get("/books/:id/reviews", async (req, res) => {
  const id = req.params.id;
  const book = await Book.findOne({ isbn: id });

  if (book) {
    res.json(book.reviews);
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

// Register as a new user of the application
app.post("/users", async (req, res) => {
  const { username, password } = req.body;
  const newUser = new User({
    username: username,
    password: password,
  });
  await newUser.save();
  res.json(newUser);
});

// Login to the application
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    if (user.password === password) {
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
  const book = await Book.findOne({ isbn: id });
  if (book) {
    const review = req.body.review;
    const username = req.body.username;
    const currUser = await User.findOne({ username });
    if (!currUser) {
      res.status(403).json({ error: "No user found" });
    } else {
      book.reviews.push({
        username,
        text: review,
      });
      await book.save();
      res.json(book);
    }
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

// Modify a book review (logged in users can modify only their own reviews)
app.put("/books/:id/reviews/update", async (req, res) => {
  const id = req.params.id;
  const book = await Book.findOne({ isbn: id });
  if (book) {
    const username = req.body.reviewId;
    const currreview = book.reviews.find(
      (review) => review.username === username
    );

    if (currreview) {
      currreview = req.body.review;
      await book.save();
      res.json(book);
    } else {
      res.status(404).json({ error: "Review not found" });
    }
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

// Delete a book review (logged in users can delete only their own reviews)
app.delete("/books/:id/reviews/delete", async (req, res) => {
  const id = req.params.id;
  const book = await Book.findOne({ isbn: id });
  if (book) {
    const username = req.body.username;
    const currreview = book.reviews.find(
      (review) => review.username == username
    );

    if (currreview) {
      book.reviews = book.reviews.find((review) => review.username != username);
      res.json(book);
    } else {
      res.status(404).json({ error: "Review not found" });
    }
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
