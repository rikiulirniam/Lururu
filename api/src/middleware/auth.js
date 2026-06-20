const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthenticated.",
      });
    }

    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET || "rahasia_jwt_super_aman";

    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthenticated.",
    });
  }
};

module.exports = { verifyToken };
