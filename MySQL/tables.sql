SELECT "CREATING USERS TABLE";

CREATE TABLE users (
  id                 			int(11) PRIMARY KEY AUTO_INCREMENT,
  first_name               		varchar(100) NOT NULL,
  last_name               		varchar(100),
  email						    varchar(100) NOT NULL UNIQUE,
  password		              	varchar(50),
  created             			datetime NOT NULL
);

CREATE INDEX email_index ON users (email);

SELECT "CREATING USER_STATUS TABLE";

CREATE TABLE user_status (
  id                 			int(11) PRIMARY KEY AUTO_INCREMENT,
  userId               			int(11) NOT NULL UNIQUE,
  token		               		varchar(500),
  refresh_token				    varchar(100),
  status		              	varchar(50)
);



 