const express = require("express");
let router = express.Router();
const db = require('../db');

//list of books
router.get("/", getBooks, sendBooks);

//query params

function getBooks(req, res, next) {
    const query = "SELECT Book.ISBN, Book.Title, Book.Cover, ARRAY_AGG(Authored.Author) Authors FROM Book JOIN Genre ON Book.ISBN = Genre.Book JOIN Authored ON Book.ISBN = Authored.Book WHERE Genre.Name = 'Fantasy' GROUP BY Book.ISBN, Book.Title, Book.Cover LIMIT $1"; //test
    const vals = [5];
    
    db.query(query, vals, (err, result) => {
        if(err) console.error(err.stack);
        res.books = result.rows;
        next();
    });
}

function sendBooks(req, res) {
    res.status(200).render("book-results", {books: res.books});
}


//individual book - old
router.get("/:isbn", (req, res) => {
    res.status(200).render("book", {book: books[0]});
});

module.exports = router;