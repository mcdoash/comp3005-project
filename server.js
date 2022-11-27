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
    password: "testPassword",
    database: "Project"
});
db
  .connect()
  .then(() => {
      console.log("Database connected");
      app.listen(3000);
      console.log("Server running on port 3000");
  })
  .catch(err => console.error("Cannot connect to the database", err.stack))



app.get("/", (req, res) => {
    res.status(200).render("index");
});


app.get("/books", getBooks, sendBooks);

//query params

function getBooks(req, res, next) {
    const query = "SELECT Book.ISBN, Book.Title, Book.Cover, ARRAY_AGG(Authored.Author) Authors FROM Book JOIN Genre ON Book.ISBN = Genre.Book JOIN Authored ON Book.ISBN = Authored.Book WHERE Genre.Name = 'Fantasy' GROUP BY Book.ISBN, Book.Title, Book.Cover LIMIT 5";
    db
      .query(query)
      .then(result => { 
          res.books = result.rows;
      })
      .catch(err => console.error(err.stack))
      .finally(() => {
          db.end(); //fix - pool
          next();
      })
}

function sendBooks(req, res) {
    console.log(res.books);
    res.status(200).render("book-results", {books: res.books});
}

app.get("/books/:isbn", (req, res) => {
    res.status(200).render("book", {book: books[0]});
});