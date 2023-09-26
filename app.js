require("dotenv").config();
require("./config/database").connect();
const express = require("express");

const auth = require("./middleware/auth");
const {
  loginUser,
  registerUser,
  resetPassword,
} = require("./controllers/auth-controller");

const app = express();

app.use(express.json({ limit: "50mb" }));

app.post("/register", registerUser);

app.post("/login", loginUser);

app.post("/resetpass", resetPassword);

app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

module.exports = app;
