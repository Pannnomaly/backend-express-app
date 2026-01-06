import { Router } from "express";
import { createUser2, deleteUser2, getUser2, getUsers2, updateUser2 } from "../../modules/users/users.controller.js";
import { User } from "../../modules/users/users.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authUser } from "../../middlewares/auth.js";

export const router = Router();

// middleware router แบบ endpoint
// error handling ทั้งหลาย เราจะเอามาลงที่นี่

// 1st end point เกี่ยวกับการรับข้อมูล user ทุกคน ซึ่งเราจะไม่ getUser
router.get("/", getUsers2);

// 2nd end point
router.get("/:id", getUser2)

// 3rd end point
router.post("/", authUser, createUser2);
// ต้องเป็น user ที่ login ก่อน
// router.post("/", authUser, createUser2);

// 4th end point
router.delete("/:id", authUser, deleteUser2);

// 5th end point
// patch = update
router.patch("/:id", authUser, updateUser2);

// Login a user -- jwt signed token (token in cookies)
// post เพราะ user จะต้องส่งทั้ง email และ password ให้
router.post("/auth/cookie/login", async (req, res, next) => {
    // จะต้องมีการตรวจสอบว่า email, pass ตรงกันกับ user คนนั้นๆ หรือเปล่า
    // จากนั้นถึงจะมีการออก token ให้ เพื่อเอาไปใช้ใน req ถัดๆ ไป

    // เอา email, pass จาก req ออกมาใช้ก่อน
    const { email, password } = req.body;

    // ถ้าไม่มี email หรือ password จะ
    if (!email || !password)
    {
        return res.status(400).json({
                error: true,
                message: "Email and Password are required. . .",
            });
    }

    try {
        
        // เอา email ที่ user ส่งมา แปลงเป็น String แบบ JS แล้วก็ trim และก็แปลงเป็นตัวเล็ก
        // มันคือการทำให้ข้อมูล clean พร้อมใช้งาน
        const normalizedEmail = String(email).trim().toLowerCase();

        // .select("+password") คือการบอกให้ส่ง pass ของ user นั้นๆ ออกมาด้วย
        // เพราะเรา select: false (คือตอนที่ db ส่ง res กลับมาจะไม่เอา pass ออกมาด้วย) ไว้ใน user model
        const user = await User.findOne({email: normalizedEmail}).select("+password");

        // ถ้าไม่มีข้อมูล user นั้นๆ จะ
        if (!user)
        {
            return res.status(401).json({
                error: true,
                message: "User not found. . .",
            });
        }

        // compare คือ built-in method ของ bcrypt ที่เอาไว้เปรียบเทียบ pass ที่รับเข้ามา เทียบกับ pass ใน DB ว่ามันตรงกันไหม
        // password คือที่รับเข้ามา
        // user.password คือใน DB
        const isMatched = await bcrypt.compare(password, user.password);

        // ถ้า pass ไม่ตรง จะ
        if (!isMatched)
        {
            return res.status(401).json({
                error: true,
                message: "Invalid password. . .",
            });
        }

        // generate JSON Web Token

        // .sign คือ method ที่จะเอามาสร้าง token
        // ใน user จะได้เป็น document ออกมาเลย จะมีทั้ง email, password และอื่นๆ ใน db ด้วย
        // ต่อมา argument อันที่สองคือ secret (signature)
        // argument ที่สามคือการกำหนด อายุขัย ของ token (อันนี้สำคัญเลย มีผลต่อความปลอดภัย)
        // expiresIn คือจะให้หมดอายุใน ... 1h = 1 ชั่วโมง พอหมดแล้วก็ต้อง login ใหม่
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // ดูว่า app ของเรารันอยู่ใน production หรือยังอยู่ใน development
        // จะเขียนในไฟล์ .env ซึ่งจะได้ค่า true/false ออกมาตามค่าจริง
        // render = production
        // local = development
        // ถ้าเป็น production จะทำให้ isProd เป็น true
        const isProd = process.env.NODE_ENV === "production";

        // เมื่อเราได้ token มาแล้ว เราก็จะส่งกลับไปยัง client แล้ว

        // ใส่ของ (token) ลงใน cookie ใน key ที่ชื่อ accessToken
        // ตรงนี้แหละคือการส่ง token ไปแล้ว (แนบ token ไว้ใน cookie)
        res.cookie("accessToken", token, {
            // key: value เดี๋ยวไปดูมาเพิ่มว่าแต่ละอันคืออะไร
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            path: "/",
            // 1 hr คือมันกำหนดเป็น millisecond
            maxAge: 60 * 60 * 1000
        });

        res.status(200).json({
            error: false,
            message: "Login successful!",
            // token: token เอามาดูเฉยๆ ว่ามันมีการ return token ออกไปจริงๆ นะ
            // ใน development เราจะทำ แต่ถ้าขึ้นงานจริงจะไม่ทำเพราะไม่ปลอดภัย และใน cookie ที่เราส่งออกก็มี token ของเราอยู่แล้ว
            token: token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {

        // error handling middleware จัดการต่อ
        next(error);
    }
});

// Logout a user
router.post("/auth/cookie/logout", (req, res) => {
    const isProd = process.env.NODE_ENV === "production";

    // การ logout คือการ clear cookie ออกไปเลย เพราะ token อยู่ใน cookie การ clear cookie = clear token
    // clear cookie ที่ key accessToken ใน res ที่เราส่งกลับ
    // คือ token ใน cookie มีทั้งใน req และ res แต่เรา clear ใน res เพราะเราจะส่ง res กลับให้ client
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
    });

    res.status(200).json({
        error: false,
        message: "Logged out successfully!"
    });
});

// Check user authentication (check if user has valid token)
// มีการติดตั้ง custom middleware ด้วย
// ถ้าเกิด error จะเกิดที่ authUser คือจะไม่ผ่าน req ไปถึง async
router.get("/auth/cookie/me", authUser, async (req, res, next) => {
    try {
        
        const userId = req.user.user._id;

        const user = await User.findById(userId);

        // ถ้าไม่มี user
        if (!user)
        {
            return res.status(401).json({
                error: true,
                message: "Unauthenticated"
            });
        }

        res.status(200).json({
            error: false,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
});