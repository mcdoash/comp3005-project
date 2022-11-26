const faker = require("faker");


//non-escaped single quotes break queries later
function checkQuotes(str) {
    return str.replace("'", "''");
}


/*Publisher table*/
let publisherList = [];
let pubNames = [];
for(let i=0; i<3; i++) {
    let newName = checkQuotes(faker.company.companyName() + " " + faker.company.companySuffix());
    while(newName.length > 30 || pubNames.includes(newName)) {
        newName = checkQuotes(faker.company.companyName() + " " + faker.company.companySuffix());
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
        checkQuotes(faker.address.streetAddress()) + "','" +
        checkQuotes(faker.address.city()) + "','" +
        newProv + "','" +
        faker.address.zipCodeByState(newProv) + "'," +
        "'USA','" +
        faker.phone.phoneNumber("###-###-####") + "','" +
        newName + "','" +
        faker.finance.account() + "')"
    );
}
//console.log(publisherList);
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

    contactList.push("('" + newNum + "','" + checkQuotes(faker.name.findName()) + "')");
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

    bookList.push(
        "('" + newIsbn + "','" +
        checkQuotes(faker.random.words()) + "','" +
        faker.image.abstract() + "','" +
        pubNames[Math.floor(Math.random() * pubNames.length)] + "','" +
        checkQuotes(faker.lorem.paragraphs(2, "<br/>")) + "'," +
        faker.commerce.price(5, 150, 2) + "," +
        (Math.floor(Math.random() * 950) + 20) + ",'" +
        formats[Math.floor(Math.random() * formats.length)] + "','" +
        faker.date.between("1930-01-01T00:00:00.000Z", "2025-01-01T00:00:00.000Z").toISOString() + "'," +
        Math.floor(Math.random() * 25001) + "," + 
        Math.floor(Math.random() * 5001) + "," +
        (Math.floor(Math.random() * 50) + 1) + ")"
    );
}
//console.log(bookList);
bookList = bookList.join();

function randIsbn() {
    let randIsbn = [];
    for(let x=0; x<10; x++) {
        randIsbn[x] = Math.floor(Math.random() * 10);
    }
    return randIsbn.join("");
}



let genreList = [];
let genreOpts = ["Fantasy", "Science Fiction", "Mystery", "Horror", "Speculative Fiction", "Historical Fiction", "Romance", "Graphic Novel", "Young Adult", "Children''s", "Memoir", "Biography", "Food and Drink", "Photography", "History", "Travel", "True Crime",  "Technology"]; //from https://blog.reedsy.com/book-genres/  non-fiction vs. fiction??
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
            newAuth = checkQuotes(faker.name.findName());
            while(authorNames.includes(newAuth)) {
                newAuth = checkQuotes(faker.name.findName());
            }
            authorNames.push(newAuth);
        }
        thisAuthors.push(newAuth);
        authorList.push("('" + newAuth + "','" + book + "')");
    }

});
//console.log(genreList);
//console.log(authorList);
genreList = genreList.join();
authorList = authorList.join();


let userList = [];
let userEmails = [];
for(let i=0; i<5; i++) {
    const fName = checkQuotes(faker.name.firstName());
    const lName = checkQuotes(faker.name.lastName());
    let newEmail = faker.internet.email(fName, lName);
    while(newEmail.length > 30 || userEmails.includes(newEmail)) {
        newEmail = faker.internet.email(fName, lName);
    }
    userEmails.push(newEmail);

    userList.push(
        "('" + newEmail + "','" +
        fName + "','" +
        lName + "')"
    );
}
userList = userList.join();


let addressList = [];
let addressId = 0;

let cardList = [];
userEmails.forEach((user) => {
    let thisCards = [];
    const addressNum = Math.floor(Math.random() * 3);
    for(let i=0; i<addressNum; i++) {
        const newProv = faker.address.stateAbbr();
        addressList.push( 
            "(DEFAULT,'" + 
            user + "','" +
            checkQuotes(faker.name.firstName()) + "','" +
            checkQuotes(faker.name.lastName()) + "','" +
            checkQuotes(faker.address.streetAddress()) + "','" +
            checkQuotes(faker.address.city()) + "','" +
            newProv + "','" +
            faker.address.zipCodeByState(newProv) + "'," +
            "'USA','" +
            faker.phone.phoneNumber("###-###-####") + "')"
        );
        addressId++;

        //make cards
        let addCard = Math.floor(Math.random() * 5);
        if(addCard) {
            let newCard = faker.finance.creditCardNumber("################");
            while(thisCards.includes(newCard)) {
                newCard = faker.finance.creditCardNumber("################");
            }
            cardList.push(
                "(DEFAULT,'" + 
                user + "','" +
                newCard + "','" +
                checkQuotes(faker.name.findName()) + "','" +
                faker.date.between("2023-01-01T00:00:00.000Z", "2027-01-01T00:00:00.000Z").toISOString() + "'," +
                parseInt(faker.finance.creditCardCVV()) + "," + 
                addressId + ")" 
            );
        }
    }
});
//console.log(addressList);
addressList = addressList.join();
//console.log(cardList);
cardList = cardList.join();




const { Client } = require("pg");
let db = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "testPassword",
    database: "Project"
});
db
  .connect()
  .then(() => {
      console.log("Database connected");
      clearData();
  })
  .catch(err => console.error("Cannot connect to the database", err.stack))
  
function clearData() {
    const delQuery = "TRUNCATE TABLE Publisher, Contact, Book, Account RESTART IDENTITY CASCADE;";
    db
      .query(delQuery)
      .then(() => addData())
      .catch(err => console.error(err.stack))
}

function addData() {
    const addQuery = 
        //"INSERT INTO Publisher VALUES" + publisherList + ";" +
        //"INSERT INTO Contact VALUES" + contactList + ";" +
        //"INSERT INTO Phone_num VALUES" + numList + ";" +
        //"INSERT INTO Book VALUES" + bookList + ";" +
        //"INSERT INTO Genre VALUES" + genreList + ";" +
        //"INSERT INTO Authored VALUES" + authorList + ";" +
        "INSERT INTO Account VALUES" + userList + ";" +
        "INSERT INTO Address VALUES" + addressList + ";" +
        "INSERT INTO Card VALUES" + cardList + ";" ;//+
        //"INSERT INTO Book_order VALUES" + orderList + ";" +
        //"INSERT INTO Sale VALUES" + csaleList + ";"
        //" RETURNING *";
    //const query = "";
    //const query = "INSERT INTO Publisher VALUES" + publisherList + " RETURNING *";
    //const query = "SELECT * FROM Publisher LIMIT 1";

    console.log(addQuery);

    db
      .query(addQuery)
      .then(res => {
          console.log(res.rows);
          //check();
      })
      .catch(err => {
          console.error(err.stack);
          db.end();
      })
}

function check() {
    const checkQuery = "SELECT ID FROM Address";
    db
      .query(checkQuery)
      .then(res => {
          console.log(res.rows);
      })
      .catch(err => console.error(err.stack))
      .then(() => db.end())
}