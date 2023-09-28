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

  beforeEach(() => {
    testUser = generateRandomUser();
    req.body = testUser;
  });

  it("should connect to the database", () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it("Should create User", async () => {
    const registerMock = jest.spyOn(authController, "registerUser");
    const userResponse = await authController.registerUser(req, res);

    expect(registerMock).toHaveBeenCalled();
    expect(authController.registerUser).toHaveBeenCalledWith(req, res);
    expect(registerMock).toHaveBeenCalledWith(req, res);

    expect(userResponse).toBeDefined();
    expect(userResponse.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        first_name: req.body.first_name,
      })
    );
  });

  it("should not create user, get 400 for missing fields", async () => {
    const registerMock = jest.spyOn(authController, "registerUser");
    const { email, ...rest } = req.body;
    user_with_missing_field = {
      body: {
        ...rest,
      },
    };
    const userResponse = await authController.registerUser(
      user_with_missing_field,
      res
    );
    expect(registerMock).toHaveBeenCalled();
    expect(authController.registerUser).toHaveBeenCalledWith(
      user_with_missing_field,
      res
    );
    expect(registerMock).toHaveBeenCalledWith(user_with_missing_field, res);

    expect(userResponse.status).toHaveBeenCalledWith(400);
    expect(userResponse.send).toHaveBeenCalledWith("All input is required");
  });
  it("should not create user, return 409 for duplicate entry", async () => {
    const registerMock = jest.spyOn(authController, "registerUser");

    const existingUserResponse = await authController.registerUser(req, res);
    const duplicateUserResponse = await authController.registerUser(req, res);
    expect(registerMock).toHaveBeenCalled();
    expect(authController.registerUser).toHaveBeenCalledWith(req, res);
    expect(registerMock).toHaveBeenCalledWith(req, res);

    expect(existingUserResponse).toBeDefined();
    expect(existingUserResponse.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        first_name: req.body.first_name,
      })
    );

    expect(duplicateUserResponse.status).toHaveBeenCalledWith(409);
    expect(duplicateUserResponse.send).toHaveBeenCalledWith(
      "User Already Exist. Please Login"
    );
  });
});
