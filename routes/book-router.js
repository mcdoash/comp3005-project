const express = require("express");
let router = express.Router();
const db = require("../db/book-queries");

//list of books
router.get("/", parseQueries, getBooks, sendBooks);

function parseQueries(req, res, next) {
    //check valid page number
    if(!req.query.page || req.query.page < 1)  {
            req.query.page = 1;
    }
    try {
        req.query.page = Number(req.query.page);
    } catch { req.query.page = 1 };

    next();
}

function getBooks(req, res, next) {
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