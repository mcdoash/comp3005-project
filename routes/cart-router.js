const express = require("express");
let router = express.Router();
//const db = require("../db/order-queries");

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
        req.session.cart.data = [];
        req.session.cart.books = [];
    }
    if(req.session.cart.books.includes(req.body.isbn)) { //book already in cart
        req.session.cart.data.forEach((book) => {
            if(book.isbn == req.body.isbn) {
                book.quantity++;
            }
        })
    }
    else {
        req.session.cart.books.push(req.body.isbn);
        req.body.quantity = 1;
        req.session.cart.data.push(req.body);
    } 
    
    console.log(req.session.cart.data);
    res.status(204).send({});
});

module.exports = router;