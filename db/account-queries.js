const db = require("./");

const accountExists = "SELECT COUNT(*) as exists FROM Account WHERE Email = $1;";

const createAccount = "INSERT INTO Account VALUES($1, $2, $3, $4);";

const logIn = "SELECT COUNT(*) as success FROM Account WHERE Email = $1 AND Password = $2;";

const getInfo = "SELECT (Fname || ' ' || Lname) AS Name FROM Account WHERE Email = $1;";

const newAddress = "INSERT INTO Address VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING ID;";

const newCard = "INSERT INTO Card VALUES(DEFAULT, $1, $2, $3, $4, $5, $6) RETURNING Card_id;";

//return t/f if account with given email exists
exports.checkAccount = (email, callback) => {
    db.query(accountExists, [email], (err, result) => {
        if(err) callback(err);
        else callback(err, parseInt(result.rows[0].exists));
    });
};

//create a new account
exports.newAccount = (data, callback) => {
    const values = [data.email, data.fname, data.lname, data.password];
    db.query(createAccount, values, (err) => {
        callback(err);
    });
}

//return if account with email and password exists
exports.logIn = (email, password, callback) => {
    db.query(logIn, [email, password], (err, result) => {
        if(err) callback(err);
        else callback(err, parseInt(result.rows[0].success));
    });
}

//get account info
exports.getInfo = (email, callback) => {
    db.query(getInfo, [email], (err, result) => {
        if(err) callback(err);
        else callback(err, result.rows[0]);
    });
};

//create address
exports.newAddress = (data, callback) => {
    db.query(newAddress, data, (err, result) => {
        if(err) callback(err);
        else callback(err, result.rows[0].id);
    });
}

//create card
exports.newCard = (data, callback) => {
    db.query(newCard, data, (err, result) => {
        if(err) callback(err);
        else callback(err, result.rows[0].card_id);
    });
}