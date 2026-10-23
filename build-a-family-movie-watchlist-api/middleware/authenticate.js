import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "grading-secret-value";

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
