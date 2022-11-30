const db = require("./");

//not allss
const getAddresses = "SELECT * FROM Address WHERE Address.Account = $1";
const getCards = "SELECT * FROM Card WHERE Card.Account = $1";

exports.getAccountData = (email, callback) => {
    db.query(getAddresses, [email], (err, result) => {
        console.log(result.rows);
        let res = { addresses: result.rows };

        db.query(getCards, [email], (err, result) => {
            res.cards = result.rows;
            callback(err, res);
        });
    });
};