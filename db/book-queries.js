const db = require("./");
const booksPerPage = 20;

//prepared statments
const getTopBooks = {
    name: "getPopular",
    text: "SELECT * FROM Top_book_data LIMIT $1 OFFSET $2",
    values: [booksPerPage, 0]
}


exports.getPopular = (callback) => {
    db.query(getTopBooks, (err, result) => {
        callback(err, result.rows);
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