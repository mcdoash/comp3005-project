const express = require("express");
let router = express.Router();
const db = require("../db/order-queries");

router.get("/checkout", checkLoggedIn, getAccountData, showCheckout);

//show cart page
router.get("/", (req, res) => {
    res.status(200).render("cart", {
        session: req.session
    });
});


//add book to cart
router.post("/", (req, res) => {
    if (!req.session.cart) { //empty cart init
        req.session.cart = {};
        req.session.cart.books = [];
        req.session.cart.total = {
            price: 0,
            quantity: 0
        }
    }
    let inCart = false;

    //check if book already in cart
    req.session.cart.books.forEach((book) => {
        if(book.isbn == req.body.isbn) {
            book.quantity++;
            inCart = true;
        }
    })
    if(!inCart) {
        req.body.quantity = 1;
        req.session.cart.books.push(req.body);
    } 

    req.session.cart.total.price += req.body.price;
    req.session.cart.total.quantity ++;
    res.status(204).send();
});


function checkLoggedIn(req, res, next) {
    if(req.session.signedIn) next();
    else return;
}

//check account data
function getAccountData(req, res, next) {
    console.log(req.session.user);
    db.getAccountData(req.session.user.email, (err, results) => {
        if(err) console.error(err.stack);
        console.log(results);
        req.session.user.cards = results.cards;
        req.session.user.addresses = results.addresses;
        next();
    });
}

function showCheckout(req, res) {
    res.status(200).render("checkout", {
        session: req.session
    });
}

module.exports = router;