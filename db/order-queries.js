const db = require("./");

const getAddresses = "SELECT ID, Fname, Lname, Street FROM Address WHERE Address.Account = $1";
const getCards = "SELECT Card_id, name, '************' || SUBSTRING(Card_num , 12, 16) AS Card_num FROM Card WHERE Card.Account = $1";

const createOrder = "INSERT INTO Book_order VALUES(DEFAULT, $1, $2, $3, $4, DEFAULT, NULL, DEFAULT, NULL, NULL) RETURNING Number;";

const deleteOrder = "DELETE FROM Book_Order WHERE Number = $1";

const getOrderData = "SELECT Book_order.Number, Book_order.total, Book_order.Order_date, Book_order.Tracking, Book_order.Cur_location, Book_order.Expected_date, Book_order.Arrival_date, Address.Fname, Address.Lname, Address.Street, Address.City, Address.Province, Address.Postal_code, Address.Country, Address.Phone_num, '************' || SUBSTRING(Card_num , 12, 16) AS Card_num FROM Book_order JOIN Card ON Book_order.Billing = Card.Card_id JOIN Address ON Book_order.Ship_address = Address.ID WHERE Book_order.Number = $1;";

const getOrderBooks = "SELECT Book.ISBN, Book.Title, Book.Price, Sale.Quantity FROM Sale JOIN Book_order ON Sale.Order_num = Book_order.Number JOIN Book ON Sale.Book = Book.ISBN WHERE Book_order.Number = $1;";

const getUserOrders = "SELECT Number, Order_date, Total, (Arrival_date IS NULL) AS inProgress FROM Book_order WHERE Account = $1 ORDER BY inProgress DESC, Order_date DESC;";


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
        else callback(err, result.rows[0].number);
    });
}

exports.createSales = (order, cart, callback) => {
    let values = [];
    cart.forEach(book => {
        values.push("('" + book.isbn + "', " + order + ", " + book.quantity + ", " + (book.price * book.quantity) + ")");
    });
    const saleQuery = "INSERT INTO Sale VALUES" + values.join();

    db.query(saleQuery, (err) => {
        if(err) { //delete
            db.query(deleteOrder, [order], (err2) => {
                if(err2) callback(err2);
                else callback(err);
            });
        }
        else callback(err);
    });
}

exports.getOrder = (num, callback) => {
    let orderData = {};

    db.query(getOrderData, [num], (err, result) => {
        if(err) callback(err);
        else {
            orderData.data = result.rows[0];

            db.query(getOrderBooks, [num], (err, result) => {
                orderData.books = result.rows;
                callback(err, orderData);
            });
        }
    });
    
}

exports.getUserOrders = (user, callback) => {
    db.query(getUserOrders, [user], (err, result) => {
        callback(err, result.rows);
    });
}
