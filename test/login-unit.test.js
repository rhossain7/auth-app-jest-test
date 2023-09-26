const { loginUser } = require("../controllers/auth-controller");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../model/user");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("User Login", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
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

  it("logs in a user with valid credentials", async () => {
    const user = {
      _id: "userId",
      email: "john@example.com",
      password: await bcrypt.hash("securePassword", 10),
    };
    User.findOne.mockResolvedValue(user);

    bcrypt.compare.mockResolvedValue(true);

    jwt.sign.mockReturnValue("someToken");

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      _id: "userId",
      email: "john@example.com",
      token: "someToken",
    });
  });

  it("handles missing input fields", async () => {
    req.body = {};

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("All input is required");
  });

  it("handles invalid credentials", async () => {
    User.findOne.mockResolvedValue(null);

    bcrypt.compare.mockResolvedValue(false);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid Credentials");
  });
});
