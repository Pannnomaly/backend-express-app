// จะทำการ limit กับ ip address ที่ติดต่อมายัง BE ของเรา ให้ทำได้กี่ครั้งภายในเวลาเท่าไร

import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    // set เวลาเป็น millisecond
    windowMs: 15 * 60 * 1000, // 15 mins ของแต่ละ ip address

    // ติดต่อได้กี่ครั้ง (req) ของแต่ละ ip ใน 15 นาที ถ้าเกิน จะ block เลย
    max: 100,

    // ให้ใช้ header รุ่นใหม่อยู่ตลอด
    standardHeaders: true,
    
    // ไม่ใช้ header รุ่นเก่าแล้ว เพราะมันไม่ปลอดภัยเท่ารุ่นใหม่
    legacyHeaders: false,
});