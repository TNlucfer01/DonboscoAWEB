const mysql2 = require("mysql2");
const connection = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "AATHI212",
    database: "donbosco_attendance"
});

module.exports = connection;