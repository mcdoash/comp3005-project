const db = require("./");

const checkPub = "SELECT COUNT(*) AS Exists FROM Publisher WHERE Name = $1;";

//get array of all publisher names that start with a specific string
exports.getPubMatch = (name, callback) => {
    const pubMatch = "SELECT ARRAY_AGG(Name) Names FROM Publisher WHERE LOWER(Name) LIKE LOWER('" + name + "%')";

    db.query(pubMatch, (err, result) => {
        callback(err, result.rows[0].names);
    });
}

exports.checkPub = (name, callback) => {
    db.query(checkPub, [name], (err, result) => {
        callback(err, result.rows[0].exists);
    });
}