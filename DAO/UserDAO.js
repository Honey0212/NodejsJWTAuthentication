var mysql = require('mysql');
var connection = mysql.createPool({
    connectionLimit: 100,
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12244770',
    password: 'UnzuUxJ4lQ',
    database: 'sql12244770',
    port: 3306,
    debug: false,
    multipleStatements: true
});
module.exports.connection = connection;