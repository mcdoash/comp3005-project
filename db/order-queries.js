const db = require("./");

const getAddresses = "SELECT ID, Fname, Lname, Street FROM Address WHERE Address.Account = $1";
const getCards = "SELECT Card_id, name, '************' || SUBSTRING(Card_num , 12, 16) AS Card_num FROM Card WHERE Card.Account = $1";

exports.getAccountData = (email, callback) => {
    db.query(getAddresses, [email], (err, result) => {
        let res = { addresses: result.rows };

        db.query(getCards, [email], (err, result) => {
            res.cards = result.rows;
            callback(err, res);
        });
    });
};