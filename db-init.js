const faker = require("faker");

//non-escaped single quotes will break queries. check sting for these and escape if found
function checkQuotes(str) {
    return str.replace("'", "''");
}


//Publisher table
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
publisherList = publisherList.join()


//Contact table
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


//Phone_num table
let numList = [];
phoneNums.forEach((num) => {
    numList.push("('" + num + "','" + pubNames[Math.floor(Math.random() * pubNames.length)] + "','" + faker.name.jobType() + "')");
});
numList = numList.join();



//Book table
let bookList = [];
let isbns = [];
let formats = ["Paperback", "Hardcover"];
for(let i=0; i<50; i++) {
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
bookList = bookList.join();

function randIsbn() {
    let randIsbn = [];
    for(let x=0; x<10; x++) {
        randIsbn[x] = Math.floor(Math.random() * 10);
    }
    return randIsbn.join("");
}



//Genre and Authored tables
let genreList = [];
let genreOpts = ["Fantasy", "Science Fiction", "Mystery", "Horror", "Speculative Fiction", "Historical Fiction", "Romance", "Graphic Novel", "Young Adult", "Children''s", "Memoir", "Biography", "Food and Drink", "Photography", "History", "Travel", "True Crime",  "Technology"]; //from https://blog.reedsy.com/book-genres/  non-fiction vs. fiction??

let authorList = [];
let authorNames = [];

isbns.forEach((book) => {
    let genreNum = Math.floor(Math.random() * 3) + 1;
    let thisGenres = [];

    //make genres
    for(let i=0; i<genreNum; i++) {
        let newGenre = genreOpts[Math.floor(Math.random() * genreOpts.length)];
        while(thisGenres.includes(newGenre)) {
            newGenre = genreOpts[Math.floor(Math.random() * genreOpts.length)];
        }
        thisGenres.push(newGenre);
        genreList.push("('" + newGenre + "','" + book + "')");
    }

    //make authors
    let authorNum = Math.floor(Math.random() * 4) + 1;
    let thisAuthors = [];
    for(let i=0; i<authorNum; i++) {
        //decided if a new author should be created or an existing one used
        let sameAuth = Math.floor(Math.random() * 4);
        let newAuth = "";

        if(sameAuth == 0 && authorNames.length > authorNum) { //use pre-existing
            newAuth = authorNames[Math.floor(Math.random() * authorNames.length)];
            while(thisAuthors.includes(newAuth)) {
                newAuth = authorNames[Math.floor(Math.random() * authorNames.length)];
            }
        }
        else { //make new
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
genreList = genreList.join();
authorList = authorList.join();


//Account table
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



//Address, Card, Book_order and Sale tables
let addressList = [];
let cardList = [];

let orderList = [];
let locationOpts = ["DEFAULT", "'Destination'", "'Warehouse'", "'Local Postal Office'"];
let saleList = [];

userEmails.forEach((user) => {
    let thisCards = [];

    //make addresses
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
                addressList.length + ")" 
            );

            //make orders
            let orderAmount = Math.floor(Math.random() * 6);
            for(let i=1; i<orderAmount; i++) {
                let bookNum = Math.floor(Math.random() * 14) + 1;
                let thisBooks = [];

                let orderTotal = faker.commerce.price(5 * bookNum, 100 * bookNum, 2);//fix to actual total

                //create sales
                for(let x=0; x<bookNum; x++) {
                    //get book to add to order
                    let newIsbn = isbns[Math.floor(Math.random() * isbns.length)];
                    while(thisBooks.includes(newIsbn)) {
                        newIsbn = isbns[Math.floor(Math.random() * isbns.length)];
                    }
                    thisBooks.push(newIsbn);

                    saleList.push(
                        "('" + newIsbn + "'," + 
                        (orderList.length + 1) + "," +
                        (Math.floor(Math.random() * 4) + 1) + ")"
                    );
                }

                //create order dates
                let currLocation = locationOpts[Math.floor(Math.random() * locationOpts.length)];
                let orderDate = (faker.date.between("2022-01-01T00:00:00.000Z", "2022-12-09T00:00:00.000Z")).toISOString();

                let arrival, expected;
                if(currLocation == "'Destination'") {
                    arrival = "'" + (faker.date.between(orderDate, faker.date.soon(20, orderDate))).toISOString() + "'";
                    expected = arrival;
                }
                else {
                    arrival = "NULL";
                    expected = "'" + (faker.date.soon(10)).toISOString() + "'";
                }

                orderList.push(
                    "(DEFAULT,'" + 
                    user + "'," +
                    orderTotal + "," +
                    cardList.length + "," +
                    addressList.length + ",'" +
                    orderDate + "','" +
                    "https://tracking-site.com/track/" + (orderList.length + 1) + "'," +
                    currLocation + "," +
                    expected + "," +
                    arrival + ")"
                );
            }
        }
    }
});
addressList = addressList.join();
cardList = cardList.join();
orderList = orderList.join();
saleList = saleList.join();



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
        "INSERT INTO Publisher VALUES" + publisherList + ";" +
        "INSERT INTO Contact VALUES" + contactList + ";" +
        "INSERT INTO Phone_num VALUES" + numList + ";" +
        "INSERT INTO Book VALUES" + bookList + ";" +
        "INSERT INTO Genre VALUES" + genreList + ";" +
        "INSERT INTO Authored VALUES" + authorList + ";" +
        "INSERT INTO Account VALUES" + userList + ";" +
        "INSERT INTO Address VALUES" + addressList + ";" +
        "INSERT INTO Card VALUES" + cardList + ";" +
        "INSERT INTO Book_order VALUES" + orderList + ";" +
        "INSERT INTO Sale VALUES" + saleList + ";";
    //console.log(addQuery);

    db
      .query(addQuery)
      .then(res => {
          console.log("Database populated successfully");
          db.end();
          //check();
      })
      .catch(err => {
          console.error(err.stack);
          db.end();
      })
}

function check() {
    const checkQuery = "SELECT Card_id FROM Card";
    db
      .query(checkQuery)
      .then(res => {
          console.log(res.rows);
      })
      .catch(err => console.error(err.stack))
      .then(() => db.end())
}