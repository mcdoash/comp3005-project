const express = require("express");
let router = express.Router();
const db = require("../db/account-queries");

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


//update quantity
router.put("/:isbn", (req, res) => {
    let i = req.session.cart.books.findIndex(item => item.isbn == req.params.isbn);
    
    //update prices & totals
    req.session.cart.total.price -= req.session.cart.books[i].price * req.session.cart.books[i].quantity;
    req.session.cart.total.quantity -= req.session.cart.books[i].quantity;
    req.session.cart.total.price += req.session.cart.books[i].price * req.body.quantity;
    req.session.cart.total.quantity += req.body.quantity;

    req.session.cart.books[i].quantity = req.body.quantity;
    res.status(204).send();
    return;
});

//delete from cart
router.delete("/:isbn", (req, res) => {
    let i = req.session.cart.books.findIndex(item => item.isbn == req.params.isbn);

    //update prices & totals
    req.session.cart.total.price -= req.session.cart.books[i].price * req.session.cart.books[i].quantity;
    req.session.cart.total.quantity -= req.session.cart.books[i].quantity;
    req.session.cart.books.splice(i, 1);

    res.status(204).send();
    return;
});

module.exports = router;