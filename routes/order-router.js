const express = require("express");
let router = express.Router();
const db = require("../db/order-queries");
const bookDb = require("../db/book-queries");

router.post("/", createOrder, createSales);
router.get("/:order", showOrder);

function createOrder(req, res, next) { 
    db.createOrder(req.session.user.email, req.session.cart, (err, num) => {
        if(err) console.error(err.stack);
        res.orderNum = num;
        next();
    });
}

function createSales(req, res) {
    db.createSales(res.orderNum, req.session.cart.books, (err) => {
        if(err) console.error(err.stack);
        
        res.statusCode = 204;
        res.redirect("/orders/" + res.orderNum);
        return;
    });
}


router.param("order" , (req, res, next, num) => {
    db.getOrder(num, (err, order) => {
        if(err) console.error(err.stack);
        if(!order.data) {
            res.status(404).send({error: "Order  " + num + " does not exist"});
            return;
        }
        res.order = order;
        res.orderNum = num;
        next();
    });
});


function showOrder(req, res) {
    res.status(200).render("order", {
        order: res.order
    });
}

module.exports = router;