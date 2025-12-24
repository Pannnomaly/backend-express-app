import express from "express";

export const app = express();

// อ่าน .json ที่ req ส่งมา มันคือ 1 ใน middleware
app.use(express.json());