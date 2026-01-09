import { User } from "./users.model.js";
import { embedText, GEMINI_EMBEDDING_DIMS } from "../../services/gemini.client.js";

const buildUserEmbeddingText = (userDoc) => {

    // คือ ? เผื่อ . หาข้อมูลไม่เจอ จะเป็น null ซึ่งจะยังคงทำงานต่อได้ ไม่เกิด error แต่อาจจะไปแตกที่ตรงอื่นแทน
    // ถ้ามีจะแปลงเป็น string แล้ว trim แต่ถ้าไม่ก็จะยังทำงานต่อและเป็น "" หรือ user
    const username = userDoc?.username ? String(userDoc.username).trim() : "";
    const email = userDoc?.email ? String(userDoc.email).trim() : "";
    const role = userDoc?.role ? String(userDoc.role).trim() : "user";

    return [
        "User profile:",
        `Username: ${username}`,
        `Email: ${email}`,
        `Role: ${role}`,
    ].join("\n");
    // \n เพื่อขึ้นบรรทัดใหม่ (newline)
};

export const embedUserById = async (userId) => {

    // ถ้าไม่มี userId จะ
    if (!userId)
    {
        const error = new Error("userId is required!");
        // เพิ่มข้อมูลให้ error
        error.name = "ValidationError";
        error.status = 400;
        // คือสั่งให้โปรแกรมหยุดการทำงาน ไม่ไปต่อแล้วถ้าเจอ error นี้ แล้วจะส่ง error ให้ central error middleware ที่เราเคยสร้าว
        throw error;
    }

    // ทำการ embedding user แต่ยังไม่รู้ว่าจะ fail ไหมนะ แล้ว update ไปที่ DB
    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                "embedding.status": "PROCESSING",
                "embedding.lastAttemptAt": new Date(),
            },
            $inc: {"embedding.attempts": 1},
        },
        // สั่งให้ไม่ต้องสร้าง document ใหม่ เพราะเราจะแทรก (update) ด้วยกันเลย
        {new: false}
    );

    try {
        
        const user = await User.findById(userId).select("username email role embedding.status");

        // ถ้าไม่มีอะไรใน user
        if (!user)
        {
            const error = new Error("User not found!");
            error.name = "notFoundError";
            error.status = 404;
            throw error;
        }

        // เราจะได้ string ที่อยู่ใน return ที่เรา set ไว้
        const text = buildUserEmbeddingText(user);
        // เราทำ user vector embedding
        const vector = await embedText({text});

        // เอาข้อมูลการ embedding user ไปเก็บใน DB
        await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "embedding.status": "READY",
                    "embedding.vector": vector,
                    "embedding.dims": GEMINI_EMBEDDING_DIMS,
                    "embedding.updateAt": new Date(),
                    "embedding.lastError": null,
                },
            },
            {new: false}
        );

        // ไม่มีการคืนค่าใดๆ แค่เหมือนเป็นสิ่งที่บอกว่า สำเร็จแล้วนะ
        return {ok: true};

    } catch (error)
    {

        const message = String(error?.message || "Embedding failed!");
        
        // เอาข้อมูล error ไปเก็บใน DB
        User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "embedding.status": "FAILED",
                    "embedding.lastError": message,
                },
            },
            {new: false}
        );

        // false เพราะมัน error
        return {ok: false, error: message};
    }
};

export const queueEmbedUserById = (userId) => {

    setImmediate(() => {
        
        // catch คือ catch ใน try-catch แต่เป็นแบบ chaining
        embedUserById(userId).catch((error) => {
            console.error("Async user embedding failed", {
                userId,
                message: error?.message,
            });
        });
    });
};