const express = require("express");
let app = express();

//template engine
const pug = require("pug");
app.set("view engine", "pug");
app.set("views", "./views");

//database integration handled in another file
const db = require("./db");

app.use(express.json());
app.use(express.static("public"));

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


app.get("/login", (req, res) => {
    res.status(200).render("login");
});