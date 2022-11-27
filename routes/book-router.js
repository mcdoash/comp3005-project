const express = require("express");
let router = express.Router();
const db = require("../db/book-queries");

//list of books
router.get("/", getBooks, sendBooks);

//query params

function getBooks(req, res, next) {
    req.query = [5]; //test
    db.getBooks(req.query, (err, result) => {
        if(err) console.error(err.stack);
        res.books = result;
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