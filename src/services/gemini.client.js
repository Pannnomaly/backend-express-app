// เป็นการไปใช้ service ของ API อื่น (ทำตัวเหมือน client)

// อย่าลืมลง axios ด้วย

import axios from "axios";

// เป็น api ของ google ที่เราจะต้องเข้าไปติดต่อตรงนี้
const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com";
const EMBEDDING_MODEL = "gemini-embedding-001";
const GENERATION_MODEL = "gemini-2.5-flash";
const EXPECTED_EMBEDDING_DIMS = 3072;

// 15000 ms = 15 sec
export const embedText = async ({
  apiKey = process.env.GEMINI_API_KEY,
  text,
  baseUrl = process.env.GEMINI_API_BASE_URL || DEFAULT_BASE_URL,
  model = process.env.GEMINI_EMBEDDING_MODEL || EMBEDDING_MODEL,
  timeoutMs = Number(process.env.GEMINI_HTTP_TIMEOUT_MS || 15000),
} = {}) => {
  const trimmed = String(text || "").trim();

  // ถ้าไม่มี trimmed จะ
  if (!trimmed) {
    const error = new Error("embedText requires non-empty text");
    error.name = "ValidationError";
    error.status = 400;
    throw error;
  }

  // ถ้าไม่มี apiKey จะ
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY must be set to compute embeddings");
    error.name = "ConfigurationError";
    error.status = 500;
    throw error;
  }

  // ค่าใน model จะถูกแปลงเป็น ค่าที่ถูกต้อง ในการเอามาทำเป็น URL เป็น defensive
  const url = `${baseUrl}/v1beta/models/${encodeURIComponent(
    model
  )}:embedContent?key=${encodeURIComponent(apiKey)}`;

  const { data } = await axios.post(
    url,
    {
      // เป็น format ของการส่งไปให้ที่ gemini
      content: {
        parts: [{ text: trimmed }],
      },
    },
    {
      // ระยะเวลาในการรอ res จาก gemini
      timeout: timeoutMs,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // ทางขวาไม่มี ? ไม่เป็นไร
  const vector =
    data?.embedding?.values ||
    data?.embedding?.value ||
    data?.embeddings?.[0]?.values ||
    data?.embeddings?.[0]?.value;

  // ถ้ามันไม่เป็น error of vector จะ
  if (!Array.isArray(vector)) {
    const error = new Error("Unexpected Gemini embeddings response shape");
    error.name = "UpstreamError";
    error.status = 502;
    error.details = { receivedKeys: data ? Object.keys(data) : null };

    throw error;
  }

  // ถ้ามันไม่เท่ากันกับ dimension ที่เรากำหนดไว้ จะ
  // คือเราอยากให้มันเท่า DIMS ที่ตั้งไว้ เพื่อจะให้ได้ผลที่ดีที่สุด ไม่งั้นเราจะ throw error
  if (vector.length !== EXPECTED_EMBEDDING_DIMS) {
    const error = new Error(
      `Embedding dimension mismatch: expected ${EXPECTED_EMBEDDING_DIMS}, got ${vector.length}`
    );
    error.name = "UpstreamError";
    error.status = 502;

    throw error;
  }

  return vector;
};

// เอาค่าเดียวกันนี้ไปใช้ที่อื่นด้วย
export const GEMINI_EMBEDDING_DIMS = EXPECTED_EMBEDDING_DIMS;

// temperature คือ การ set ค่าความสร้างสรรค์ของ ai แต่ยิ่งมากก็ยิ่งหลอน ยิ่งไม่ตรงประเด็น ไม่ make sense
// 0.2 กำลังพอดี
export const generateText = async ({
  apiKey = process.env.GEMINI_API_KEY,
  prompt,
  baseUrl = process.env.GEMINI_API_BASE_URL || DEFAULT_BASE_URL,
  model = process.env.GEMINI_GENERATION_MODEL || GENERATION_MODEL,
  timeoutMs = Number(process.env.GEMINI_HTTP_TIMEOUT_MS || 20000),
  temperature = Number(process.env.GEMINI_TEMPERATURE || 0.2),
} = {}) => {
  const trimmed = String(prompt || "").trim();

  // ถ้าไม่มี trimmed จะ
  if (!trimmed) {
    const error = new Error("generateText requires non-empty prompt");
    error.name = "ValidationError";
    error.status = 400;
    throw error;
  }

  // ถ้าไม่มี apiKey จะ
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY must be set to generate response");
    error.name = "ConfigurationError";
    error.status = 500;
    throw error;
  }

  // ค่าใน model จะถูกแปลงเป็น ค่าที่ถูกต้อง ในการเอามาทำเป็น URL เป็น defensive
  const url = `${baseUrl}/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const { data } = await axios.post(
    url,
    {
      contents: [
        {
          role: "user",
          parts: [{ text: trimmed }],
        },
      ],
      generationConfig: {
        temperature,
      },
    },
    {
      timeout: timeoutMs,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts
        .map((p) => p?.text)
        .filter(Boolean)
        .join("")
    : null;

  // ถ้าไม่มี text จะ
  if (!text) {
    const error = new Error("Unexpected Gemini generateContent response shape");
    error.name = "UpstreamError";
    error.status = 502;
    error.details = { receivedKeys: data ? Object.keys(data) : null };

    throw error;
  }

  return String(text).trim();
};
