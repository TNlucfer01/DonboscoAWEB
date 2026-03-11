const mysql2 = require("mysql2");
const connection = mysql2.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "donbosco_attendance"
});

module.exports = connection;