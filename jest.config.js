module.exports = {
  preset: "ts-jest", // ใช้ ts-jest เพื่อรองรับ TypeScript
  testEnvironment: "node", // ใช้ environment แบบ Node.js
  testMatch: ["**/test/**/*.test.ts"], // รันเฉพาะไฟล์ในโฟลเดอร์ "test/" ที่ลงท้ายด้วย .test.ts
};
