--$# represents values entered in by user

/*BOOK*/
--get top 20 books 
SELECT Storefront.ISBN, Storefront.Title, Storefront.Cover, 
	   ARRAY_AGG(DISTINCT Authored.Author) Authors, 
	   Storefront.Price, Storefront.inStock 
FROM Storefront 
JOIN Authored ON Storefront.ISBN = Authored.Book 
GROUP BY Storefront.ISBN, Storefront.Title, Storefront.Cover, 
		 Storefront.Price, Storefront.inStock 
LIMIT 20;

--get a specific book
SELECT Storefront.*, ARRAY_AGG(DISTINCT Authored.Author) Authors, 
	   ARRAY_AGG(DISTINCT Genre.Name) Genres 
FROM Storefront JOIN Authored ON Storefront.ISBN = Authored.Book 
				JOIN Genre ON Storefront.ISBN = Genre.Book 
WHERE Storefront.ISBN = $1 
GROUP BY Storefront.ISBN, Storefront.Title, Storefront.Cover, 
		 Storefront.Publisher, Storefront.Blurb, Storefront.Price, 
		 Storefront.page_num, Storefront.Book_format, 
		 Storefront.Release_date, Storefront.inStock;

--create a new book 
INSERT INTO Book 
VALUES('1234567890', 'Title', 'linkToCover', 'Publisher Name', 'Book description', 25.50, 200, 'Hardcover', 2022-01-01, DEFAULT, 100, 0.05, TRUE) 
RETURNING ISBN;

--check if a book wiht isbn exists
SELECT COUNT(*) AS Exists 
FROM Book 
WHERE ISBN = $1;

--get the stock of a specific book
SELECT Stock FROM Book WHERE ISBN = $1;

--remove a book from the storefront
UPDATE Book SET Selling = FALSE WHERE Book.ISBN = $1;

--restore a book to the storefront
UPDATE Book SET Selling = TRUE WHERE Book.ISBN = $1;

--add new genres to book 
INSERT INTO Genre 
VALUES ('Fantasy', '1234567890'),
	   ('genreName', 'isbn'),
	   ...;

--add new authors to book 
INSERT INTO Authored 
VALUES ('John Doe', '1234567890'),
	   ('authorName', 'isbn'),
	   ...;

--delete a book (on author or genre insert error) 
DELETE FROM Book WHERE Book.ISBN = $1;

--get books based on search params. example with max params
SELECT Storefront.ISBN, Storefront.Title, Storefront.Cover, 
	   ARRAY_AGG(DISTINCT Authored.Author) Authors, 
	   Storefront.Price, Storefront.inStock 
FROM Storefront JOIN Authored ON Storefront.ISBN = Authored.Book 
				JOIN Genre ON Storefront.ISBN = Genre.Book 
WHERE Storefront.ISBN = '0017317055' AND 
	  Storefront.Price >= '10.00' AND 
	  Storefront.Price <= '52.50' AND 
	  Storefront.Publisher ~* '\m(Wuckert Group Inc)' AND 
	  Genre.Name ~* '\m(Fantasy)' AND 
	  Storefront.ISBN IN (
		  SELECT Storefront.ISBN 
		  FROM Storefront JOIN Authored ON Storefront.ISBN = Authored.Book 
		  WHERE Authored.Author ~* '(\mBeth Dooley)'
	  ) AND 
	  Title ~* '\m(Star)\M' AND 
	  Book_format ~* '\m(Hardcover)' 
GROUP BY Storefront.ISBN, Storefront.Title, Storefront.Cover, 
		 Storefront.Price, Storefront.inStock 
LIMIT 20 OFFSET 0;

--get the stock of a list of books 
SELECT ISBN, Stock 
FROM Book 
WHERE ISBN IN ('1234567890', 'isbn2', ...);

--get the current status of a list of books (stock, price, sellinmg)
SELECT ISBN, Price, Stock, Selling 
FROM Book 
WHERE ISBN IN ('1234567890', 'isbn2', ...);

--get a list of all authors that match given name (word boundary search) ex. will get "May Doe" anf "John Mayor"
SELECT ARRAY_AGG(DISTINCT Author) Names 
FROM Authored 
WHERE Author ~* '\m(may)';


--get a list of all genres that match given name (word boundary search)
SELECT ARRAY_AGG(DISTINCT Name) Names 
FROM Genre 
WHERE Name ~* '\m($1)';



/*PUBLISHER*/
--check if publisher with given name exists
SELECT COUNT(*) AS Exists FROM Publisher WHERE Name = $1;

--create new publisher
INSERT INTO Publisher VALUES('Publisher Name', 'email@publisher.com', 'Address Name', '123 Lane Street', 'City', 'ON', 'A1B3C4', 'Canada', '123-456-7890', 'Account Name', '123456678');

--get a list of all publishers that match query
SELECT ARRAY_AGG(Name) Names 
FROM Publisher 
WHERE Name ~* '\m($1)';



/*ACCOUNT*/
--check if account with given email exists
SELECT COUNT(*) as exists FROM Account WHERE Email = $1;

--create new account
INSERT INTO Account VALUES('email@example.com', 'Fname', 'lname', 'password');

--check login attempt
SELECT COUNT(*) as success 
FROM Account 
WHERE Email = $1 AND Password = $2;

--get user info (full name)
SELECT (Fname || ' ' || Lname) AS Name 
FROM Account 
WHERE Email = $1;

--create a new address for the account
INSERT INTO Address 
VALUES(DEFAULT, 'email@example.com', 'fname', 'lname', 'Street', 'city', 'PR', 'Postal', 'Country', '123-456-7890') 
RETURNING ID;

--create a new card for the account
INSERT INTO Card 
VALUES(DEFAULT, 'email@example.com', '1234567890123456', 'Name', 2023-04-01, '345', 7) 
RETURNING Card_id;

--get all of an account's addresses
SELECT ID, Fname, Lname, Street 
FROM Address 
WHERE Address.Account = $1;

--get all of an accounts cards
SELECT Card_id, name, 
	   '************' || SUBSTRING(Card_num, 12, 16) AS Card_num 
FROM Card 
WHERE Card.Account = $1;



/*ORDERS*/
--create a new order
INSERT INTO Book_order 
VALUES(DEFAULT, 'email@example.com', 25.46, 9, 4, DEFAULT, NULL, DEFAULT, NULL, NULL) 
RETURNING Number;

--create new sales for an order
INSERT INTO Sale 
VALUES ('123456789', 8, 2, 20),
	   ('isbn', number, quantity, price * quantity),
	   ...;


--delete an order
DELETE FROM Book_Order WHERE Number = $1;

--get order data by number
SELECT Book_order.Number, Book_order.total, Book_order.Order_date, 
	   Book_order.Tracking, Book_order.Cur_location, 
	   Book_order.Expected_date, Book_order.Arrival_date, Address.Fname, 
	   Address.Lname, Address.Street, Address.City, Address.Province, 
	   Address.Postal_code, Address.Country, Address.Phone_num, 
	   '************' || SUBSTRING(Card_num, 12, 16) AS Card_num 
FROM Book_order JOIN Card ON Book_order.Billing = Card.Card_id 
				JOIN Address ON Book_order.Ship_address = Address.ID 
WHERE Book_order.Number = $1;

--get the books in an order
SELECT Book.ISBN, Book.Title, (Sale.Price/Sale.Quantity) AS Price, 
	   Sale.Quantity 
FROM Sale JOIN Book_order ON Sale.Order_num = Book_order.Number 
		  JOIN Book ON Sale.Book = Book.ISBN 
WHERE Book_order.Number = $1;

--get all of an accounts orders
SELECT Number, Order_date, Total, (Arrival_date IS NULL) AS inProgress 
FROM Book_order 
WHERE Account = $1 
ORDER BY inProgress DESC, Order_date DESC;



/*REPORTS*/
--get a report grouped by book from date 1 to date 2
SELECT * FROM get_book_report(2022-11-01, 2022-12-01);

--get a report grouped by genre from date 1 to date 2
SELECT * FROM get_genre_report($1, $2);

--get a report grouped by author from date 1 to date 2
SELECT * FROM get_author_report($1, $2);