import express from "express";
import { body } from "express-validator";
import { signup, login, logout } from "../controllers/authController.js";

const router = express.Router();

// ✅ Signup Route
router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  signup
);

// ✅ Login Route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

// ✅ Logout Route
router.post("/logout", logout);

export default router;
