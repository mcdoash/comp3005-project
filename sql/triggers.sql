/*VIEWS*/
--update storefront view when book updated (includes remove from store) or added
CREATE OR REPLACE FUNCTION update_store()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
	AS 
$$
BEGIN
	REFRESH MATERIALIZED VIEW Storefront;
	RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER update_store
    AFTER INSERT OR UPDATE ON Book
    FOR EACH STATEMENT
    EXECUTE PROCEDURE update_store();
	


/*STOCK*/
--update book stock on order sale
CREATE OR REPLACE FUNCTION change_book_stock()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
	AS 
$$
DECLARE
	curr_stock integer;
BEGIN
	SELECT Stock
	INTO curr_stock
	FROM Book
	WHERE Book.ISBN = NEW.Book;
	
	IF ((curr_stock - NEW.Quantity) < 0) THEN --cannot finish order
		DELETE FROM Book_order 
		WHERE Number = New.Order_num;
		RAISE EXCEPTION 'Not enough stock'; 
    ELSE
		UPDATE Book
		SET Stock = (Stock - NEW.Quantity),
			Copies_sold = Copies_sold + NEW.Quantity
		WHERE Book.ISBN = NEW.Book;
	END IF;
	RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER change_stock
    AFTER INSERT ON Sale
    FOR EACH ROW
    EXECUTE PROCEDURE change_book_stock();



--if a sale is deleted (due to incomple/error order)
--then the stock needs to be fixed 
CREATE OR REPLACE FUNCTION fix_stock()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
	AS 
$$
BEGIN
	UPDATE Book
	SET Stock = (Stock + OLD.Quantity),
		Copies_sold = Copies_sold - OLD.Quantity
	WHERE Book.ISBN = OLD.Book;
	RETURN OLD;
END;
$$;

CREATE OR REPLACE TRIGGER fix_stock
    AFTER DELETE ON Sale
    FOR EACH ROW
    EXECUTE PROCEDURE fix_stock();



--"order" new books when stock under 10
CREATE OR REPLACE FUNCTION order_stock()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
	AS 
$$
DECLARE 
	pubEmail CHAR(30);
	toOrder INTEGER;
	monthAgo DATE = (CURRENT_DATE - interval '1 month')::date;
BEGIN
	--get pub email
	SELECT Email
	INTO pubEmail
	FROM Book JOIN Publisher ON Book.Publisher = Publisher.Name
	WHERE Book.ISBN = NEW.ISBN;

	--get # of book sold within the last 30 days
	SELECT Total_sales
	INTO toOrder
	FROM get_book_report(monthAgo, CURRENT_DATE)
	WHERE Book = NEW.ISBN;
	toOrder = COALESCE(toOrder, 0); --zero if null
	
	--assume a minimum amount of books must be ordered
	--in order to exceed the threshold
	IF((NEW.Stock + toOrder) < 10) THEN 
		toOrder = (10 - NEW.Stock);
	END IF;
	
	--send email to pub using pubEmail, perhaps using a python function
	--EXECUTE send_email(pubEmail, stockToSend);
	RAISE NOTICE 'Ordered % of % via %', toOrder, NEW.ISBN, pubEmail;
	
	--update stock
	UPDATE Book
	SET Stock = (Stock + toOrder) 
	WHERE ISBN = NEW.ISBN;
	RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER order_stock
    AFTER UPDATE OF Stock ON Book
    FOR EACH ROW
	WHEN (NEW.Stock < 10) --threshold
    EXECUTE PROCEDURE order_stock();



/*ORDERS*/
--check contraint that the accounts in a book order & 
--its address and card attributes must be the same
CREATE OR REPLACE FUNCTION check_order_accounts()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
	AS 
$$
BEGIN
    IF NEW.Account NOT IN (
	  SELECT Address.Account
	  FROM Address JOIN Card ON Address.Account = Card.Account
	  WHERE Address.ID = NEW.Ship_address AND 
			Card.Card_id = NEW.Billing
	)
	THEN RAISE EXCEPTION 'Accounts for order, billing, and ship address do not match';
	END IF;
	RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER order_insert
    BEFORE INSERT ON Book_order
    FOR EACH ROW
    EXECUTE PROCEDURE check_order_accounts();



--ensure card address account same as card account
CREATE OR REPLACE FUNCTION check_card_accounts()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
	AS 
$$
BEGIN
    IF NEW.Account NOT IN (
	  SELECT Address.Account
	  FROM Address
	  WHERE Address.ID = NEW.Address
	)
	THEN RAISE EXCEPTION 'Accounts for card and address do not match';
	END IF;
	RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER card_insert
    BEFORE INSERT ON Card
    FOR EACH ROW
    EXECUTE PROCEDURE check_card_accounts();