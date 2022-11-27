const db = require("./");

exports.getBooks = (params, callback) => {
    const query = "SELECT Book.ISBN, Book.Title, Book.Cover, ARRAY_AGG(Authored.Author) Authors FROM Book JOIN Genre ON Book.ISBN = Genre.Book JOIN Authored ON Book.ISBN = Authored.Book WHERE Genre.Name = 'Fantasy' GROUP BY Book.ISBN, Book.Title, Book.Cover LIMIT $1"; //test
    //param format
    
    db.query(query, params, (err, result) => {
        callback(err, result.rows);
    });
}