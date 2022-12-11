const express = require("express");
let router = express.Router();
const db = require("../db/book-queries");
const publisher = require("../db/publisher-queries");

//list of books
router.get("/", parseQueries, getBooks, sendBooks);
router.post("/", parseInput, checkIsbn, checkPub, createBook, createGenre, createAuthored);
router.delete("/", removeBook);
router.put("/", restoreBook);
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
        db.getPopular(req.query.page, (err, result) => {
            if(err) {
                console.error(err.stack);
                req.app.locals.sendError(req, res, 500, "Error retrieving books");
                return;
            }
            res.books = result;
            next();
        });
    }
    else { //get books according to search params
        db.getBooks(req.query, (err, result) => {
            if(err) {
                console.error(err.stack);
                req.app.locals.sendError(req, res, 500, "Error retrieving books");
                return;
            }
            res.books = result;
            next();
        });
    }
}

function sendBooks(req, res) {
    res.status(200).render("book-results", {
        session: req.session,
        books: res.books,
        params: req.query,
        page: req.query.page
    });
}


//format new book request
function parseInput(req, res, next) {
    req.authors = req.body.authors.replace("'", "''"); //escape
    req.authors = req.authors.split(", ");

    req.genres = req.body.genres.replace("'", "''"); //escape
    req.genres = req.genres.split(", ");

    req.body.publisher = req.body.publisher.replace("'", "''"); //escape

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

//make sure isbn for new book does not already exist
function checkIsbn(req, res, next) {
    db.checkBook(req.body.isbn, (err, exists) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error retrieving book data");
            return;
        }
        if(exists == 0) next();
        else {
            req.app.locals.sendError(req, res, 400, "Book with isbn " + req.body.isbn + " already exists");
            return;
        }
    });
}

//make sure publisher for new book exists
function checkPub(req, res, next) {
    publisher.checkPub(req.body.publisher, (err, exists) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error retrieving publisher data");
            return;
        }
        if(exists == 1) next();
        else {
            req.app.locals.sendError(req, res, 400, "Publisher for new book does not exist");
            return;
        }
    });
}

function createBook(req, res, next) {
    db.addBook(req.bookData, (err, isbn) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error adding book");
            return;
        }
        res.book = isbn;
        next();
    });
}

function createGenre(req, res, next) {
    db.addGenres(res.book, req.genres, (err) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error creating genre");
            return;
        }
        next();
    });
}

function createAuthored(req, res) {
    db.addAuthors(res.book, req.authors, (err) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error creating author");
            return;
        }

        res.statusCode = 204;
        res.redirect("/books/" + res.book);
        return;
    });
}


//remove a book from the store
function removeBook(req, res) {
    db.checkBook(req.body.isbn, (err, exists) => {
        if(err) console.error(err.stack);
        if(exists == 1) {
            db.removeBook(req.body.isbn, (err) => {
                if(err) {
                    console.error(err.stack);
                    req.app.locals.sendError(req, res, 500, "Error. Could not remove book");
                    return;
                }
                req.app.locals.sendSuccess(req, res, 204, "Book successfully removed from store");
                return;
            })
        }
        else {
            req.app.locals.sendError(req, res, 400, "Book with isbn " + req.body.isbn + " does not exist");
            return;
        }
    });
}

function restoreBook(req, res) {
    db.checkBook(req.body.isbn, (err, exists) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error retrieving book data");
            return;
        }
        if(exists == 1) { //isbn valid
            db.restoreBook(req.body.isbn, (err) => {
                if(err) {
                    console.error(err.stack);
                    req.app.locals.sendError(req, res, 500, "Error. Could not restore book");
                    return;
                }
                req.app.locals.sendSuccess(req, res, 204, "Book successfully restored to store");
                return;
            })
        }
        else {
            req.app.locals.sendError(req, res, 400, "Error. Book with isbn " + req.body.isbn + " does not exist");
            return;
        }
    });
}


//individual book
router.param("isbn" , (req, res, next, isbn) => {
    db.getSpecific(isbn, (err, result) => {
        if(err)  {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error retrieving book");
            return;
        }
        if(!result) {
            req.app.locals.sendError(req, res, 404, "Book with isbn " + isbn + " does not exist");
            return;
        }
        res.book = result;
        next();
    });
});

function sendOneBook(req, res) {
    res.status(200).render("book", {
        session: req.session,
        book: res.book
    });
}

module.exports = router;