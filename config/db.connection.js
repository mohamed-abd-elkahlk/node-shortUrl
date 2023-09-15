const mongoose = require("mongoose");

const dbConnection = () => {
  const url = process.env.DB_STRING;
  mongoose
    .connect(url)
    .then((conn) => {
      console.log(`DATABASE CONNECTED ON: ${conn.connection.host}`);
    })
    .catch((err) => console.log(err));
};

module.exports = dbConnection;
