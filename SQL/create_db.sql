-- creating all relation schemas

create table publisher
	(name varchar(100),
	 address varchar(75),
	 email varchar(75),
	 phone_number varchar(15),
	 banking_account numeric(15, 0),
	 primary key (name)
	);

create table book
	(ISBN numeric(13, 0),
	 publisher_name varchar(100),
	 title varchar(200),
	 author varchar(200),
	 genre varchar(20),
	 num_pages numeric(4, 0),
	 price numeric(5, 2),
	 cost numeric(4, 2),
	 num_in_stock numeric(3, 0),
	 percentage_to_publishers numeric(4, 2), -- ex. 15.24%
	 primary key (ISBN),
	 foreign key (publisher_name) references publisher
	 	on delete set null
	);

create table account
	(username varchar(20),
	 password varchar(20),
	 type varchar(10)
	 	check (type in ('customer', 'admin', 'owner')),
	 billing_address varchar(75),
	 shipping_address varchar(75),
	 primary key (username)
	);

create table placed_order
	(order_number varchar(10),
	 cost numeric(6, 2),
	 month_ordered numeric(2, 0),
	 year_ordered numeric(4, 0),
	 location varchar(20),
	 ETA varchar(11), -- MM/DD/XX:XX
	 billing_address varchar(75),
	 shipping_address varchar(75),
	 primary key (order_number)
	);

create table checkout_basket
	(username varchar(20),
	 ISBN numeric(13, 0),
	 primary key (username, ISBN),
	 foreign key (username) references account
	 	on delete cascade,
	 foreign key (ISBN) references book
	 	on delete cascade
	);

create table user_order
	(username varchar(20),
	 order_number varchar(10),
	 primary key (username, order_number),
	 foreign key (username) references account
	 	on delete cascade,
	 foreign key (order_number) references placed_order
	 	on delete set null
	);

create table ordered_books
	(order_number varchar(10),
	 ISBN numeric(13, 0),
	 primary key (order_number, ISBN),
	 foreign key (order_number) references placed_order
	 	on delete cascade,
	 foreign key (ISBN) references book
	 	on delete cascade
	);

--copying data from CSV files

--publisher data
copy publisher(name, address, email, phone_number, banking_account)
from 'C:\Users\Public\COMP3005_Data\publisher.csv' delimiter ',' csv header; --change to proper directory

--book data
copy book(ISBN, publisher_name, title, author, genre, num_pages, price, cost, num_in_stock, percentage_to_publishers)
from 'C:\Users\Public\COMP3005_Data\book.csv' delimiter ',' csv header; --change to proper directory