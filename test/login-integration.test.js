const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../model/user");
const bcrypt = require("bcryptjs");

const { createUser } = require("../services/auth-service");
const authController = require("../controllers/auth-controller");

const generateRandomUser = () => {
  const randomString = Math.random().toString(36).substring(7);
  return {
    first_name: `John-${randomString}`,
    last_name: `Doe-${randomString}`,
    email: `johndoe-${randomString}@example.com`,
    password: `password-${randomString}`,
  };
};

describe("Registration Function from Controller", () => {
  let testUser;
  let db;
  let req, res;
  let registerMock, userResponse;

  beforeAll(async () => {
    db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    req = {
      body: {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "securePassword",
      },
    };
    res = {
      status: jest.fn(() => res),
      send: jest.fn(() => res),
      json: jest.fn(() => res),
    };
  });

  beforeEach(async () => {
    testUser = generateRandomUser();
    req.body = testUser;
    registerMock = jest.spyOn(authController, "registerUser");
    userResponse = await authController.registerUser(req, res);
  });

  it("Should log in user with valid credentials", async () => {
    const longinMock = jest.spyOn(authController, "loginUser");
    const userLoginResponse = await authController.loginUser(req, res);

    expect(registerMock).toHaveBeenCalled();
    expect(longinMock).toHaveBeenCalled();

    expect(userLoginResponse).toBeDefined();
    expect(userLoginResponse.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        first_name: req.body.first_name,
      })
    );
  });
  it.only("Should not log in with missing fields, return 400", async () => {
    const { email, ...rest } = req.body;
    user_with_missing_field = {
      body: {
        ...rest,
      },
    };
    const longinMock = jest.spyOn(authController, "loginUser");
    const userLoginResponse = await authController.loginUser(
      user_with_missing_field,
      res
    );

    expect(registerMock).toHaveBeenCalled();
    expect(longinMock).toHaveBeenCalled();

    expect(userLoginResponse).toBeDefined();
    expect(userLoginResponse.status).toHaveBeenCalledWith(400);
    expect(userResponse.send).toHaveBeenCalledWith("All input is required");
  });
});
