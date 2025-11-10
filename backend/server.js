import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import krishnaRoutes from "./routes/krishnaRoutes.js";

dotenv.config(); 
const app = express();
connectDB()
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/krishna", krishnaRoutes);



app.get("/", (req, res) => {
  res.json({ message: "🚀 Server is running successfully!" });
});


app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
