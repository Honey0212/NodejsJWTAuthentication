# NodejsJWTAuthentication

This project authenticates and registers user to a server made in Node.js using JWT and passport.js . The data about the user is added to MySQL database.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them

```
Node.js setup
Git
MySQL
```

### Installing

Clone this repository and install the dependencies:

```
git clone https://github.com/Honey0212/NodejsJWTAuthentication.git
cd NodejsJWTAuthentication
```

```
npm install
```

```
node server.js
```


## Running the tests

Start using the given below APIs to register/login a user.

* Register a user:
```
"url": "http://localhost:3000/users/register"
"method": POST
"headers":"Content-Type" - "application/x-www-form-urlencoded"
"body":{"first_name","last_name","email","password"}
```

* Login a user:
```
"url": "http://localhost:3000/users/login"
"method": POST
"headers":"Content-Type" - "application/x-www-form-urlencoded"
"body":{"email","password"}
```

* Get details of logged in user:
```
"url": "http://localhost:3000/users/getUserData"
"method": GET
"headers":{"token","email"}
```

* Refresh expired token:
```
"url": "http://localhost:3000/users/tokene"
"method": POST
"headers":"Content-Type" - "application/x-www-form-urlencoded"
"body":{"email","refreshToken"}
```

* Logout user:
```
"url": "http://localhost:3000/users/logout"
"method": GET
"headers":{"token","email"}
```

## Author

* **Honey Chauhan**

