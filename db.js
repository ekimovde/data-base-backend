const { Sequelize } = require("sequelize");

module.exports = new Sequelize(
  process.env.DB_NAME, // Название БД
  process.env.DB_USER, // Пользователь БД
  process.env.DB_PASSWORD, // Пароль пользователя БД
  {
    dialect: "postgres",
    host: process.env.DB_HOST, // Хост БД
    port: process.env.DB_PORT, // Порт БД
  }
);
