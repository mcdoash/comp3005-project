const db = require("./");

//queries
const bookReport = "SELECT * FROM get_book_report($1, $2);";
const genreReport = "SELECT * FROM get_genre_report($1, $2);";
const authorReport = "SELECT * FROM get_author_report($1, $2);";

//report for dates grouped by book
exports.getBasicReport = (dates, callback) => {
    db.query(bookReport, dates, (err, result) => {
        callback(err, result.rows);
    });
}
//report for dates grouped by genre
exports.getGenreReport = (dates, callback) => {
    db.query(genreReport, dates, (err, result) => {
        callback(err, result.rows);
    });
}
//report for dates grouped by author
exports.getAuthorReport = (dates, callback) => {
    db.query(authorReport, dates, (err, result) => {
        callback(err, result.rows);
    });
}