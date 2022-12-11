const express = require("express");
let router = express.Router();
const db = require("../db/account-queries");

//create new user
router.post("/", checkAccount, newAccount);

//see if account already exists
function checkAccount(req, res, next) {
    const email = req.body.email;

    db.checkAccount(email, (err, exists) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error retrieving account data");
            return;
        }
        if(exists) {
            req.app.locals.sendError(req, res, 409, "Account with email " + email + " already exists.");
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
            req.app.locals.sendError(req, res, 500, "Could not create account.");
            return;
        }
        //log the new user in
        req.app.locals.logInUser(req, res, req.body.email);
        return;
    });
}


//check if the user is already signed in
function checkSignedIn(req, res, next) {
    if(req.session.signedIn) next();
    else {
        req.app.locals.sendError(req, res, 401, "Must be logged in to access resource");
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
            req.app.locals.sendError(req, res, 500, "Could not create new address");
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
            req.app.locals.sendError(req, res, 500, "Could not create new card");
            return;
        } 
        res.status(201).send({id: id});
    });
}
module.exports = router;