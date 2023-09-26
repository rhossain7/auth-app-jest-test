const { registerUser } = require("../controllers/auth-controller");

const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../model/user");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("User Registration", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "securePassword",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockResolvedValue(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("registers a new user with valid input", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValueOnce({
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      password: "hashedPassword",
    });
    // bcrypt.hash.mockResolvedValue("hashedPassword");

    jwt.sign.mockReturnValue("someToken");

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      password: "hashedPassword",
      token: "someToken",
    });
    expect(res.json).toHaveBeenCalled();
  });

  it("handles missing input fields", async () => {
    req.body = {};

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("All input is required");
  });

  it("handles an existing user", async () => {
    User.findOne.mockResolvedValue({
      _id: "existingUserId",
      email: "john@example.com",
    });

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.send).toHaveBeenCalledWith("User Already Exist. Please Login");
  });

  it("handles bcrypt error", async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockRejectedValue(new Error("bcrypt error"));

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Internal Server Error");
  });

  it("handles jwt.sign error", async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedPassword");
    jwt.sign.mockImplementation(() => {
      throw new Error("jwt.sign error");
    });

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Internal Server Error");
  });
});
