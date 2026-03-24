const axios = require("axios");

async function testRegister() {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/register",
      {
        name: "Nguyen Van A",
        email: "test1@test.com",
        major: "Information Technology",
        MSSV: "1001",
        password: "123456",
        role: "student",
      },
    );

    console.log("REGISTER SUCCESS:");
    console.log(response.data);
  } catch (error) {
    console.log("REGISTER FAILED:");

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

testRegister();
