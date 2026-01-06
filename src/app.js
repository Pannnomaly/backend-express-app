// ไฟล์ app เอาไว้ติดตั้ง middleware
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { router as apiRoutes } from "./routes/index.js";
import { limiter } from "./middlewares/rateLimiter.js";

// การเจอ middleware จะเข้าเรียงตามลำดับเลย

export const app = express();

// ต้องมีเพราะจะทำให้ limiter ทำงานได้ (คือไม่มีไม่ได้)
// ให้เชื่อ ip ที่เป็นตัวแทน เช่น vercel ที่เรา deploy
app.set("trust proxy", 1);

// global middleware
// ทำให้ BE ของเรามีความปลอดภัยมากขึ้น
// ติดตั้งแค่นี้ก็คือจบเลย
app.use(helmet());

// ที่นี่เอาไว้ติดตั้ง middleware req มาจะเข้าตามลำดับของ middleware ที่เราเขียนไว้

const corsOptions = {
    origin: [
        // เก็บสถานที่ที่อนุญาติให้ติดต่อกับ BE ของเราได้ (กรอก url ของ FE ลงไป)
        "http://localhost:5173",
            "http://localhost:5174",
                "http://localhost:5175",
                    "https://frontend-react-app-ecru.vercel.app",
                // หรือ url ที่ vercel ให้เรามา เราก็จะเอามาใส่ตรงนี้แหละ เพื่อให้ FE ต่อ BE ได้
    ],
    // ให้ cookie สามารถส่งได้ จาก FE ไป BE ใน req ถัดๆ ไป
    credentials: true,
};

// .use เพื่อการติดตั้ง middleware
// ทำให้ frontend ติดต่อกับ backend ได้ เพราะตอนนี้มันคนละ port กัน
// เราจะใช้ cors ในการบอกกับ BE ว่า ให้ยอมรับการติดต่อมาจากต่าง origin เช่น ต่าง port ต่างเครื่อง
// ติดต่อมาจาก origin ที่เราอนุญาตหรือเปล่า
app.use(cors(corsOptions));

app.use(limiter);

// อ่าน .json ที่ req ส่งมา มันคือ 1 ใน middleware
app.use(express.json());

// parse cookie เพื่อให้ backend ไปอ่านได้
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.use("/api", apiRoutes);

// Catch-all for 404 not found (ยังไม่ใช่ centralized middleware)
// next คือ build-in method ที่ใช้ในการส่งของที่ middleware หนึ่งทำเสร็จแล้ว เตรียมจะส่งให้ middleware อีกอัน
app.use((req, res, next) => {
    // เป็นการเรียก build-in object ของ JS มาใช้งาน (เป็น class แบบ OOP) คือเราไม่ได้สร้าง Error นี้ขึ้นมาเอง เราแค่เรียกมาใช้งานเฉยๆ
    // method อะไรที่ FE ส่งมา กับ originalURL endpoint อะไรที่ FE ส่งมา ว่ามันน error ตรงไหน ซึ่งมันคือ key ที่มีอยู่แล้ว
    const error = new Error(`Not found: ${req.method} ${req.originalUrl}`);
    // name คือชื่อของ error ชนิดนั้น
    // มันคือการตั้งชื่อให้ error ชนิดนี้นั่นแหละ = NotFoundError
    error.name = error.name || "NotFoundError";
    // ตั้ง status ให้ error นี้
    error.status = error.status || 404;
    // จะทำการส่ง error นี้ ไปให้ middleware ที่จะจัดการเกี่ยวกับ error ต่อไป
    // ใช้ method next ในการส่ง error ออกไป
    next(error);
});

// Centralized Error Handling Middleware (ศูนย์รวมของ error ทั้งหมด)
// err, req, res, next เป็นชื่อที่ express ตั้งเอาไว้แล้ว ให้ express รู้
// err คือให้ express รู้ว่ากำลังจะทำ Centralized
app.use((err, req, res, next) => {
    // เหมือน .log แต่ออกแบบมาเพื่ออ่าน error
    // stack เอาไว้ดู error message ใน server ของเราได้ ถ้ามันมีนะ
    // stack
    console.error(err.stack);
    // มี status ของ error นั้นไหม ถ้าไม่มีก็เอา 500 (internal server error)
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        stack: err.stack,
    });
});