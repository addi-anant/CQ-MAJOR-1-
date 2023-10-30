const jwt = require("jsonwebtoken");
const { db } = require("../index");

const tokenGeneration = async (email, seller) => {
  const token = jwt.sign(
    {
      email,
      seller,
    },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  return token;
};

module.exports = tokenGeneration;
