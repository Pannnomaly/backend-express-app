import express from "express";

export const app = express();

// อ่าน .json ที่ req ส่งมา
app.use(express.json());