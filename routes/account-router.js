const express = require("express");
let router = express.Router();
const db = require("../db/account-queries");

const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }))

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
        }
        res.sendStatus(201);
    });
}

module.exports = router;