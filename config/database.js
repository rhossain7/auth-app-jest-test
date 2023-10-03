const mongoose = require("mongoose");

const { MONGO_URI } = process.env;
console.log(MONGO_URI);
exports.connect = async () => {
  // Connecting to the database
  await mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};
