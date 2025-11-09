const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRET;

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    profile: user.profile,
    role: user.role,
  };

  const token = jwt.sign(payload, SECRET);
  return token;
}

function validateToken(token) {
  const payload = jwt.verify(token, SECRET);
  return payload;
}

module.exports = { createTokenForUser, validateToken };
