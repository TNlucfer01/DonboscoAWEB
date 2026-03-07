const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
    throw new Error(`Could not load .env file: ${result.error.message}`);
}

const required = ['DB_NAME', 'DB_USER', 'DB_PASS', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

module.exports = process.env;