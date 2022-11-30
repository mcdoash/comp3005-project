const db = require("./");

const accountExists = "SELECT COUNT(*) as exists FROM Account WHERE Email = $1";

const createAccount = "INSERT INTO Account VALUES($1, $2, $3, $4)";

const logIn = "SELECT COUNT(*) as success FROM Account WHERE Email = $1 AND Password = $2";

const newAddress = "INSERT INTO Address VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING ID";

//return t/f if account with given email exists
exports.checkAccount = (email, callback) => {
    db.query(accountExists, [email], (err, result) => {
        callback(err, parseInt(result.rows[0].exists));
    });
};

exports.newAccount = (data, callback) => {
    const values = [data.email, data.fname, data.lname, data.password];
    db.query(createAccount, values, (err, result) => {
        callback(err);
    });
}

//return if account with email and password exists
exports.logIn = (email, password, callback) => {
    db.query(logIn, [email, password], (err, result) => {
        callback(err, parseInt(result.rows[0].success));
    });
}

//create address
exports.newAddress = (data, callback) => {
    db.query(newAddress, data, (err, result) => {
        callback(err, result.rows[0].id);
    });
}