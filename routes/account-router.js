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



function checkSignedIn(req, res, next) {
    if(req.session.signedIn) next();
    else {
        res.status(401).send();
        return;
    }
}


//add a new address
router.post("/address", checkSignedIn, newAddress);

function newAddress(req, res) {
    let data = { 
        account: req.session.user.email,
        ...req.body
    }

    db.newAddress(Object.values(data), (err, id) => {
        if(err) {
            console.error(err.stack);
            res.sendStatus(400);
            return;
        } 
        res.status(201).send({id: id});
    });
}


//add a new card
router.post("/cards", checkSignedIn, newCard);

function newCard(req, res) {
    let data = { 
        account: req.session.user.email,
        ...req.body
    }

    db.newCard(Object.values(data), (err, id) => {
        if(err) {
            console.error(err.stack);
            res.sendStatus(400);
            return;
        } 
        res.status(201).send({id: id});
    });
}
module.exports = router;