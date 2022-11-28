const express = require("express");
let router = express.Router();
const db = require("../db/book-queries");

//list of books
router.get("/", parseQueries, getBooks, sendBooks);
router.get("/:isbn", sendOneBook);

function parseQueries(req, res, next) {
    if(Object.keys(req.query).length
    ) res.params = true; //search params

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
    if(!res.params) { //no search params
        db.getPopular((err, result) => {
            if(err) console.error(err.stack);
            res.books = result;
            next();
        });
    }
    else { //get books according to search params
        db.getBooks(req.query, (err, result) => {
            if(err) console.error(err.stack);
            res.books = result;
            next();
        });
    }
}

function sendBooks(req, res) {
    res.status(200).render("book-results", {
        books: res.books,
        page: req.query.page
    });
}


//individual book
router.param("isbn" , (req, res, next, isbn) => {
    db.getSpecific(isbn, (err, result) => {
        if(err) console.error(err.stack);
        res.book = result;
        next();
    });
});

function sendOneBook(req, res) {
    res.status(200).render("book", {book: res.book});
}

module.exports = router;