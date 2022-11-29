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
    if (!req.session.cart) {
        req.session.cart = []
    }
    req.body.quantity = 1; //check/set
    
    req.session.cart.push(req.body);
    console.log(req.session.cart);
    res.status(204).send({});
});

module.exports = router;