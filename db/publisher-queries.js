const db = require("./");

//queries
const checkPub = "SELECT COUNT(*) AS Exists FROM Publisher WHERE Name = $1;";
const newPub = "INSERT INTO Publisher VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);";


//create a new publisher
exports.addPub = (data, callback) => {
    db.query(newPub, data, (err) => {
        callback(err);
    });
}

//get array of all publisher names where a word in name starts with a specific string
exports.getPubMatch = (name, callback) => {
    const pubMatch = "SELECT ARRAY_AGG(Name) Names FROM Publisher WHERE Name ~* '\\m(" + name + ")';";

    db.query(pubMatch, (err, result) => {
        if(err) callback(err);
        else callback(err, result.rows[0].names);
    });
}

//check if a publisher with a given name exists
exports.checkPub = (name, callback) => {
    db.query(checkPub, [name], (err, result) => {
        if(err) callback(err);
        else callback(err, result.rows[0].exists);
    });
}