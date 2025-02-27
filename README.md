# **TransformService - gRPC Service**

TransformService เป็นโปรเจกต์ที่ใช้ **gRPC** และ **TypeScript** ในการสร้าง Web Service สำหรับแปลงข้อมูล (`Transform`) ของผู้ใช้ที่ดึงมาจาก API ภายนอกให้เป็นโครงสร้างที่กำหนดเอง เช่น การจัดกลุ่มพนักงานตามแผนก (department), นับจำนวนพนักงานชายและหญิง, ช่วงอายุ และอื่น ๆ

---

## **Features**

1. **Input URL** – รองรับการส่ง URL เพื่อดึงข้อมูล JSON จาก API ภายนอก
2. **การแปลงข้อมูล (Transform):**
   - จัดกลุ่มตามแผนก (`department`)
   - นับจำนวนผู้ชาย (`male`) และผู้หญิง (`female`) ในแต่ละแผนก
   - กำหนดช่วงอายุ (`ageRange`) สำหรับแต่ละแผนก
   - รวมสีผม (`hair color`) ของพนักงาน
   - เก็บข้อมูลที่อยู่ผู้ใช้ (`firstName+LastName -> postalCode`)
3. **Error Handling:**

   - ตรวจสอบว่าข้อมูลที่ส่งมา (URL) ถูกต้องหรือไม่
   - จัดการกรณีที่ API ส่งข้อมูลผิดโครงสร้าง
   - ทดสอบกรณี URL ว่างเปล่า

4. **ใช้ gRPC Protocol** –
   - API ทั้งหมดอยู่ในรูปแบบ gRPC เพื่อประสิทธิภาพสูง
   - ใช้ Protocol Buffers สำหรับ Schema ของการสื่อสาร

---

## **Technology Stack**

- **Language**: TypeScript (รองรับการเขียนด้วย strongly-typed syntax)
- **gRPC**:
  - ใช้สำหรับสื่อสารระหว่าง Client และ Server
  - Protocol Buffers (`.proto`) สำหรับการกำหนด Schema
- **HTTP Client**: Axios (ใช้ในการดึงข้อมูลจาก API ภายนอก)
- **Unit Testing**: Jest (ตรวจสอบการทำงานของ Service)
- **Package Management**: npm

---

## **API Schema**

### **Proto Schema (`transform.proto`)**:

```proto
syntax = "proto3";

service TransformService {
  rpc Transform (TransformRequest) returns (TransformResponse);
}

message TransformRequest {
  string url = 1; // URL ของข้อมูล JSON ที่จะนำมาแปลง
}

message TransformResponse {
  map<string, DepartmentData> departments = 1; // โครงสร้างข้อมูลของแผนก
}

message DepartmentData {
  int32 male = 1; // จำนวนผู้ชาย
  int32 female = 2; // จำนวนผู้หญิง
  string ageRange = 3; // ช่วงอายุ (เช่น "20-50")
  map<string, int32> hair = 4; // สีผมที่รวบรวม
  map<string, string> addressUser = 5; // ที่อยู่ของผู้ใช้
}
```

---

## **Getting Started**

### **1. ติดตั้ง Dependencies**

โปรเจกต์นี้ใช้ **npm** ในการจัดการ dependencies

```bash
npm install
```

---

### **2. รัน gRPC Server**

เริ่มการทำงานของ gRPC Server โดยใช้คำสั่งนี้:

```bash
npx ts-node src/server.ts
```

หรือ

```bash
ืnpm run dev
```

Server จะเริ่มทำงานที่ localhost:50051

---
