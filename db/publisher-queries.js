const db = require("./");

//get array of all publisher names that start with a specific string
exports.getPubMatch = (name, callback) => {
    const pubMatch = "SELECT ARRAY_AGG(Name) Names FROM Publisher WHERE LOWER(Name) LIKE LOWER('" + name + "%')";

    db.query(pubMatch, (err, result) => {
        callback(err, result.rows[0].names);
    });
}