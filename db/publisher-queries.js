const db = require("./");

const checkPub = "SELECT COUNT(*) AS Exists FROM Publisher WHERE Name = $1;";

const newPub = "INSERT INTO Publisher VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);";

exports.addPub = (data, callback) => {
    db.query(newPub, data, (err) => {
        callback(err);
    });
}

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