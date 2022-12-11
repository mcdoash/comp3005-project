const express = require("express");
let router = express.Router();
const db = require("../db/order-queries");

//make sure user is logged in
function checkLoggedIn(req, res, next) {
    if(req.session.signedIn) next();
    else {
        req.app.locals.sendError(req, res, 401, "Must be logged in to access page");
        return;
    }
}

//get checkout page
router.get("/", checkLoggedIn, checkCheckoutAccess,  getAccountData, showCheckout);

function checkCheckoutAccess(req, res, next) {
    if(!req.session.cart) { 
        req.app.locals.sendError(req, res, 400, "Cart empty");
        return;
    }
    next();
}

//get account cards and addresses
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

//show first stage of checkout process
function showCheckout(req, res) {
    res.statusCode = 200;
    res.redirect("/checkout/address");
    return;
}


//set address stage
router.get("/address", checkLoggedIn, checkCheckoutAccess, sendAddress);

function sendAddress(req, res) {
    res.status(200).render("checkout/address", {
        session: req.session
    });
}

//set the order address
router.post("/address", (req, res) => {
    req.session.cart.address = req.body.address;
    res.sendStatus(204);
    return;
});



//set card stage
router.get("/billing", checkLoggedIn, checkCardAccess, getAccountData, sendCard);

function checkCardAccess(req, res, next) {
    if(!req.session.cart) { 
        req.app.locals.sendError(req, res, 400, "Cart empty");
        return;
    }
    else if(!req.session.cart.address) { //must set address first
        res.statusCode = 401;
        res.redirect("/checkout");
        return;
    }
    next();
}

function sendCard(req, res) {
    res.status(200).render("checkout/billing", {
        session: req.session
    });
}

//set order card
router.post("/billing", (req, res) => {
    req.session.cart.card = req.body.card;
    res.sendStatus(204);
    return;
});


//confirm order page
router.get("/confirm", checkLoggedIn, checkConfirmAccess, getAccountData, confirmStock, showConfirm);

function checkConfirmAccess(req, res, next) {
    if(!req.session.cart) { 
        req.app.locals.sendError(req, res, 400, "Cart empty");
        return;
    }
    else if(!req.session.cart.card) { //must set card first
        res.statusCode = 401;
        res.redirect("/checkout/billing");
        return;
    }
    next();
}

//check books current status
function confirmStock(req, res, next) {
    req.app.locals.refreshCart(req,res, next);
    return;
}

function showConfirm(req, res) {
    res.status(200).render("checkout/confirm", {
        session: req.session
    });
}

module.exports = router;