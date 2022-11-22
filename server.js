let books = require("./books.json");

const express = require("express");
let app = express();
app.listen(3000);
console.log("Server running on port 3000");

const pug = require("pug");
app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.status(200).render("index");
});

//query params later
app.get("/books", (req, res) => {
    res.status(200).render("book-results", {
        books: books
    });
});

app.get("/books/:isbn", (req, res) => {
    res.status(200).render("book", {book: books[0]});
});