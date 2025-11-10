import express from "express";
import { krishnaResponse } from "../controllers/krishnaController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Protected Krishna chat route
router.post("/ask", verifyToken, krishnaResponse);

export default router;
