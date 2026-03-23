const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'donbosco_attendance',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    port: Number(process.env.DB_PORT) || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 50,        // supports ~200 concurrent users (rule: ~25% of users)
      min: 5,         // keep a warm pool ready at all times
      acquire: 20000, // fail fast (20s) instead of queuing forever
      idle: 10000,
    },
  }
);

module.exports = sequelize;