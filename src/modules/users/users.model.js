import mongoose from "mongoose";
import bcrypt from "bcrypt";

// a data model is created from a data schema

// เรียกโครงของการสร้าง schema มา
// schema สร้าง model, model สร้าง user ทีละคน
const userSchema = new mongoose.Schema(
    {
        // field username ให้ค่าที่จะเก็บเป็น String จะเก็บชนิดอื่นไม่ได้ เป็นการทำ validation ไปในตัว
        // required: true เพราะเราต้องการให้มี username เท่านั้นถึงจะสามารถสร้าง user จาก username ได้
        // trim: true จะตัด white space หัวท้ายออกในกรณีที่ user เผลอกด space มา
        // ซึ่งทั้งหมดล้วนเป็นการทำ validation เบื้องต้น
        username: {type: String, required: true, trim: true},
        // enum คือการประกาศว่าค่าที่รับมาจะต้องเป็นค่าที่กำหนดเอาไว้ ซึ่ง user ไม่สามารถใส่อื่นๆ นอกเหนือจากนี้เข้ามาเองได้ จะต้องเป็นค่าที่เราตั้งไว้เท่านั้น
        // default: "user" คือถ้าไม่ใส่อะไรมาหรือใส่อื่นๆ มาจะเรียกใช้ค่าเริ่มต้นคือ user
        role: {type: String, enum: ["user", "admin"], default: "user"},
        // unique: true คือ email จะไม่สามารถกรอกซ้ำกับคนอื่นได้
        // lowercase: true คือจะต้องเป็นตัวพิมพ์เล็กทั้งหมด (มันจะแปลงเป็นตัวพิมพ์เล็กให้เอง)
        email: {type: String, required: true, unique: true, lowercase: true},
        // select: false คือตอนที่เราเขียน query มาเพื่อดูการแสดงผลค่าต่างๆ มันจะไม่มาด้วย คือไม่ถูกเลือกนั่นแหละ เพื่อความปลอดภัย
        // แต่ username, role และ email ยังแสดงผลอยู่
        password: {type: String, required: true, minlength: 6, select: false},
    },
    {
        timestamps: true,
    }
);

// ก่อนจะส่งเข้า DB จะให้ทำอะไรบ้าง
// save = event หนึ่ง
// Hash password before saving
userSchema.pre("save", async function () {
    // ตรวจสอบ password ที่ได้รับมา ถ้าไม่มีการเปลี่ยนแปลง จะให้. . .
    if (!this.isModified("password")) return;

    // ถ้า password มีการเปลี่ยนแปลง
    // เรียก method มาทำการ hashpassword
    // เข้ารหัส 10 รอบ (cross factor) ตือกำลังดีเลย
    this.password = await bcrypt.hash(this.password, 10);
});

// เป็น model ของ user
// เป็นชื่อที่คล้องจองกับ collection ซึ่งมันจะไปสร้าง collection ชื่อ users เอง (ถ้าเรายังไม่เคยสร้างมาก่อนนะ) คือมันจะรู้ของมันเองเลย
// ตัวอักษรแรกของ class ที่เราสร้างจะเป็น Uppercase
export const User = mongoose.model("User", userSchema);