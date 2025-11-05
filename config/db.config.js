require("dotenv").config();
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

async function connectToDb() {
  try {
    // Only authenticate, don't run sync on production
    // sync({ alter: true }) causes table locks and prevents server startup
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    //ensure you created the database
    //check database credentials
    console.error("Unable to connect to the database:", error);
    throw error; // Re-throw to prevent server from starting with bad DB connection
  }
}

module.exports = {
  sequelize,
  Sequelize,
  connectToDb,
};
