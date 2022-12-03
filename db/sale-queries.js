const db = require("./");

const allReport = "SELECT * FROM get_sales_report($1, $2)";
const genreReport = "SELECT * FROM get_genre_report($1, $2)";
const authorReport = "SELECT * FROM get_author_report($1, $2)";

exports.getBasicReport = (dates, callback) => {
    db.query(allReport, dates, (err, result) => {
        callback(err, result.rows);
    });
}
exports.getGenreReport = (dates, callback) => {
    db.query(genreReport, dates, (err, result) => {
        callback(err, result.rows);
    });
}
exports.getAuthorReport = (dates, callback) => {
    db.query(authorReport, dates, (err, result) => {
        callback(err, result.rows);
    });
}