import { Router } from "express";
import { createUser2, deleteUser2, getUser2, getUsers2, updateUser2 } from "../../modules/users/users.controller.js";

export const router = Router();



// 1st end point เกี่ยวกับการรับข้อมูล user ทุกคน ซึ่งเราจะไม่ getUser
router.get("/", getUsers2);

// 2nd end point
router.get("/:id", getUser2)

// 3rd end point
router.post("/", createUser2);

// 4th end point
router.delete("/:id", deleteUser2);

// 5th end point
// patch = update
router.patch("/:id", updateUser2);