// จะสร้าง key เพื่อเอาไปเป็น signature ให้กับ token ของเรา

import { randomBytes } from "crypto";

// randomBytes คือการ generated secret key ของเรา 64 characters
console.log(randomBytes(64).toString("hex"));