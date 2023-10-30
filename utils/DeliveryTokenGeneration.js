const jwt = require("jsonwebtoken");

const deliveryTokenGeneration = async (id) => {
  const token = jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  return token;
};

module.exports = deliveryTokenGeneration;
