const { resetPassword } = require("../controllers/auth-controller");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

jest.mock("../model/user");
jest.mock("bcryptjs");
jest.mock("crypto");

describe("Reset Password", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "john@example.com",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockResolvedValue(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("resets a user's password successfully", async () => {
    const user = {
      _id: "userId",
      email: "john@example.com",
    };
    User.findOne.mockResolvedValue(user);

    crypto.randomBytes.mockReturnValue(Buffer.from("abcdef", "hex"));

    bcrypt.hash.mockResolvedValue("hashedPassword");

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password Reset Successfull",
      newPassword: "abcdef",
    });

    expect(user.password).toBe("hashedPassword");
  });

  it("handles a user not found", async () => {
    User.findOne.mockResolvedValue(null);

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });
});
