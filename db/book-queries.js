const db = require("./");
const booksPerPage = 20;

//prepared statments
const getTopBooks = {
    name: "getPopular",
    text: "SELECT * FROM Top_book_data LIMIT $1 OFFSET $2",
    values: [booksPerPage, 0]
} //pagination

//other queries
let getSpecficBook = "SELECT Book.ISBN, Book.Title, Book.Cover, Book.Publisher, Book.Blurb, Book.Price, Book.page_num, Book.Book_format, Book.Release_date, Book.Stock > 0 AS inStock, ARRAY_AGG(DISTINCT Authored.Author) Authors, ARRAY_AGG(DISTINCT Genre.Name) Genres FROM Book JOIN Authored ON Book.ISBN = Authored.Book JOIN Genre ON Book.ISBN = Genre.Book WHERE Book.ISBN = $1 GROUP BY Book.ISBN, Book.Title, Book.Cover, Book.Publisher, Book.Blurb, Book.Price, Book.page_num, Book.Book_format, Book. Release_date, Book.Stock";


exports.getPopular = (callback) => {
    db.query(getTopBooks, (err, result) => {
        callback(err, result.rows);
    });
}

exports.getSpecific = (isbn, callback) => {
    db.query(getSpecficBook, [isbn], (err, result) => {
        callback(err, result.rows[0]);
    });
}


//get books based on query params
exports.getBooks = (params, callback) => {
    let conditions = getParams(params);
    let offset = (params.page - 1) * booksPerPage;

    let query = "SELECT Book.ISBN, Book.Title, Book.Cover, ARRAY_AGG(DISTINCT Authored.Author) Authors, Book.Price  FROM Book JOIN Authored ON Book.ISBN = Authored.Book " + conditions + " GROUP BY Book.ISBN, Book.Title, Book.Cover, Book.Price LIMIT " + booksPerPage + " OFFSET " + offset; 

    db.query(query, [], (err, result) => {
        callback(err, result.rows);
    });
}

//format query conditions
function getParams(params) {
    if(params.length > 1) { //other than page
        let join = "";
        let conditions = [];

        //isbn -> go to specific book
        //regex for similar results
        if(params.genre) {
            join = "JOIN Genre ON Book.ISBN = Genre.Book ";
            conditions.push("Genre.Name = '" + params.genre + "'");
        }
        if(params.author) {
            conditions.push("Authored.Author = '" + params.author + "'");
        }
        if(params.title) {
            conditions.push("Book.Title = '" + params.title + "'");
        }
        if(params.format) {
            conditions.push("Book.Book_format = '" + params.format + "'");
        }

        return join + "WHERE " + conditions.join(" AND ");
    }
    else return "";
}