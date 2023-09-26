const mongoose = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Ensure emails are stored in lowercase
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
});

// Create and export the User model
module.exports = mongoose.model("User", userSchema);
