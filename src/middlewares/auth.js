import jwt from "jsonwebtoken";

// ตัวแปรนี้คือ middleware เป็น function
export const authUser = async (req, res, next) => {

    let token = req.cookies.accessToken;

    // ถ้าไม่มี token ส่งมา จะ
    if (!token)
    {
        return res.status(401).json({
            error: true,
            code: "NO_TOKEN",
            message: "Access denied. No token!",
        });
    }

    // ถ้ามี token เราจะเอา token มา verify
    try {
        
        // ใช้ secret ในการตรวจ token ซึ่งจะต้องเป็น secret เดียวกันกับที่ใช้สร้าง
        // มันคือการทำ decoded token
        const decoded_token = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            user: {_id: decoded_token.userId}
        };

        // ส่งต่อให้ route handler จัดการต่อ
        next();
    } catch (error) {
        next(error);
    }
};