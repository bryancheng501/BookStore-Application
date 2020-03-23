create table publisher
	(name varchar(30),
	 address varchar(75),
	 email varchar(75),
	 phone_number varchar(15),
	 banking_account numeric(15, 0),
	primary key (name)
	
	);

create table book
	(ISBN numeric(13, 0),
	 publisher_name varchar(30),
	 title varchar(50),
	 author varchar(30),
	 genre varchar(20),
	 num_pages numeric(4, 0),
	 price numeric(3, 2),
	 cost numeric(2, 2),
	 num_in_stock numeric(3, 0),
	 num_sold numeric(4, 0),
	 percentage_to_publishers numeric(2, 2), -- ex. 15.24%
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
