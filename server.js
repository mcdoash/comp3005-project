const express = require("express");
let app = express();

//template engine
const pug = require("pug");
app.set("view engine", "pug");
app.set("views", "./views");

const session = require("express-session");
app.use(
  session({
    secret: "It's a Secret to Everybody",
    resave: true, 
    saveUninitialized: false
  })
);

//database integration handled in another file
const account = require("./db/account-queries");

app.use(express.json());
app.use(express.static("public"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }))

//routers
let bookRouter = require("./routes/book-router");
let accountRouter = require("./routes/account-router");
let checkoutRouter = require("./routes/checkout-router");
app.use("/books", bookRouter);
app.use("/accounts", accountRouter);
app.use("/checkout", checkoutRouter);


//start server
app.listen(3000);
console.log("Server running on port 3000");



app.get("/", testLogIn);//, showIndex);

//get data

function testLogIn(req, res, next) {
    account.logIn("Mekhi51@gmail.com", "5W71FtXg0WNAbcl", (err, success) => {
        if(err) console.error(err.stack);
        if(success) {
            req.session.signedIn = true;
            req.session.user = { email: "Mekhi51@gmail.com" };
            req.session.cart = {
                books: [
                  {
                    isbn: '9117232372',
                    title: 'input benchmark Wooden',
                    price: 133,
                    quantity: 2
                  },
                  {
                    isbn: '7619454760',
                    title: 'Generic Horizontal Avon',
                    price: 10,
                    quantity: 1
                  },
                  {
                    isbn: '6752476965',
                    title: 'black program',
                    price: 66,
                    quantity: 1
                  },
                  { isbn: '7584365768', title: 'SDD', price: 111, quantity: 1 }
                ],
                total: { price: 453, quantity: 5 }
              }

            res.statusCode = 200;
            res.redirect("/cart");
            return;
        }
        else {
            res.status(401).send({error: "Invalid email or password."});
        }
    });
}

function showIndex(req, res) {
    res.status(200).render("index", {
        session: req.session
    });
}

//log in page
app.get("/login", (req, res) => {
    res.status(200).render("login");
});

//log in attempt
app.post("/login", (req, res) => {
    account.logIn(req.body.email, req.body.password, (err, success) => {
        if(err) console.error(err.stack);
        if(success) {
            req.session.signedIn = true;
            req.session.user = { email: req.body.email };
            res.statusCode = 200;
            res.redirect("/");
            return;
        }
        else {
            res.status(401).send({error: "Invalid email or password."});
        }
    });
});

app.get("/logout", (req, res) => {
    if(req.session.signedIn) {
        req.session.destroy();
        res.statusCode = 200;
        res.redirect("/");
        return;
    }
    else { //not signed in
        res.sendStatus(401);//fix to page
    }
});




//show cart page
app.get("/cart", (req, res) => {
    res.status(200).render("cart", {
        session: req.session
    });
});


//add book to cart
app.post("/cart", (req, res) => {
    if (!req.session.cart) { //empty cart init
        req.session.cart = {};
        req.session.cart.books = [];
        req.session.cart.total = {
            price: 0,
            quantity: 0
        }
    }
    let inCart = false;

    //check if book already in cart
    req.session.cart.books.forEach((book) => {
        if(book.isbn == req.body.isbn) {
            book.quantity++;
            inCart = true;
        }
    })
    if(!inCart) {
        req.body.quantity = 1;
        req.session.cart.books.push(req.body);
    } 

    req.session.cart.total.price += req.body.price;
    req.session.cart.total.quantity ++;
    res.status(204).send();
});