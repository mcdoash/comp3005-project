let books = require("./books.json");

const express = require("express");
let app = express();

const pug = require("pug");
app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.json());
app.use(express.static("public"));


const { Client } = require("pg");
let db = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "password",
    database: "Project"
});
db.connect((e) => {
    if(e) {
        console.error("Cannot connect to the database", e.stack);
    }
    else {
        console.log("Connection established");
        app.listen(3000);
        console.log("Server running on port 3000");
        testDb();
    }
});

function testDb() {
    const query = "SELECT * FROM Publisher";
    db.query(query, (err, res) => {
        if(err) throw err;
        console.log(res.rows);
        db.end()
    });
}

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