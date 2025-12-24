import { Router } from "express";
import { createUser, deleteUser, getUsers, testAPI } from "../../modules/users/users.controller.js";

export const router = Router();

// 1st end point
// middleware
// เคยเป็น / มาก่อน
router.get('/test', testAPI);

// 2nd end point เกี่ยวกับการรับข้อมูล user ทุกคน ซึ่งเราจะไม่ getUser
// (req, res) แม้จะไม่ได้ใช้สักอัน ยังไงก็ต้องประกาศอยู่ดี
// middleware
// เคยเป็น /users มาก่อน
router.get("/", getUsers);

// 3rd end point
// ถ้ามี user ใช้ POST มาที่เส้น /users แล้วตาม format ที่ให้มาคือ name, email มันจะทำการโพสต์ ซึ่งตอนนี้ยัง จนกว่าจะมีการติดต่อมา
// middleware
// เคยเป็น /users มาก่อน
router.post("/", createUser);

// 4th end point
// middle
// เกี่ยวกับการลบข้อมูล จาก url ที่ลงท้ายด้วย id ของ user นั้นๆ
// route handler หรือ controller คือ function ที่ทำงานอยู่ใน endpoint
// เคยเป็น /users/:id มาก่อน
router.delete("/:id", deleteUser);