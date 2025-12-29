import { Router } from "express";
// as คือการตั้งชื่อใหม่ให้กับตัวแปรข้างหน้า
import { router as usersRoutes } from "./users.routes.js";

export const router = Router();

// ต้องมาที่ /users นี้ก่อน แล้ว ไปเส้นทางย่อยๆ ต่อ
// นั่นคือของที่อยู่ usersRoutes นั่นเอง
router.use("/users", usersRoutes);