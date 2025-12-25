import { app } from "./app.js";
import { connectDB } from "./config/mongodb.js";

const PORT = "3000";

try {

    // เปิดการเชื่อมต่อกับ DB
    await connectDB();

    // สั่งเปิด server
    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}!`);
    });
    
} catch (error) {
    console.error("Startup failed!", error);
    process.exit(1);
}