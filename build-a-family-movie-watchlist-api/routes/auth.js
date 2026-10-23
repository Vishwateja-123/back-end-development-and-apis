import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { findByUsername } from "../utils/db.js";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = findByUsername(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const secret = process.env.JWT_SECRET || "grading-secret-value";
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    secret,
    { expiresIn: "2h" }
  );

  return res.status(200).json({ token });
});

export default router;
