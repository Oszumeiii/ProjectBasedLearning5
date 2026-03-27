const axios = require("axios");

async function testRegister() {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/register",
      {
        // Khớp với cột full_name
        full_name: "Nguyen Van A",
        // Khớp với cột email (đã có UNIQUE constraint)
        email: "sv04@gmail.vn",
        // Khớp với cột major
        major: "Information Technology",
        // Khớp với cột student_code (DB của bạn dùng student_code, không phải MSSV)
        student_code: "2024IT001",
        // Password để BE băm (hash)
        password: "123456a",
        // Khớp với check constraint 'role' (student, lecturer, manager, admin)
        role: "student",
        // Thêm thông tin bổ sung để test các cột khác trong DB
        class_name: "IT-K24",
        gender: "male", // khớp với check constraint gender
        intake_year: 2024,
      },
    );

    console.log("✅ REGISTER SUCCESS:");
    console.log("Response Data:", response.data);

    if (response.data.activation_token) {
      console.log(
        "💡 Tip: Dùng token này để test tiếp API Verify Email/Activate",
      );
    }
  } catch (error) {
    console.log("❌ REGISTER FAILED:");
    if (error.response) {
      // Hiển thị lỗi từ Validation của Backend hoặc lỗi Constraint từ DB trả về
      console.error("Status:", error.response.status);
      console.error("Error Detail:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }
  }
}

testRegister();
