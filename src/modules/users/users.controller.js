// เก็บ handler function ของ rount หรือ endpoint ที่ทำงานเกี่ยวกับ user
// เช่น create, update, delete

import { users } from "../../mock-db/users.js";

export const testAPI = (req, res) => {
    res.send(`<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Express + Tailwind</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="min-h-screen bg-gray-50 text-gray-800">
      <main class="max-w-2xl mx-auto p-8">
        <div class="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 p-8">
          <h1 class="text-3xl font-bold tracking-tight text-blue-600">
            Hello Client! I am your Server!
          </h1>
          <p class="mt-3 text-gray-600">
            This page is styled with <span class="font-semibold">Tailwind CSS</span> via CDN.
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <a href="#" class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              GET /users
            </a>
            <span class="text-xs text-gray-500">Try POST/PUT/DELETE with your API client.</span>
          </div>
        </div>
        <footer class="mt-10 text-center text-xs text-gray-400">
          Express server running with Tailwind via CDN
        </footer>
      </main>
    </body>
  </html>`);
}

// ตั้งชื่อให้สื่อถึง action ที่จะเกิดขึ้น
// export ออกไปใช้ที่ server
export const getUsers = (req, res) => {
    res.status(200).json(users);
}

export const deleteUser = (req, res) => {
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
}

export const createUser = (req, res) => {

  // destructure
  const {name, email} = req.body

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
}