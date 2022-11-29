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
        req.session.cart = [];
    }
    let inCart = false;

    //check if book already in cart
    req.session.cart.forEach((book) => {
        if(book.isbn == req.body.isbn) {
            book.quantity++;
            inCart = true;
        }
    })
    if(!inCart) {
        req.body.quantity = 1;
        req.session.cart.push(req.body);
    } 

    res.status(204).send();
});

module.exports = router;