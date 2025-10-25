// src/utils/jwt.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const generateToken = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyTokenSync = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
};
