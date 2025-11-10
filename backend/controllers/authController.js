import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/user.js";

// 🌟 Signup Controller (auto-login after registration)
export const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields correctly.",
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "This email is already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate token instantly after signup
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      success: true,
      message: `Welcome aboard, ${newUser.name}!`,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("❌ Signup Error:", error.message);
    res.status(500).json({
      success: false,
      message:
        "Something went wrong while creating your account. Please try again later.",
    });
  }
};

// 🌿 Login Controller
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields correctly." });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No account found with this email." });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password. Please try again." });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to log you in right now. Please try again later.",
    });
  }
};

// 🌸 Logout Controller
export const logout = async (req, res) => {
  try {
    // JWT logout = client removes token
    res.status(200).json({
      success: true,
      message: "You’ve been logged out successfully.",
    });
  } catch (error) {
    console.error("❌ Logout Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong while logging out. Try again.",
    });
  }
};
