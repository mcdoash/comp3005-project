const faker = require("faker");

/*Publisher table*/
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

    publisherList.push( 
        "('" + newName + "','" +
        newEmail + "','" +
        newName + "','" +
        faker.address.streetAddress() + "','" +
        faker.address.city() + "','" +
        newProv + "','" +
        faker.address.zipCodeByState(newProv) + "','" +
        "'USA','" +
        faker.phone.phoneNumber("###-###-####") + "','" +
        newName + "','" +
        faker.finance.account() + "')"
    );
}
publisherList = publisherList.join()


/*Contact table*/
let contactList = [];
let phoneNums = [];
for(let i=0; i<5; i++) {
    let newNum = faker.phone.phoneNumber("###-###-####");
    while(phoneNums.includes(newNum)) {
        newNum = faker.phone.phoneNumber("###-###-####");
    }
    phoneNums.push(newNum);

    contactList.push("('" + newNum + "','" + faker.name.findName() + "')");
}
contactList = contactList.join();


/*Phone_num table*/
let numList = [];
phoneNums.forEach((num) => {
    numList.push("('" + num + "','" + pubNames[Math.floor(Math.random() * pubNames.length)] + "','" + faker.name.jobType() + "')");
});
numList = numList.join();


let bookList = [];
let isbns = [];
let formats = ["Paperback", "Hardcover"];
for(let i=0; i<5; i++) {
    let newIsbn = randIsbn();
    while(isbns.includes(newIsbn)) {
        newIsbn = randIsbn();
    }
    isbns.push(newIsbn);

    const randYear = Math.floor(Math.random() * 75) + 1950;
    const randMonth = Math.floor(Math.random() * 13) + 1;
    const randDay = Math.floor(Math.random() * 29) + 1;
    const randDate = new Date(randYear, randMonth, randDay);

    bookList.push(
        "('" + newIsbn + "','" +
        faker.random.words() + "','" +
        faker.image.abstract() + "','" +
        pubNames[Math.floor(Math.random() * pubNames.length)] + "','" +
        faker.lorem.paragraphs() + "'," +
        faker.commerce.price(5, 150, 2) + "," +
        (Math.floor(Math.random() * 950) + 20) + ",'" +
        formats[Math.floor(Math.random() * formats.length)] + "','" +
        randDate + "," +
        Math.floor(Math.random() * 25001) + "," + 
        Math.floor(Math.random() * 5001) + "," +
        (Math.floor(Math.random() * 50) + 1) + ")"
    );
}
bookList = bookList.join();

function randIsbn() {
    let randIsbn = [];
    for(let x=0; x<10; x++) {
        randIsbn[x] = Math.floor(Math.random() * 10);
    }
    return randIsbn.join("");
}



let genreList = [];
let genreOpts = ["Fantasy", "Science Fiction", "Mystery", "Horror", "Speculative Fiction", "Historical Fiction", "Romance", "Graphic Novel", "Young Adult", "Children's", "Memoir", "Biography", "Food and Drink", "Photography", "History", "Travel", "True Crime",  "Technology"]; //from https://blog.reedsy.com/book-genres/  non-fiction vs. fiction??
let authorList = [];
let authorNames = [];
isbns.forEach((book) => {
    let genreNum = Math.floor(Math.random() * 3) + 1;
    let thisGenres = [];

    for(let i=0; i<genreNum; i++) {
        let newGenre = genreOpts[Math.floor(Math.random() * genreOpts.length)];
        while(thisGenres.includes(newGenre)) {
            newGenre = genreOpts[Math.floor(Math.random() * genreOpts.length)];
        }
        thisGenres.push(newGenre);
        genreList.push("('" + newGenre + "','" + book + "')");
    }

    let authorNum = Math.floor(Math.random() * 4) + 1;
    let thisAuthors = [];
    for(let i=0; i<authorNum; i++) {
        let sameAuth = Math.floor(Math.random() * 4);
        let newAuth = "";
        if(sameAuth == 0 && authorNames.length > authorNum) {
            newAuth = authorNames[Math.floor(Math.random() * authorNames.length)];
            while(thisAuthors.includes(newAuth)) {
                newAuth = authorNames[Math.floor(Math.random() * authorNames.length)];
            }
        }
        else {
            newAuth = faker.name.findName();
            while(authorNames.includes(newAuth)) {
                newAuth = faker.name.findName();
            }
            authorNames.push(newAuth);
        }
        thisAuthors.push(newAuth);
        authorList.push("('" + newAuth + "','" + book + "')");
    }

});
genreList = genreList.join();
authorList = authorList.join();


/*
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
}*/