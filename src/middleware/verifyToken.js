import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1]; // Format: Bearer xxxxx

  if (!token) {
    return res.status(401).json({ message: "Token invalide" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ Token invalide :", err.message);
      return res.status(403).json({ message: "Token invalide" });
    }

    req.user = user;
    next();
  });
};

export default verifyToken;
