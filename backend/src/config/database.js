require('dotenv').config();
require('pg'); // Explicitly require pg for Vercel/Sequelize
const { Sequelize } = require('sequelize');


const isProduction = process.env.NODE_ENV === 'production';

const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      define: {
        timestamps: true,
        underscored: true,
      },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
        define: {
          timestamps: true,
          underscored: true,
        },
      }
    );

module.exports = sequelize;
