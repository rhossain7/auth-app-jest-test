const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../model/user");
const bcrypt = require("bcryptjs");

const { createUser } = require("../services/auth-service");
const { registerUser } = require("../controllers/auth-controller");

const generateRandomUser = () => {
  const randomString = Math.random().toString(36).substring(7);
  return {
    first_name: `John-${randomString}`,
    last_name: `Doe-${randomString}`,
    email: `johndoe-${randomString}@example.com`,
    password: `password-${randomString}`,
  };
};

describe("Registration and Login API", () => {
  let testUser;
  let db;

  beforeAll(async () => {
    db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(() => {
    testUser = generateRandomUser();
  });

  it("should connect to the database", () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it("should create User to DB", async () => {
    const spy = jest.spyOn(User, "create");
    const newUser = await createUser(testUser);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(testUser);

    // user model called
    // expect(newUser).toBeDefined();
    // expect(newUser.first_name).toEqual(testUser.first_name);

    // const user = await User.findOne({ email: testUser.email });
    // expect(user).toBeTruthy();

    // const hashedPassword = await bcrypt.hash(user.password, 10);
    // const passwordMatch = await bcrypt.compare(
    //   testUser.password,
    //   hashedPassword
    // );
    // expect(passwordMatch).toBe(true);
  });

  it.only("should not create user and throw error", async () => {
    const spy = jest.spyOn(User, "create");
    const consoleSpy = jest.spyOn(global.console, "log");
    const newUser = await createUser(null);

    expect(spy).toHaveBeenCalled();
    expect(newUser).toThrow();

    // expect(consoleSpy).toHaveBeenCalled();
    // expect(consoleSpy).toHaveBeenCalledWith("Error Occured");

    // user model called
    // expect(newUser).toBeDefined();
    // expect(newUser.first_name).toEqual(testUser.first_name);

    // const user = await User.findOne({ email: testUser.email });
    // expect(user).toBeTruthy();

    // const hashedPassword = await bcrypt.hash(user.password, 10);
    // const passwordMatch = await bcrypt.compare(
    //   testUser.password,
    //   hashedPassword
    // );
    // expect(passwordMatch).toBe(true);
  });

  it("should return a 400 error if input is incomplete", async () => {
    const incompleteData = {
      first_name: testUser.first_name,
      email: testUser.email,
    };

    const response = await request(app)
      .post("/register")
      .send(incompleteData)
      .expect(400);

    expect(response.text).toBe("All input is required");
  });

  it("should return a 409 error if the user already exist", async () => {
    const existingUser = await createUser(testUser);

    const userData = testUser;

    const response = await request(app)
      .post("/register")
      .send(userData)
      .expect(409);

    expect(response.text).toBe("User Already Exist. Please Login");
  });
});
