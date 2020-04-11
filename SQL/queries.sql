--Creating new customer account
insert into account(username, password)
    values('username', 'password', 'customer');

--Checking if a username already exists
select * from account 
where uesrname = 'username';

--Verifying username and password
select * from account
where username = 'username' and password = 'password';

--Different book search queries:

--Search book by title and genre (Case insensitive, subset of whole string)
select ISBN, publisher_name, title, author, genre, num_pages, price
from book 
where title ilike '%title%' and genre = 'genre';

--Search book by publisher and genre (Case insensitive, subset of whole string)
select ISBN, publisher_name, title, author, genre, num_pages, price
from book 
where publisher ilike '%publisher%' and genre = 'genre';

--Search book by author and genre (Case insensitive, subset of whole string)
select ISBN, publisher_name, title, author, genre, num_pages, price
from book 
where author ilike '%author%' and genre = 'genre';

--Search book by ISBN (exact match) and genre
select ISBN, publisher_name, title, author, genre, num_pages, price
from book 
where ISBN = 'ISBN' and genre = 'genre';

--NOTE: above 3 queries can search for books based off title, publisher, author
--      or ISBN only (without genre) by simply removing 'and genre = 'genre''


--Checking out books by ISBN
insert into checkout_basket(username, ISBN)
    values('username', 'ISBN');

--Getting all books in checkout basket
select ISBN 
from checkout_basket 
where username = 'username';