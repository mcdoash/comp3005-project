const express = require("express");
let router = express.Router();
const db = require("../db/account-queries");

//create new user
router.post("/", checkAccount, newAccount);

//see if account already exists
function checkAccount(req, res, next) {
    const email = req.body.email;

    db.checkAccount(email, (err, exists) => {
        if(err) console.error(err.stack);
        if(exists) {
            res.status(409).send({error: "Account with email " + email + " already exists."}); //fix response
            return;
        }
        next();
    });
}

//create a new account
function newAccount(req, res) {
    db.newAccount(req.body, (err) => {
        if(err) {
            console.error(err.stack);
            res.status(500).send({error: "Could not create account."}); //fix response
            return;
        } //log them in
        res.sendStatus(201);
    });
}


router.post("/address", checkSignedIn, newAddress);

function checkSignedIn(req, res, next) {
    if(req.session.signedIn) next();
    else {
        res.status(401).send();
        return;
    }
}

function newAddress(req, res) {
    let data = { 
        account: req.session.user.email,
        ...req.body
    }
    console.log(Object.values(data));

    db.newAddress(Object.values(data), (err) => {
        if(err) {
            console.error(err.stack);
            res.status(400).send();
            return;
        } 
        res.sendStatus(204);
    });
}

module.exports = router;