const express = require("express");
let router = express.Router();
const db = require("../db/account-queries");
const bookDb = require("../db/book-queries");

//show cart page
router.get("/", checkCart, sendCart);

//check if changes have been made to cart items
function checkCart(req, res, next) {
    if(!req.session.cart) next();
    else req.app.locals.refreshCart(req, res, next);
    return;
}

function sendCart(req, res) {
    res.status(200).render("cart", {
        session: req.session
    });
}


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
    //look if book already in cart
    const book = req.session.cart.books.find(item => item.isbn == req.body.isbn);

    if(book) { //already in cart, check stock & update
        updateQuantity(book, (book.quantity + 1), req, res);
        return;
    }
    else { //enter into cart
        req.body.quantity = 1;
        req.session.cart.books.push(req.body);

        req.session.cart.total.price += req.body.price;
        req.session.cart.total.quantity++;
        res.status(204).send();
    }
});


//update quantity of cart book
router.put("/:isbn", (req, res) => {
    const book = req.session.cart.books.find(item => item.isbn == req.params.isbn);
    
    updateQuantity(book, req.body.quantity, req, res);
    return;
});


//delete from cart
router.delete("/:isbn", (req, res) => {
    let i = req.session.cart.books.findIndex(item => item.isbn == req.params.isbn);
    req.session.cart.books.splice(i, 1);

    res.status(204).send();
    return;
});


//update the quantity of a book item according to stock
function updateQuantity(book, quantity, req, res) {
    bookDb.getStock(book.isbn, (err, stock) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error checking book stock");
            return;
        }
        if(stock < quantity) {
            book.quantity = stock; //update to max
            res.status(400).send({error: "Not enough stock for quantity requested", max: stock});
        }
        else {
            book.quantity = quantity;
            res.status(204).send();
        }
        return;
    });
}

module.exports = router;