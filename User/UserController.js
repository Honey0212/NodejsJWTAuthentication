var express = require("express");
var users = express.Router();
var conn = require("../DAO/UserDAO");
var cors = require("cors");
var jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
var tokenExpiryTime = 5000;
const tokenList = {};
var token;
var refreshToken;

users.use(cors());

process.env.SECRET_KEY = "honey";
process.env.REFRESH_SECRET_KEY = "chauhan";

// API to register a new user.
users.post('/register', function(req, res) {
    var now = new Date();
    var appData = {
        "error": 1,
        "data": ""
    };
    var encryptedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync());
    var userData = {
        "first_name": req.body.first_name,
        "last_name": req.body.last_name,
        "email": req.body.email,
        "password": encryptedPassword,
        "created": now
    }

    conn.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('INSERT INTO users SET ?', userData, function(err, rows, fields) {
                if (!err) {
                    appData.error = 0;
                    appData["data"] = "User " + req.body.first_name + " registered successfully!";
                    res.status(201).json(appData);
                } else {
                    appData["data"] = "Unable to insert new user to database!";
                    res.status(400).json(appData);
                }
            });
            connection.release();
        }
    });
});


// API to login an existing user.
users.post('/login', function(req, res) {
    var appData = {};
    var email = req.body.email;
    var password = req.body.password;
    conn.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows, fields) {
                if (err) {
                    appData.error = 1;
                    appData["data"] = "Error Occured while fetching user from database!";
                    res.status(400).json(appData);
                } else {
                    if (rows.length > 0) {
                        if (bcrypt.compareSync(password, rows[0].password)) {

                            token = jwt.sign(JSON.parse(JSON.stringify(rows[0])), process.env.SECRET_KEY, {
                                expiresIn: tokenExpiryTime
                            });
                            refreshToken = jwt.sign(JSON.parse(JSON.stringify(rows[0])), process.env.REFRESH_SECRET_KEY, {
                                expiresIn: tokenExpiryTime
                            });
                            tokenList[refreshToken] = appData;
                            appData.error = 0;
                            appData["token"] = token;
                            appData["expiry_time"] = tokenExpiryTime;
                            appData["refresh_token"] = refreshToken;
                            res.status(200).json(appData);
                            var userStatus = {
                                "userId": rows[0].id,
                                "token": token,
                                "refresh_token": refreshToken,
                                "status": "LOGGEDIN",
                            }
                            connection.query('INSERT INTO user_status SET ? ON DUPLICATE KEY UPDATE status=\'LOGGEDIN\',token =\'' + token + '\'', userStatus, function(err, rows, fields) {
                                if (!err) {
                                    console.log("User status successfully saved in database.");
                                } else {
                                    console.log("Unable to save user status in database.");
                                }
                            });

                        } else {

                            appData.error = 1;
                            appData["data"] = "Email and Password does not match";
                            res.status(204).json(appData);
                        }
                    } else {
                        appData.error = 1;
                        appData["data"] = "Email does not exists!";
                        res.status(204).json(appData);
                    }
                }
            });

            connection.release();
        }
    });
});

users.get('/logout', function(req, res) {
    var token = req.body.token || req.headers['token'];
    var appData = {};
    var email = req.body.email;
    conn.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('UPDATE user_status SET status = \'LOGGEDOUT\' where token =\'' + token + '\'', function(err, rows, fields) {
                if (!err) {
                    console.log("User status successfully saved in database.");
                    appData.error = 0;
                    appData["data"] = "Logout successful!";
                    res.status(400).json(appData);
                } else {
                    console.log("Unable to save user status in database.");
                }
            });
            connection.release();


        }
    });
});

//API to refresh token
users.post('/token', function(req, res) {
    // refresh the token
    // if refresh token exists
    var appData = {};
    console.log("tpkenlist " + JSON.stringify(tokenList));
    if ((req.body.refreshToken) && (req.body.refreshToken in tokenList)) {
        const email = req.body.email;

        conn.connection.getConnection(function(err, connection) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Internal Server Error";
                res.status(500).json(appData);
            } else {
                connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows, fields) {
                    if (!err) {
                        token = jwt.sign(JSON.parse(JSON.stringify(rows[0])), process.env.SECRET_KEY, {
                            expiresIn: tokenExpiryTime
                        });
                        appData["token"] = token;
                        connection.query('UPDATE user_status SET token = ? where userId =' + rows[0].id, token, function(err, rows, fields) {
                            if (!err) {
                                console.log("User status successfully saved in database.");
                            } else {
                                console.log("Unable to save user status in database.");
                            }
                        });
                        // update the token in the list
                        tokenList[req.body.refreshToken].token = token
                        res.status(200).json(appData);
                    } else {
                        appData.error = 1;
                        appData["data"] = "Error Occured while fetching user from database!";
                        res.status(400).json(appData);
                    }
                });
                connection.release();
            }
        });

    } else {
        res.status(404).send('Invalid request')
    }
})


users.use(function(req, res, next) {
    var token = req.body.token || req.headers['token'];
    var appData = {};
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err) {
            if (err) {
                appData["error"] = 1;
                appData["data"] = "Token is invalid";
                res.status(500).json(appData);
            } else {
                next();
            }
        });
    } else {
        appData["error"] = 1;
        appData["data"] = "Please send a token";
        res.status(403).json(appData);
    }
});

// API to get user details of a logged in user.
users.get('/getUserData', function(req, res) {
    var token = req.body.token || req.headers['token'];
    var appData = {};
    conn.connection.getConnection(function(err, connection) {
        if (err) {
            appData["error"] = 1;
            appData["data"] = "Internal Server Error";
            res.status(500).json(appData);
        } else {
            connection.query('SELECT * FROM users U join user_status US on U.id = US.userId WHERE token = ? ', [token], function(err, rows, fields) {
                if (!err) {
                    var user = {
                        "first name": rows[0].first_name,
                        "last name": rows[0].last_name,
                        "email address": rows[0].email
                    }
                    if (rows[0].status == "LOGGEDIN") {
                        appData["error"] = 0;
                        appData["data"] = user;
                        res.status(200).json(appData);
                    } else {
                        appData["error"] = 1;
                        appData["data"] = "Please login to view data.";
                        res.status(200).json(appData);
                    }

                } else {
                    appData["data"] = "No data found";
                    res.status(204).json(appData);
                }
            });
            connection.release();
        }
    });
});
module.exports = users;