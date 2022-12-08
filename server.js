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
let cartRouter = require("./routes/cart-router");
let checkoutRouter = require("./routes/checkout-router");
let orderRouter = require("./routes/order-router");
let ownerRouter = require("./routes/owner-router");
app.use("/books", bookRouter);
app.use("/accounts", accountRouter);
app.use("/cart", cartRouter);
app.use("/checkout", checkoutRouter);
app.use("/orders", orderRouter);
app.use("/owner", ownerRouter);


//start server
app.listen(3000);
console.log("Server running on port 3000");


//homepage
app.get("/", getTopBooks, showIndex);
//app.get("/", testLogIn);

//get a list of the top selling books
function getTopBooks(req, res, next) {
    book.getPopular((err, result) => {
        if(err) console.error(err.stack);
        res.books = result;
        next();
    });
}

function testLogIn(req, res, next) {
    account.logIn("Freeman25@yahoo.com", "e9iAMlXbbKCrPnd", (err, success) => {
        if(err) console.error(err.stack);
        if(success) {
            req.session.signedIn = true;
            req.session.user = { email: "Freeman25@yahoo.com" };
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
app.post("/login", tryLogIn);

function tryLogIn(req, res, next)  {
    account.logIn(req.body.email, req.body.password, (err, success) => {
        if(err) console.error(err.stack);
        if(success) {
            app.locals.logInUser(req, res, req.body.email);
            return;
        }
        else {
            req.app.locals.sendError(req, res, 401, "Invalid email or password.");
            return;
        }
    });
}

app.locals.logInUser = ((req, res, user) => {
    req.session.signedIn = true;
    req.session.user = { email: req.body.email };

    account.getInfo(req.body.email, (err, info) => {
        if(err) {
            console.error(err.stack);
            req.app.locals.sendError(req, res, 500, "Error getting account info.");
            return;
        }
        req.session.user.name = info.name;

        res.statusCode = 200;
        res.redirect("/");
        return;
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
        req.app.locals.sendError(req, res, 401, "Must be logged in to access page");
        return;
    }
});



//add new publisher
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
            req.app.locals.sendError(req, res, 400, "Publisher '" + req.body.name + "' already exists");
            return;
        }
    });
}

function createPub(req, res) {
    publisher.addPub(req.pubData, (err) => {
        if(err) {
            if(err.code == "23505") { //dup email
                req.app.locals.sendError(req, res, 401, "Duplicate email: " + err.detail);
            }
            else if(err.code == "23514") { //bad email format
                req.app.locals.sendError(req, res, 401, "Invalid email format");
            }
            else {
                console.error(err.stack);
                req.app.locals.sendError(req, res, 500, "Publisher could not be created");
            }
            return;
        }
        req.app.locals.sendSuccess(req, res, 201, "Publisher added successfully");
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


app.locals.sendError = ((req, res, code, error) => {
    if(req.accepts("html")) {
        res.status(code).render("error", {
          session: req.session, 
          code: code, 
          error: error
        });
      }
      else if(req.accepts("json")) {
        res.status(code).send({error: error});
      }
});

app.locals.sendSuccess = ((req, res, code, message) => {
    if(req.accepts("html")) {
        res.status(code).render("success", {
          session: req.session, 
          code: code, 
          message: message
        });
      }
      else if(req.accepts("json")) {
        res.status(code).send({success: message});
      }
});

//404 for all other requests
app.use("*", (req, res) => {
    req.app.locals.sendError(req, res, 404, "Requested resource does not exist");
    return;
});