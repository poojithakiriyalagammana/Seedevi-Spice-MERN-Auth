const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const genarateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
//hash Token
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token.toString()).digest("hex");
};
module.exports = {
  genarateToken,
  hashToken,
};
