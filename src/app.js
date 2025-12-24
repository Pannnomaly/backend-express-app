// ไฟล์ app เอาไว้ติดตั้ง middleware
import express from "express";
import { router as apiRoutes } from "./routes/index.js";

export const app = express();

// อ่าน .json ที่ req ส่งมา มันคือ 1 ใน middleware
app.use(express.json());

app.use("/api", apiRoutes);