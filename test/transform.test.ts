import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

// โหลด Proto Definition
const PROTO_PATH = path.join(__dirname, "../proto/transform.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const transformProto: any =
  grpc.loadPackageDefinition(packageDefinition).transform;

// สร้าง gRPC Client
const client = new transformProto.TransformService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

describe("TransformService gRPC Tests", () => {
  /** ทดสอบกรณีส่ง URL ที่ถูกต้อง */
  it("should return transformed data for a valid URL", (done) => {
    // ตัวอย่าง URL ที่ใช้ได้จริง
    const testUrl = "https://dummyjson.com/users";

    client.Transform({ url: testUrl }, (err: any, response: any) => {
      try {
        // ตรวจสอบว่าไม่มี Error
        expect(err).toBeNull();

        // ตรวจสอบ Response
        expect(response).toBeDefined();
        expect(response.departments).toBeDefined();

        // ตรวจสอบว่ามีข้อมูล department อย่างน้อย 1 รายการ
        const departments = response.departments;
        expect(Object.keys(departments).length).toBeGreaterThan(0);

        // ตรวจสอบข้อมูลของ department ในระดับลึก (sample)
        const sampleDepartmentKey = Object.keys(departments)[0];
        const sampleDepartment = departments[sampleDepartmentKey];
        expect(sampleDepartment).toHaveProperty("male"); // ตรวจสอบว่ามีฟิลด์ `male`
        expect(sampleDepartment).toHaveProperty("female"); // ตรวจสอบว่ามีฟิลด์ `female`
        expect(sampleDepartment).toHaveProperty("ageRange"); // ตรวจสอบว่ามีฟิลด์ `ageRange`
        expect(sampleDepartment).toHaveProperty("hair"); // ตรวจสอบว่ามีฟิลด์ `hair`
        expect(sampleDepartment).toHaveProperty("addressUser"); // ตรวจสอบว่ามีฟิลด์ `addressUser`

        done(); // จบการทดสอบ
      } catch (error) {
        done(error);
      }
    });
  });

  /** ทดสอบกรณี URL ว่างเปล่า */
  it("should return an error when URL is missing", (done) => {
    client.Transform({ url: "" }, (err: any, response: any) => {
      try {
        // คาดว่าจะเจอ Error
        expect(err).not.toBeNull();

        // ตรวจสอบว่า Error code เป็น INVALID_ARGUMENT
        expect(err.code).toBe(grpc.status.INVALID_ARGUMENT);

        // Response ควรไม่มีข้อมูล
        expect(response).toBeUndefined();

        done(); // จบการทดสอบ
      } catch (error) {
        done(error);
      }
    });
  });

  /** ทดสอบกรณีใช้ URL ที่ไม่ถูกต้อง */
  it("should return an error for an invalid URL", (done) => {
    const invalidUrl = "invalid_url"; // URL ที่ไม่สามารถดึงข้อมูลได้

    client.Transform({ url: invalidUrl }, (err: any, response: any) => {
      try {
        // คาดว่าจะเจอ Error
        expect(err).not.toBeNull();

        // ตรวจสอบว่า Error code เป็น INTERNAL
        expect(err.code).toBe(grpc.status.INTERNAL);

        // Response ควรไม่มีข้อมูล
        expect(response).toBeUndefined();

        done(); // จบการทดสอบ
      } catch (error) {
        done(error);
      }
    });
  });
});
