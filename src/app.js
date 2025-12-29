// ไฟล์ app เอาไว้ติดตั้ง middleware
import express from "express";
import cors from "cors";
import { router as apiRoutes } from "./routes/index.js";

export const app = express();

const corsOptions = {
    origin: [
        // เก็บสถานที่ที่อนุญาติให้ติดต่อกับ BE ของเราได้ (กรอก url ของ FE ลงไป)
        "http://localhost:5173",
            "http://localhost:5174",
                "http://localhost:5175",
                    "https://frontend-react-app-ecru.vercel.app/",
                // หรือ url ที่ vercel ให้เรามา เราก็จะเอามาใส่ตรงนี้แหละ เพื่อให้ FE ต่อ BE ได้
    ],
};

// .use เพื่อการติดตั้ง middleware
// ทำให้ frontend ติดต่อกับ backend ได้ เพราะตอนนี้มันคนละ port กัน
// เราจะใช้ cors ในการบอกกับ BE ว่า ให้ยอมรับการติดต่อมาจากต่าง origin เช่น ต่าง port ต่างเครื่อง
// ติดต่อมาจาก origin ที่เราอนุญาตหรือเปล่า
app.use(cors(corsOptions));

// อ่าน .json ที่ req ส่งมา มันคือ 1 ใน middleware
app.use(express.json());

app.use("/api", apiRoutes);