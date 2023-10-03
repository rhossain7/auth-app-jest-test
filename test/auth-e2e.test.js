const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../model/user");

// Helper function to generate random user data
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

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    testUser = generateRandomUser();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should register a new user", async () => {
    const response = await request(app).post("/register").send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("email", testUser.email);
  });

  it("should log in a user with valid credentials", async () => {
    await request(app).post("/register").send(testUser);

    const response = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("email", testUser.email);
  });

  it("should return an error with invalid credentials", async () => {
    const response = await request(app).post("/login").send({
      email: testUser.email,
      password: "invalidpassword",
    });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Invalid Credentials");
  });

  it("should return reset password", async () => {
    const response = await request(app).post("/resetPass").send({
      email: testUser.email,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Password Reset Successfull"
    );
  });
});
