const express = require("express");
let router = express.Router();
const db = require("../db/order-queries");

router.post("/", createOrder, createSales);
router.get("/", getUserOrders, showOrderList);
router.get("/:order", showOrder);

//create the order based on cart
function createOrder(req, res, next) { 
    db.createOrder(req.session.user.email, req.session.cart, (err, num) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Order could not be created");
            return;
        }
        res.orderNum = num;
        next();
    });
}

//create sales for the order
function createSales(req, res) {
    db.createSales(res.orderNum, req.session.cart.books, (err) => {
        if(err) {
            console.error(err.stack);
            if(err.code == "P0001") { //stock change while confirming
                req.app.locals.sendError(req, res, 500, "Order cancelled as one or more books went out of stock while completing order");
                return;
            }
            else {
                req.app.locals.sendError(req, res, 500, "Problem creating order. Please try again");
                return;
            }
        }
        req.session.cart = null; //clear cart
        //redirect to new order page
        res.statusCode = 204;
        res.redirect("/orders/" + res.orderNum);
        return;
    });
}

//get order data for a particular order
router.param("order" , (req, res, next, num) => {
    db.getOrder(num, (err, order) => {
        if(err) console.error(err.stack);
        if(!order.data) {
            req.app.locals.sendError(req, res, 404, "Order  " + num + " does not exist");
            return;
        }
        res.order = order;
        res.orderNum = num;
        next();
    });
});

//display a particular order
function showOrder(req, res) {
    res.status(200).render("order", {
        session: req.session,
        order: res.order
    });
}


//get all of a user's orders if signed in
function getUserOrders(req, res, next) {
    if(!req.session.signedIn) next();
    else {
        db.getUserOrders(req.session.user.email, (err, orders) => {
            if(err) {
                console.error(err.stack);
                req.app.locals.sendError(req, res, 500, "Error getting orders");
                return;
            }
            req.session.orders = orders;
            next();
        });
    }
}

//show the order search/list page
function showOrderList(req, res) {
    res.status(200).render("order-search", {
        session: req.session,
        order: res.order
    });
}

module.exports = router;