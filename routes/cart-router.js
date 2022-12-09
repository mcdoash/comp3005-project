const express = require("express");
let router = express.Router();
const db = require("../db/account-queries");
const bookDb = require("../db/book-queries");

//show cart page
router.get("/", refreshCart, sendCart);

//check if changes have been made to cart items
function refreshCart(req, res, next) {
    if(!req.session.cart) next();
    else {
        const bookList = req.session.cart.books.map((book) => book.isbn); 
        
        bookDb.getCurrent(bookList, (err, results) => {
            if(err) {
                console.error(err.stack);
                req.app.locals.sendError(req, res, 500, "Error checking book data");
                return;
            }
            //reset totals
            req.session.cart.total.quantity = 0;
            req.session.cart.total.price = 0;
            req.session.cart.errors = [];

            results.forEach((item) => {
                let book = req.session.cart.books.find(x => x.isbn == item.isbn);
                let i = req.session.cart.books.findIndex(x => x.isbn == item.isbn);

                //price change
                item.price = parseFloat(item.price);
                book.price = parseFloat(book.price);

                if(item.price != book.price) {
                    book.price = item.price;
                    req.session.cart.errors.push({
                        isbn: book.isbn,
                        title: book.title,
                        error: "price changed"
                    });
                }

                //not enough stock
                if(item.stock < book.quantity) {
                    if(item.stock > 0) { //reduce quantity
                        book.quantity = item.stock;

                        req.session.cart.errors.push({
                            isbn: book.isbn,
                            title: book.title,
                            error: "quantity changed"
                        });
                    }
                    else { //remove from cart
                        req.session.cart.errors.push({
                            isbn: book.isbn,
                            title: req.book.title,
                            error: "out of stock"
                        });
                        req.session.cart.books.splice(i, 1);
                    }
                }
                //update totals
                req.session.cart.total.quantity += book.quantity;
                req.session.cart.total.price += book.price * book.quantity;
            });
            next();
        });
    }
}

function sendCart(req, res) {
    res.status(200).render("cart", {
        session: req.session
    });
}


//add book to cart
router.post("/", (req, res) => {
    if (!req.session.cart) { //empty cart init
        req.session.cart = {};
        req.session.cart.books = [];
        req.session.cart.total = {
            price: 0,
            quantity: 0
        }
    }
    //look if book already in cart
    const book = req.session.cart.books.find(item => item.isbn == req.body.isbn);

    if(book) { //already in cart, check stock & update
        updateQuantity(book, (book.quantity + 1), req, res);
        return;
    }
    else { //enter into cart
        req.body.quantity = 1;
        req.session.cart.books.push(req.body);

        req.session.cart.total.price += req.body.price;
        req.session.cart.total.quantity ++;
        res.status(204).send();
    }
});


//update quantity
router.put("/:isbn", (req, res) => {
    const book = req.session.cart.books.find(item => item.isbn == req.params.isbn);
    
    updateQuantity(book, req.body.quantity, req, res);
    return;
});

//delete from cart
router.delete("/:isbn", (req, res) => {
    let i = req.session.cart.books.findIndex(item => item.isbn == req.params.isbn);

    //update prices & totals
    req.session.cart.total.price -= req.session.cart.books[i].price * req.session.cart.books[i].quantity;
    req.session.cart.total.quantity -= req.session.cart.books[i].quantity;
    req.session.cart.books.splice(i, 1);

    res.status(204).send();
    return;
});


//update the quantity of a book item according to stock
function updateQuantity(book, quantity, req, res) {
    let sendError = false;

    bookDb.getStock(book.isbn, (err, stock) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error checking book stock");
            return;
        }
        if(stock < quantity) {
            quantity = stock; //update to max
            sendError = true;
        }

        //update prices & totals
        req.session.cart.total.price -= book.price * book.quantity;
        req.session.cart.total.quantity -= book.quantity;

        req.session.cart.total.price += book.price * quantity;
        req.session.cart.total.quantity += quantity;

        book.quantity = quantity;

        if(sendError) {
            res.status(400).send({error: "Not enough stock for quantity requested", max: stock});
        }
        else { 
            res.status(204).send();
        }
        return;
    });
}

module.exports = router;