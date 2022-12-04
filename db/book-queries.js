const db = require("./");
const booksPerPage = 20;

//prepared statments
const getTopBooks = {
    name: "getPopular",
    text: "SELECT * FROM Top_book_data LIMIT $1 OFFSET $2",
    values: [booksPerPage, 0]
} //pagination. refresh

//other queries
const getSpecficBook = "SELECT Book.ISBN, Book.Title, Book.Cover, Book.Publisher, Book.Blurb, Book.Price, Book.page_num, Book.Book_format, Book.Release_date, Book.Stock > 0 AS inStock, ARRAY_AGG(DISTINCT Authored.Author) Authors, ARRAY_AGG(DISTINCT Genre.Name) Genres FROM Book JOIN Authored ON Book.ISBN = Authored.Book JOIN Genre ON Book.ISBN = Genre.Book WHERE Book.ISBN = $1 GROUP BY Book.ISBN, Book.Title, Book.Cover, Book.Publisher, Book.Blurb, Book.Price, Book.page_num, Book.Book_format, Book. Release_date, Book.Stock";

const newBook = "INSERT INTO Book VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, DEFAULT, $10, $11) RETURNING ISBN;";

const checkBook = "SELECT COUNT(*) AS Exists FROM Book WHERE ISBN = $1;"


exports.addBook = (data, callback) => {
    db.query(newBook, data, (err, result) => {
        if(err) console.log(err);
        callback(err, result.rows[0].isbn);
    });
}

exports.addGenres = (book, genres, callback) => {
    let values = [];
    genres.forEach(genre => {
        values.push("('" + genre + "', '" + book + "')");
    });
    const genreQuery = "INSERT INTO Genre VALUES" + values.join();

    db.query(genreQuery, (err) => {
        callback(err);
    });
}

exports.addAuthors = (book, authors, callback) => {
    let values = [];
    authors.forEach(author => {
        values.push("('" + author + "', '" + book + "')");
    });
    const authorQuery = "INSERT INTO Authored VALUES" + values.join();

    db.query(authorQuery, (err) => {
        callback(err);
    });
}


exports.getPopular = (callback) => {
    db.query(getTopBooks, (err, result) => {
        callback(err, result.rows);
    });
}


exports.checkBook = (isbn, callback) => {
    db.query(checkBook, [isbn], (err, result) => {
        callback(err, result.rows[0].exists);
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
    let join = ""; //if genre join table
    let conditions = [];

    //isbn -> go to specific book
    //regex for similar results
    if(params.genre) {
        join = "JOIN Genre ON Book.ISBN = Genre.Book ";
        conditions.push("Genre.Name = '" + params.genre + "'");
    }
    if(params.author) {
        conditions.push("Book.ISBN IN (SELECT Book.ISBN FROM Book JOIN Authored ON Book.ISBN = Authored.Book WHERE Authored.Author ='" + params.author + "')");
    }
    if(params.title) {
        conditions.push("Book.Title = '" + params.title + "'");
    }
    if(params.format) {
        conditions.push("Book.Book_format = '" + params.format + "'");
    }

    return join + "WHERE " + conditions.join(" AND ");
}


//return stock of given books
exports.checkStock = (books, callback) => {
    books = "'" + books.join("','") + "'";
    //const query = "SELECT ISBN, Stock > 0 AS inStock FROM Book WHERE ISBN IN (" + books + ");";
    const query = "SELECT ISBN, Stock FROM Book WHERE ISBN IN (" + books + ");";
    
    db.query(query, (err, result) => {
        callback(err, result.rows);
    });
}


exports.getAuthorMatch = (name, callback) => {
    const authorMatch = "SELECT ARRAY_AGG(DISTINCT Author) Names FROM Authored WHERE LOWER(Author) LIKE LOWER('" + name + "%')";

    db.query(authorMatch, (err, result) => {
        callback(err, result.rows[0].names);
    });
}
exports.getGenreMatch = (name, callback) => {
    const genreMatch = "SELECT ARRAY_AGG(DISTINCT Name) Names FROM Genre WHERE LOWER(Name) LIKE LOWER('" + name + "%')";

    db.query(genreMatch, (err, result) => {
        callback(err, result.rows[0].names);
    });
}