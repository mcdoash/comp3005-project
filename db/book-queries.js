const db = require("./");
const booksPerPage = 20;

//attributes for viewing list of books
const listAttr = "Storefront.ISBN, Storefront.Title, Storefront.Cover, ARRAY_AGG(DISTINCT Authored.Author) Authors, Storefront.Price, Storefront.inStock";
const listGroup = "Storefront.ISBN, Storefront.Title, Storefront.Cover, Storefront.Price, Storefront.inStock";

//prepared statments
const getTopBooks = {
    name: "getPopular",
    text: "SELECT " + listAttr + " FROM Storefront JOIN Authored ON Storefront.ISBN = Authored.Book GROUP BY " + listGroup + " LIMIT $1 OFFSET $2",
    values: [booksPerPage, 0]
} //pagination. refresh


//other queries
const getSpecficBook = "SELECT Storefront.*, ARRAY_AGG(DISTINCT Authored.Author) Authors, ARRAY_AGG(DISTINCT Genre.Name) Genres FROM Storefront JOIN Authored ON Storefront.ISBN = Authored.Book JOIN Genre ON Storefront.ISBN = Genre.Book WHERE Storefront.ISBN = $1 GROUP BY Storefront.ISBN, Storefront.Title, Storefront.Cover, Storefront.Publisher, Storefront.Blurb, Storefront.Price, Storefront.page_num, Storefront.Book_format, Storefront.Release_date, Storefront.inStock;";

const newBook = "INSERT INTO Book VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, DEFAULT, $10, $11, TRUE) RETURNING ISBN;";

const checkBook = "SELECT COUNT(*) AS Exists FROM Book WHERE ISBN = $1;"

const getStock = "SELECT Stock FROM Book WHERE ISBN = $1";

const removeBook = "UPDATE Book SET Selling = FALSE WHERE Book.ISBN = $1;";

const restoreBook = "UPDATE Book SET Selling = TRUE WHERE Book.ISBN = $1;";
    


//create a new book, return isbn
exports.addBook = (data, callback) => {
    db.query(newBook, data, (err, result) => {
        if(err) callback(err);
        else callback(err, result.rows[0].isbn);
    });
}

//add new genres for a specific book
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

//add new authors for a specific book
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


//get a list of the highest selling book info
exports.getPopular = (callback) => {
    db.query(getTopBooks, (err, result) => {
        callback(err, result.rows);
    });
}


//check to see if a book with given isbn exists
exports.checkBook = (isbn, callback) => {
    db.query(checkBook, [isbn], (err, result) => {
        if(err) callback(err);
        else callback(err, result.rows[0].exists);
    });
}

//retrieve a specific book by isbn
exports.getSpecific = (isbn, callback) => {
    db.query(getSpecficBook, [isbn], (err, result) => {
        if(err) callback(err);
        else callback(err, result.rows[0]);
    });
}


//get books based on query params
exports.getBooks = (params, callback) => {
    let conditions = getParams(params);
    let offset = (params.page - 1) * booksPerPage;

    let query = "SELECT " + listAttr  + " FROM Storefront JOIN Authored ON Storefront.ISBN = Authored.Book " + conditions + " GROUP BY " + listGroup + " LIMIT " + booksPerPage + " OFFSET " + offset; 

    db.query(query, [], (err, result) => {
        callback(err, result.rows);
    });
}

//format query conditions
function getParams(params) {
    let conditions = [];
    let join = ""; //if genre join table

    if(params.isbn) {
        conditions.push("Storefront.ISBN = '" + params.isbn + "'");
    }
    //word boundary search
    if(params.genre) {
        join = "JOIN Genre ON Storefront.ISBN = Genre.Book ";
        conditions.push("Genre.Name ~* '\\m(" + params.genre + ")'");
    }
    if(params.author) {
        conditions.push("Storefront.ISBN IN (SELECT Storefront.ISBN FROM Storefront JOIN Authored ON Storefront.ISBN = Authored.Book WHERE Authored.Author ~* '(\\m" + params.author + ")')");
    } 
    if(params.title) {
        conditions.push("Title ~* '\\m(" + params.title + ")\\M'"); 
    }
    if(params.format) {
        conditions.push("Book_format ~* '\\m(" + params.format + ")'");
    }

    if(conditions.length)
        return join + "WHERE " + conditions.join(" AND ");
    else return "";
}


//return the stock of one book
exports.getStock = (isbn, callback) => {
    db.query(getStock, [isbn], (err, result) => {
        if(err) callback(err);
        else callback(err, result.rows[0].stock);
    });
}

//return stock of a list of books
exports.checkStock = (books, callback) => {
    books = "'" + books.join("','") + "'";
    const query = "SELECT ISBN, Stock FROM Book WHERE ISBN IN (" + books + ");";
    
    db.query(query, (err, result) => {
        callback(err, result.rows);
    });
}

//get current book data (price & stock)
exports.getCurrent = (books, callback) => {
    books = "'" + books.join("','") + "'";
    const query = "SELECT ISBN, Price, Stock, Selling FROM Book WHERE ISBN IN (" + books + ");";
    
    db.query(query, (err, result) => {
        callback(err, result.rows);
    });
}



/* match where a word starts with given string
   ex. "fict" gets both "Science Ficiton" and
       "Speculative Fiction" but "ie" does not 
       get "ScIEnce Fiction" */

//get all matching author names
exports.getAuthorMatch = (name, callback) => {
    const authorMatch = "SELECT ARRAY_AGG(DISTINCT Author) Names FROM Authored WHERE Author ~* '\\m(" + name + ")';";

    db.query(authorMatch, (err, result) => {
        if(err) callback(err);
        else callback(err, result.rows[0].names);
    });
}
//get all matching genre names
exports.getGenreMatch = (name, callback) => {
    const genreMatch = "SELECT ARRAY_AGG(DISTINCT Name) Names FROM Genre WHERE Name ~* '\\m(" + name + ")';";

    db.query(genreMatch, (err, result) => {
        if(err) callback(err);
        else callback(err, result.rows[0].names);
    });
}


exports.removeBook = (isbn, callback) => {
    db.query(removeBook, [isbn], (err) => {
        callback(err);
    });
}
exports.restoreBook = (isbn, callback) => {
    db.query(restoreBook, [isbn], (err) => {
        callback(err);
    });
}