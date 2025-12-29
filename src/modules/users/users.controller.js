// เก็บ handler function ของ rount หรือ endpoint ที่ทำงานเกี่ยวกับ user
// เช่น create, update, delete

import { users } from "../../mock-db/users.js";
import { User } from "./users.model.js";

// route handler: เอา id ของ user มาทีละ id จาก database
export const getUser2 = async (req, res) => {
  const { id } = req.params;

  try {
    
    // หาจาก id ที่ละคน และไม่เอา password
    const doc = await User.findById(id).select("-password");

    // ถ้าไม่มี doc จะ . . .
    if (!doc)
    {
      return res.status(404).json({
        success: false,
        error: `User ${id} not found!`,
      });
    }

    return res.status(200).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to get a user!",
    });
  }
};

// ตั้งชื่อให้สื่อถึง action ที่จะเกิดขึ้น
// export ออกไปใช้ที่ server
// router handler: เรียก user แบบ mock
export const getUsers1 = (req, res) => {
    res.status(200).json(users);
};

// router handler: เรียก user ใน database (ของจริงแล้ว)
export const getUsers2 = async (req, res) => {

  try {

    // เรียก mongoose ไปหา user ทุกตัวที่อยู่ใน collection users
    // แล้วไม่เอา password (-password) มาแสดงผล
    const users = await User.find().select("-password");

    // ส่งข้อความไป FE
    return res.status(200).json({
      // สำเร็จ
      success: true,
      // ส่ง users ที่เพิ่งได้มาออกไป FE
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to get users. . .",
    });
  }
};

// route handler: ลบ user ใหม่แบบ mock
export const deleteUser1 = (req, res) => {
    // ใช้ params เพื่อเอา id ออกมา
    const userId = req.params.id;

    // เข้าไปหา user id แต่ละอันใน arr ของ users
    const userIndex = users.findIndex((user) => user.id === userId);

    // ทำ error handling ในกรณีที่กดลบซ้ำ
    if (userIndex !== -1)
    {
      // ไม่ใช่ -1 ให้ทำอะไร
      users.splice(userIndex, 1);
      // ตัดออกที่ userIndex ออกไป 1 ตัว
      res.status(200).send(`User with ID ${userId} deleted successfully!`);
    } else{
      res.status(404).send("User not found!");
    }
};
// route handler: ลบ user ใน database (ของจริงแล้ว)
export const deleteUser2 = async (req, res) => {
    
    // destructure
    const { id } = req.params;

    try {
      
      // หาโดย id และลบทิ้งไปเลย ก็จะเอา id ที่ต้องการจะลบไปใส่
      const deleted = await User.findByIdAndDelete(id);

      // ถ้า deleted ไม่มีจะทำอะไร
      if (!deleted)
      {
        return res.status(404).json({
          success: false,
          error: `User ${id} not found!`,
        });
      }

      return res.status(200).json({
        success: true,
        data: null,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Failed to delete user",
      });
    }
};

// route handler: สร้าง user ใหม่แบบ mock
export const createUser1 = (req, res) => {

  // destructure
  const {name, email} = req.body;

  const newUser = {
    // แปลงเป็น String
    id: String(users.length + 1),
    name: name,
    email: email,
  };

  // เอา newUser ใหม่ ใส่ใน array users เก่า
  users.push(newUser);

  // การสร้างข้อมูลใหม่สำเร็จ 201 (convention)
  res.status(201).json(newUser);
};

// router handler: สร้าง user ใหม่ใน database (อันนี้สร้างจริงๆ แล้ว)
export const createUser2 = async (req, res) => {
  // desturcturing
  // จากหน้าบ้านที่ส่งมา
  const { username, email, password, role} = req.body;

  // ถ้าไม่มี username, email หรือ password จะให้ทำอะไร
  if (!username || !email || !password || !role)
  {
    // เป็น convention ในการแจ้งผลของ http req ที่พลาด
    // design แบบ RESTful API คือ consistence และ predicable
    return res.status(400).json({
      // success: false = ไม่สำเร็จ
      success: false,
      error: "username, email, password, and role are required",
    });
  }

  try {

    // อย่าลืมใส่ async ที่หน้า function ทั้งหมดของเราด้วย เพราะมี await จะต้องมี async
    // ส่งข้อมูล {username, email, password} ไปยัง method .model ที่หน้า users.model.js
    // argument ที่รับค่าเข้ามาไม่ต้องเรียงตามลำดับของ schema ขอแค่ชื่อตัวแปรถูกก็โอเคแล้ว
    const doc = await User.create({username, email, password, role});

    // แปลง mongoDB document เป็น Js object
    // เรากำลังจะทำ confirmation เพราะว่า user ควรจะรู้ว่าเรากำลังทำอะไร แต่เราจะ pass ออกเพราะเดี๋ยวมีคนดักระหว่างทาง
    // ก็เลยจะเอา pass ออกตอนแสดงผล แต่ใน DB จริงๆ ยังมีอยู่นะ
    const safe = doc.toObject();
    // ลบ password ออกจาก safe
    delete safe.password;

    return res.status(201).json({
      success: true,
      // เอา data ชื่อ safe return ออกไปแสดงผล
      data: safe
    });
  } catch (error) {
    // เป็น code เฉพาะ ที่เราจะต้องไปดูเพิ่ม สำหรับ email เลย
    if (error.code === 11000)
    {
      return res.status(409).json({
        success: false,
        error: "Email already in use!",
      });
    }

    // error อื่นๆ ที่นอกเหนือจากนี้ เป็นความผิดของ backend เอง
    // internal error
    return res.status(500).json({
      success: false,
      error: "Failed to create user. . .",
    });
  }
};

// router handler: ใช้อัพเดต user ใน database (ของจริง)
export const updateUser2 = async (req, res) => {
  
  // เอาแค่ id ใน url มา
  const { id } = req.params;
  // เอาของใน body ที่ FE ส่งมาใช้
  const body = req.body;

  try {
    
    const updated = await User.findByIdAndUpdate(id, body);

    // ถ้าไม่มี updated จะ. . .
    if (!updated)
    {
      return res.status(404).json({
        success: false,
        error: `User ${id} not found!`,
      });
    }

    const safe = updated.toObject();
    delete safe.password;

    return res.status(200).json({
      success: true,
      data: safe,
    });
  } catch (error) {

    if (error.code === 11000)
    {
      return res.status(409).json({
        success: false,
        error: "Email already in use!",
      });
    }

    // error อื่นๆ ที่นอกเหนือจากนี้ เป็นความผิดของ backend เอง
    // internal error
    return res.status(500).json({
      success: false,
      error: "Failed to update user. . .",
    });
  }
};