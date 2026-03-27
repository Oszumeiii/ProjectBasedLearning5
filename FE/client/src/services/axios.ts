import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// 1. Khởi tạo instance với cấu hình cơ bản
const instance: AxiosInstance = axios.create({
  // Đảm bảo port 3000 khớp với port Backend đang chạy
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor: Tự động đính kèm Token vào mỗi yêu cầu
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // SỬA LỖI CHÍNH: Đổi 'token' thành 'accessToken' để khớp với LoginPage.tsx
    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      // Đính kèm Bearer Token vào header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. Response Interceptor: Xử lý tập trung các lỗi trả về từ Server
instance.interceptors.response.use(
  (response) => {
    // Trả về toàn bộ response hoặc response.data tùy vào cấu trúc project
    // Ở đây giữ nguyên response để các Service có thể đọc được status nếu cần
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // Xử lý lỗi 401 (Unauthorized) - Token hết hạn hoặc không có token
    if (status === 401) {
      console.error("Phiên đăng nhập hết hạn hoặc không hợp lệ (401).");

      // Xóa thông tin cũ để tránh lỗi lặp lại
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Chỉ chuyển hướng nếu không phải đang ở trang login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Xử lý lỗi 403 (Forbidden) - Có token nhưng không có quyền truy cập
    if (status === 403) {
      console.error("Bạn không có quyền truy cập tài nguyên này (403).");
    }

    // Xử lý lỗi 404 (Not Found)
    if (status === 404) {
      console.error("Không tìm thấy đường dẫn API hoặc tài nguyên (404).");
    }

    return Promise.reject(error);
  },
);

export default instance;
