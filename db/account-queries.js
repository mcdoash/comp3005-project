const db = require("./");

const accountExists = "SELECT COUNT(*) as exists FROM Account WHERE Email = $1";

const createAccount = "INSERT INTO Account VALUES($1, $2, $3, $4)";

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