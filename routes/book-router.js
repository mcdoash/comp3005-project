const express = require("express");
let router = express.Router();
const db = require("../db/book-queries");

//list of books
router.get("/", parseQueries, getBooks, sendBooks);
router.post("/", parseInput, createBook, createGenre, createAuthored);
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


//format new book request
function parseInput(req, res, next) {
    req.authors = req.body.authors.replace("'", "''"); //escape
    req.authors = req.authors.split(", ");

    req.genres = req.body.genres.replace("'", "''"); //escape
    req.genres = req.genres.split(", ");

    req.bookData = [ //format
        req.body.isbn,
        req.body.title,
        req.body.cover,
        req.body.publisher,
        req.body.blurb,
        parseInt(req.body.price),
        parseInt(req.body.page_num),
        req.body.format,
        req.body.release_date,
        //'DEFAULT'
        parseInt(req.body.stock),
        parseFloat(req.body.sale_percent)
    ];
    next();
}

function createBook(req, res, next) {
    db.addBook(req.bookData, (err, isbn) => {
        if(err) console.error(err.stack);
        res.book = isbn;
        next();
    });
}

function createGenre(req, res, next) {
    db.addGenres(res.book, req.genres, (err) => {
        if(err) console.error(err.stack);
        next();
    });
}

function createAuthored(req, res) {
    db.addAuthors(res.book, req.authors, (err) => {
        if(err) console.error(err.stack);

        res.statusCode = 204;
        res.redirect("/books/" + res.book);
        return;
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