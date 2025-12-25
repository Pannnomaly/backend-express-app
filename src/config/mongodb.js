import mongoose from "mongoose";

export async function connectDB ()
{
    const uri = process.env.MONGODB_URI;

    try {
    // param1: link db
    // param2: ชื่อ db ของเรา
    // ต้อง await ด้วย เพราะเราต้องการให้ตรงนี้เสร็จก่อนที่จะไปทำที่อื่นต่อ
    // ถ้าเรายังไม่มี DB ชื่อนี้ มันจะไปสั่งให้สร้างขึ้นมา เมื่อเราใส่ document ตัวแรกเข้าไป
    await mongoose.connect(uri, {dbName: "jsd11-express-app"});

    // เป็น convention ที่บอกให้เรารู้ว่าการ connection ทำได้สำเร็จหรือเปล่า
    console.log("MongoDB connected!");
        
    } catch (error) {
        console.error("MongoDB connection error!", error);
        process.exit(1);
    }
}