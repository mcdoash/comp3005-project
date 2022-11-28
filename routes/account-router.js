const express = require("express");
let router = express.Router();
//const db = require("../db/account-queries");

//create new user
router.post("/", checkAccount, newAccount);

//see if account already exists
function checkAccount(req, res, next) {

}

//create a new account
function newAccount(req, res) {

}

module.exports = router;