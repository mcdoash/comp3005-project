const express = require("express");
let router = express.Router();
const db = require("../db/order-queries");

router.get("/", checkLoggedIn, getAccountData, showCheckout);

function checkLoggedIn(req, res, next) {
    if(req.session.signedIn) next();
    else return; //error
}

//check account data
function getAccountData(req, res, next) {
    db.getAccountData(req.session.user.email, (err, results) => {
        if(err) console.error(err.stack);
        req.session.user.cards = results.cards;
        req.session.user.addresses = results.addresses;
        next();
    });
}

function showCheckout(req, res) {
    res.statusCode = 200;
    res.redirect("/checkout/address");
    return;
}

router.get("/address", (req, res) => {
    res.status(200).render("checkout/address", {
        session: req.session
    });
});

router.post("/address", (req, res) => {
    req.session.cart.address = req.body.address;
    res.sendStatus(204);
    return;
});


router.get("/billing", (req, res) => {
    res.status(200).render("checkout/billing", {
        session: req.session
    });
});

router.post("/billing", (req, res) => {
    req.session.cart.card = req.body.card;
    res.sendStatus(204);
    return;
});


router.get("/confirm", (req, res) => {
    console.log("ok :)");
    /*res.status(200).render("checkout/address", {
        session: req.session
    });*/
});

module.exports = router;