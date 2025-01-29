const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'neuro'
});

db.connect((err) => {
    if (err) {
        console.error("Error Connecting: ", err);
    } else {
        console.log('Connected to MySQL Database');
    }
});

module.exports = db;
