// นี่คือไฟล์ต้นแบบ เป็นเหมือนแม่แบบ

import { expect, test } from "vitest";

// ไฟล์ที่เราต้องการเอามา test
import { sum } from "../../utils/sum.js";

// ใช้ it หรือ test ก็ได้
test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});
