const express = require("express");
let router = express.Router();
const db = require("../db/order-queries");
const bookDb = require("../db/book-queries");

router.get("/", checkLoggedIn, getAccountData, showCheckout);

function checkLoggedIn(req, res, next) {
    if(req.session.signedIn) next();
    else {
        req.app.locals.sendError(req, res, 401, "Must be logged in to access page");
        return;
    }
}

//check account data
function getAccountData(req, res, next) {
    db.getAccountData(req.session.user.email, (err, results) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error retrieving account data");
            return;
        }
        req.session.user.cards = results.cards;
        req.session.user.addresses = results.addresses;
        next();
    });
}

function showCheckout(req, res) {
    res.statusCode = 200;
    res.redirect("/checkout/address");
    return;
}


//set address stage
router.get("/address", checkLoggedIn, sendAddress);

function sendAddress(req, res) {
    res.status(200).render("checkout/address", {
        session: req.session
    });
}

router.post("/address", (req, res) => {
    req.session.cart.address = req.body.address;
    res.sendStatus(204);
    return;
});


//set card stage
router.get("/billing", checkLoggedIn, sendCard);

function sendCard(req, res) {
    if(!req.session.cart.address) { //must set address first
        res.statusCode = 401;
        res.redirect("/checkout");
        return;
    }
    res.status(200).render("checkout/billing", {
        session: req.session
    });
}

router.post("/billing", (req, res) => {
    req.session.cart.card = req.body.card;
    res.sendStatus(204);
    return;
});


router.get("/confirm", checkLoggedIn, getAccountData, confirmStock, showConfirm);

function confirmStock(req, res, next) {
    const bookList = req.session.cart.books.map((book) => book.isbn); //quantity
    if(!req.session.cart.errors) {
        req.session.cart.errors = [];
    }

    bookDb.checkStock(bookList, (err, results) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error checking book stock");
            return;
        }

        results.forEach((book) => {
            let i = req.session.cart.books.findIndex(item => item.isbn == book.isbn);

            //not enough stock
            if(book.stock < req.session.cart.books[i].quantity) {
                if(book.stock > 0) { //reduce quantity
                    const qRemove = req.session.cart.books[i].quantity - book.stock;
                    req.session.cart.total.quantity -= qRemove;
                    req.session.cart.books[i].quantity = book.stock;

                    //update price
                    req.session.cart.total.price -= req.session.cart.books[i].price * qRemove;

                    req.session.cart.errors.push({
                        isbn: req.session.cart.books[i].isbn,
                        title: req.session.cart.books[i].title,
                        error: "quantity changed"
                    });
                }
                else { //remove from cart
                    req.session.cart.errors.push({
                        isbn: req.session.cart.books[i].isbn,
                        title: req.session.cart.books[i].title,
                        error: "out of stock"
                    });
                    //update price
                    req.session.cart.total.price -= req.session.cart.books[i].price * req.session.cart.books[i].quantity;

                    //update quantity
                    req.session.cart.total.quantity -= req.session.cart.books[i].quantity;

                    req.session.cart.books.splice(i, 1);
                }
            }
        });
        next();
    });
}


function showConfirm(req, res) {
    res.status(200).render("checkout/confirm", {
        session: req.session
    });
}

module.exports = router;