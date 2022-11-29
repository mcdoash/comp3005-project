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
app.use("/books", bookRouter);
app.use("/accounts", accountRouter);


//start server
app.listen(3000);
console.log("Server running on port 3000");



app.get("/", showIndex);

//get data

function showIndex(req, res) {
    res.status(200).render("index");
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
            req.session.user = req.body.email;
            res.sendStatus(200);
        }
        else {
            res.status(401).send({error: "Invalid email or password."});
        }
    });
});