import { Router } from "express";
import { router as v1Routes } from "./v1/index.js";

export const router = Router();

// เป็นการสร้างเส้นทางอันหนึ่ง
router.use("/v1", v1Routes);