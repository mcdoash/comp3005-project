const db = require("./");

const getAddresses = "SELECT ID, Fname, Lname, Street FROM Address WHERE Address.Account = $1";
const getCards = "SELECT Card_id, name, '************' || SUBSTRING(Card_num , 12, 16) AS Card_num FROM Card WHERE Card.Account = $1";

const createOrder = "INSERT INTO Book_order VALUES(DEFAULT, $1, $2, $3, $4, DEFAULT, NULL, DEFAULT, NULL, NULL) RETURNING Number;";

const getOrder = "";


exports.getAccountData = (email, callback) => {
    db.query(getAddresses, [email], (err, result) => {
        let res = { addresses: result.rows };

        db.query(getCards, [email], (err, result) => {
            res.cards = result.rows;
            callback(err, res);
        });
    });
};


exports.createOrder = (user, cart, callback) => {
    const values = [user, cart.total.price, cart.card, cart.address];

    db.query(createOrder, values, (err, result) => {
        if(err) callback(err);
        callback(err, result.rows[0].number);
    });
}

exports.createSales = (order, cart, callback) => {
    let values = [];
    cart.forEach(book => {
        values.push("('" + book.isbn + "', " + order + ", " + book.quantity + ")");
    });
    const saleQuery = "INSERT INTO Sale VALUES" + values.join();
    const updateTotal = "SELECT set_order_total(" + order + ")";

    db.query(saleQuery, (err) => {
        if(err) callback(err);
        else {
            db.query(updateTotal, (err) => {
                callback(err);
            });
        }
    });
}

exports.getOrder = (num, callback) => {
    cart.forEach(item => {
        
    });

}