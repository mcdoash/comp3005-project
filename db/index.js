//db connection vars
const dbVars = require("./connection.json"); 

//configure db connection
const { Pool } = require("pg");
const pool = new Pool(dbVars);

pool.on("error", (err, client) => {
    console.error("Pool error", err);
})


module.exports = {
    query: (text, values, callback) => {
        pool.connect()
            .then((client) => {
                client.release();
                return client.query(text, values, callback);
            })
            .catch((err) => {
                client.release();
                console.error("Query error", err.stack)
            })
    }
}