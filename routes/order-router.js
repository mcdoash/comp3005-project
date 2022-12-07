const express = require("express");
let router = express.Router();
const db = require("../db/order-queries");
const bookDb = require("../db/book-queries");

router.post("/", createOrder, createSales, showOrder);

function createOrder(req, res, next) { 
    db.createOrder(req.session.user.email, req.session.cart, (err, num) => {
        if(err) console.error(err.stack);
        console.log(num);
        res.order = num;
        next();
    });
}

function createSales(req, res, next) {
    db.createSales(res.order, req.session.cart.books, (err) => {
        if(err) console.error(err.stack);
        next();
    });
}

function showOrder(req, res) {
    return;
}


module.exports = router;