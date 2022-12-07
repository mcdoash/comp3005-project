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

app.use(express.json());
app.use(express.static("public"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }))


//database integration handled in another file
const account = require("./db/account-queries");
const publisher = require("./db/publisher-queries");
const book = require("./db/book-queries");

//routers
let bookRouter = require("./routes/book-router");
let accountRouter = require("./routes/account-router");
let checkoutRouter = require("./routes/checkout-router");
let orderRouter = require("./routes/order-router");
let ownerRouter = require("./routes/owner-router");
app.use("/books", bookRouter);
app.use("/accounts", accountRouter);
app.use("/checkout", checkoutRouter);
app.use("/orders", orderRouter);
app.use("/owner", ownerRouter);


//start server
app.listen(3000);
console.log("Server running on port 3000");


//homepage
app.get("/", getTopBooks, showIndex);

//get a list of the top selling books
function getTopBooks(req, res, next) {
    book.getPopular((err, result) => {
        if(err) console.error(err.stack);
        res.books = result;
        next();
    });
}

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
        session: req.session,
        topBooks: res.books
    });
}


//show log in page
app.get("/login", (req, res) => {
    res.status(200).render("login", {session: req.session});
});

//log in attempt
app.post("/login", tryLogIn, getUserInfo);

function tryLogIn(req, res, next)  {
    account.logIn(req.body.email, req.body.password, (err, success) => {
        if(err) console.error(err.stack);
        if(success) {
            req.session.signedIn = true;
            req.session.user = { email: req.body.email };
            next();
        }
        else {
            res.status(401).send({error: "Invalid email or password."});
            return;
        }
    });
}

function getUserInfo(req, res, ) {
    account.getInfo(req.body.email, (err, info) => {
        if(err) {
            console.error(err.stack);
            res.status(500).send({error: "Error getting account info."});
            return;
        }
        req.session.user.name = info.name;
        
        res.statusCode = 200;
        res.redirect("/");
        return;
    });
}


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



app.post("/publishers", parseInput, checkPub, createPub);
function parseInput(req, res, next) {
    req.pubData = Object.values(req.body);

    req.pubData.forEach(item => item = item.replace("'", "''"));
    next();
}

//make sure publisher doean't already exist
function checkPub(req, res, next) {
    publisher.checkPub(req.body.name, (err, exists) => {
        if(err) console.error(err.stack);
        if(exists == 0) next();
        else {
            res.status(400).send({error: "Publisher '" + req.body.name + "' already exists"});
            return;
        }
    });
}

function createPub(req, res) {
    publisher.addPub(req.pubData, (err) => {
        if(err) {
            if(err.code == "23505") { //dup email
                res.status(401).send({error: "Duplicate email: " + err.detail});
            }
            else {
                console.error(err.stack);
                res.status(500).send({error: "Publisher could not be created"});
            }
            return;
        }
        res.status(201).send({success: "Publisher added successfully"});
        return;
    });
}



//return a list of publishers
app.get("/publishers", (req, res) => {
    let name = req.query.name;
    name = name.replace("'", "''"); //escape
    if(!name) name = "";

    publisher.getPubMatch(name, (err, results) => {
        if(err) console.error(err.stack);
        res.status(200).send({results: results});
    });
});

//return a list of genres
app.get("/genres", (req, res) => {
    let name = req.query.name;
    name = name.replace("'", "''"); //escape
    if(!name) name = "";

    book.getGenreMatch(name, (err, results) => {
        if(err) console.error(err.stack);
        res.status(200).send({results: results});
    });
});


//return a list of authors
app.get("/authors", (req, res) => {
    let name = req.query.name;
    name = name.replace("'", "''"); //escape
    if(!name) name = "";

    book.getAuthorMatch(name, (err, results) => {
        if(err) console.error(err.stack);
        res.status(200).send({results: results});
    });
});