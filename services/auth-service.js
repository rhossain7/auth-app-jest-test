const User = require("../model/user");

async function createUser(user) {
  try {
    return await User.create(user);
  } catch (e) {
    console.log("Error Occured");
    // throw new Error("Error Occured");
    console.log(e);
    throw e;
  }
}

module.exports = {
  createUser,
};
