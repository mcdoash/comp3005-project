const faker = require("faker");

/*
const { Client } = require("pg");
let db = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "testPassword",
    database: "Project"
});

let provs = {
    "T": "AB", 
    "V": "BC", 
    "R": "MB", 
    "B": "NB", 
    "A": "NL", 
    "X": "NT", 
    "B": "NS", 
    "ON", "PE", "QC", "SK", "YT"
}*/

let publisherList = [];
let pubNames = [];
for(let i=0; i<100; i++) {
    let newName = faker.company.companyName() + " " + faker.company.companySuffix();
    while(pubNames.includes(newName)) {
        newName = faker.company.companyName() + " " + faker.company.companySuffix()
    }
    pubNames.push(newName);

let newProv = faker.address.stateAbbr();

    let newPub = {
        name: newName,
        email: faker.internet.email(),
        address_name: newName,
        address_street: faker.address.streetAddress(),
        address_city: faker.address.city(),
        address_prov: newProv,
        address_postal: faker.address.zipCodeByState(newProv),
        address_country: "USA",
        address_phone: faker.phone.phoneNumber("###-###-####"),
        account_name: newName,
        account_num: faker.finance.account()
    }
    publisherList.push(newPub);
}
console.log(publisherList);

console.log(getPostal());
function getPostal() {
    //(?!.*[DFIOQU])[A-VXY][0-9][A-Z] [0-9][A-Z][0-9]
    let chars = ['A', 'B', 'C', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
    let postal = [];

    postal[0] = chars[Math.floor(Math.random() * chars.length)];;
    while(postal[0] == 'W' || postal[0] == 'Z')
        postal[0] = chars[Math.floor(Math.random() * chars.length)];

    postal[1] = Math.floor(Math.random() * 10);
    postal[2] = chars[Math.floor(Math.random() * chars.length)];
    postal[3] = ' ';
    postal[4] = Math.floor(Math.random() * 10);
    postal[5] = chars[Math.floor(Math.random() * chars.length)];
    postal[6] = Math.floor(Math.random() * 10);

    return postal.join("");
}

/*
db.connect((err) => {
    if(err) {
        console.error("Cannot connect to the database", e.stack);
    }
    else {
        console.log("Connection established");
        app.listen(3000);
        console.log("Server running on port 3000");
        testDb();
    }
});*/