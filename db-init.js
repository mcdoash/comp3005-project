const faker = require("faker");


let publisherList = [];
let pubNames = [];
for(let i=0; i<3; i++) {
    let newName = faker.company.companyName() + " " + faker.company.companySuffix();
    while(newName.length > 30 || pubNames.includes(newName)) {
        newName = faker.company.companyName() + " " + faker.company.companySuffix();
    }
    pubNames.push(newName);

    let newEmail = faker.internet.email();
    while(newEmail.length > 30) {
        newEmail = faker.internet.email();
    }

    let newProv = faker.address.stateAbbr();

    let newPub = 
        "('" + newName + "'," +
        "'" + newEmail + "'," +
        "'" + newName + "'," +
        "'" + faker.address.streetAddress() + "'," +
        "'" + faker.address.city() + "'," +
        "'" + newProv + "'," +
        "'" + faker.address.zipCodeByState(newProv) + "'," +
        "'USA'," +
        "'" + faker.phone.phoneNumber("###-###-####") + "'," +
        "'" + newName + "'," +
        "'" + faker.finance.account() + "')"
    ;
    publisherList.push(newPub);
}
publisherList = publisherList.join()
console.log(publisherList);


const { Client } = require("pg");
let db = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "testPassword",
    database: "Project"
});
db.connect((err) => {
    if(err) {
        console.error("Cannot connect to the database", e.stack);
    }
    else {
        console.log("Connection established");
        addPub();
    }
});

function addPub() {
    const query = "INSERT INTO Publisher VALUES" + publisherList + " RETURNING *";

    console.log(query.text);
    db.query(query, (err, res) => {
        if(err) throw err;
        console.log(res.rows);
        db.end()
    });
}