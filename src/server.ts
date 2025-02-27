import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import axios from "axios";
import path from "path";

// โหลดไฟล์ Proto
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

// ฟังก์ชัน Helper: Transform Data
const transformData = (users: Array<any>) => {
  const result: Record<string, any> = {};

  users.forEach((user) => {
    const department = user?.company?.department || "Unknown";

    if (!result[department]) {
      result[department] = {
        male: 0,
        female: 0,
        ageRange: "",
        hair: {}, // รวบรวมสีผมของผู้ใช้
        addressUser: {}, // ข้อมูล addressUser เป็นแบบ firstName+lastName: postalCode
      };
    }

    // นับจำนวนผู้ชาย / ผู้หญิง
    if (user.gender === "male") {
      result[department].male += 1;
    } else if (user.gender === "female") {
      result[department].female += 1;
    }

    // สร้างช่วงอายุ (ageRange)
    if (!result[department].ageRange) {
      result[department].ageRange = `${user.age}-${user.age}`;
    } else {
      const [minAge, maxAge] = result[department].ageRange
        .split("-")
        .map(Number);
      result[department].ageRange = `${Math.min(minAge, user.age)}-${Math.max(
        maxAge,
        user.age
      )}`;
    }

    // รวบรวมสีผม (hair.color)
    const hairColor = user.hair?.color || "Unknown";
    result[department].hair[hairColor] =
      (result[department].hair[hairColor] || 0) + 1;

    // เพิ่มที่อยู่ใน addressUser
    const userName = `${user.firstName}${user.lastName}`;
    result[department].addressUser[userName] =
      user?.address?.postalCode || "Unknown";
  });

  return result;
};

// Implement TransformService
const transform = async (call: any, callback: any) => {
  const { url } = call.request;

  if (!url) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "URL is required",
    });
  }

  try {
    // ดึงข้อมูลจาก API
    const response = await axios.get(url);
    const users = response.data?.users;

    if (!Array.isArray(users)) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Invalid data from API",
      });
    }

    // ทรานส์ฟอร์มข้อมูล
    const transformedData = transformData(users);
    callback(null, { departments: transformedData });
  } catch (error) {
    console.error("Error while processing data:", error);
    callback({
      code: grpc.status.INTERNAL,
      message: "Failed to process the API",
    });
  }
};

// สร้างและรัน gRPC Server
const server = new grpc.Server();
server.addService(transformProto.TransformService.service, {
  Transform: transform,
});

const PORT = 50051; // Port ของเซิร์ฟเวอร์
server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Failed to start server:", err);
      return;
    }
    console.log(`gRPC server is running on port ${port}`);
  }
);
