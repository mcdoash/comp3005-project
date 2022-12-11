/*ORDERS*/
--calculate an order's total
--used right now solely for updating fake data totals 
--as order totals are calculated on checkout via cart
CREATE OR REPLACE FUNCTION get_order_total(order_number int)
    RETURNS numeric
    LANGUAGE PLPGSQL
	AS 
$$
DECLARE
	Order_total integer;
BEGIN
	SELECT SUM(Sale.Price)
	INTO Order_total
	FROM Sale JOIN Book_order ON Sale.Order_num = Book_order.Number
	WHERE Book_order.Number = order_number;

	RETURN Order_total;
END;
$$;



/*REPORTS*/
--basic sales report table
CREATE OR REPLACE FUNCTION get_sales_report(from_date DATE, to_date DATE)
    RETURNS TABLE (
		Purchased CHAR,
		Units_sold SMALLINT,
		Total_revenue numeric(4, 2),
		Total_profit numeric(4, 2),
		Total_lost numeric(4, 2)
	)
    LANGUAGE PLPGSQL
	AS 
$$
BEGIN
	RETURN query
    SELECT Book.ISBN AS Purchased, Sale.Quantity AS Units_sold, 
		   Sale.Price AS Total_revenue, 
		   ((Sale.Price - (Sale.Price * Book.Sale_Percent)) AS Total_profit,
		   (Sale.Price * Book.Sale_Percent) AS Total_lost
	FROM Sale JOIN Book ON Sale.Book = Book.ISBN
		  	  JOIN Book_order ON Sale.Order_num = Book_order.Number
	WHERE Order_date >= from_date AND Order_date <= to_date;
END;
$$;

--report of sales per book
CREATE OR REPLACE FUNCTION get_book_report(from_date DATE, to_date DATE)
    RETURNS TABLE (
		Book CHAR(10),
		Total_sales BIGINT,
		Total_revenue numeric(4, 2),
		Total_profit numeric(4, 2),
		Profit_lost numeric(4, 2)
	)
    LANGUAGE PLPGSQL
	AS 
$$
BEGIN
	RETURN query
    SELECT r.Purchased, 
		   SUM(r.Units_sold) AS Total_sales, 
		   SUM(r.Total_revenue) AS Total_revenue, 
		   SUM(r.Total_profit) AS Total_profit,
		   SUM(r.Total_lost) AS Profit_lost
	FROM get_sales_report(from_date, to_date) r
	GROUP BY r.Purchased
	ORDER BY Total_sales DESC;
END;
$$;

--report of sales per genre
CREATE OR REPLACE FUNCTION get_genre_report(from_date DATE, to_date DATE)
    RETURNS TABLE (
		Genre VARCHAR,
		Total_sales BIGINT,
		Total_revenue numeric(4, 2),
		Total_profit numeric(4, 2),
		Profit_lost numeric(4, 2)
	)
    LANGUAGE PLPGSQL
	AS 
$$
BEGIN
	RETURN query
	SELECT Genre.Name, 
		   SUM(r.Units_sold) AS Total_sales, 
		   SUM(r.Total_revenue) AS Total_revenue, 
		   SUM(r.Total_profit) AS Total_profit,
		   SUM(r.Total_lost) AS Profit_lost
	FROM Book JOIN Genre ON Book.ISBN = Genre.Book
			  JOIN get_sales_report(from_date, to_date) r ON Book.ISBN = r.Purchased
	GROUP BY Genre.Name
	ORDER BY Total_sales DESC;
END;
$$;

--report of sales per author
CREATE OR REPLACE FUNCTION get_author_report(from_date DATE, to_date DATE)
    RETURNS TABLE (
		Author VARCHAR,
		Total_sales BIGINT,
		Total_revenue numeric(4, 2),
		Total_profit numeric(4, 2),
		Profit_lost numeric(4, 2)
	)
    LANGUAGE PLPGSQL
	AS 
$$
BEGIN
	RETURN query
	SELECT Authored.Author, 
		   SUM(r.Units_sold) AS Total_sales, 
		   SUM(r.Total_revenue) AS Total_revenue, 
		   SUM(r.Total_profit) AS Total_profit,
		   SUM(r.Total_lost) AS Profit_lost
	FROM Book JOIN Authored ON Book.ISBN = Authored.Book
			  JOIN get_sales_report(from_date, to_date) r ON Book.ISBN = r.Purchased
	GROUP BY Authored.Author
	ORDER BY Total_sales DESC;
END;
$$;