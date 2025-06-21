import axios from "axios";

// Sử dụng biến môi trường hoặc mặc định là http://localhost:3001
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Thêm interceptor để tự động gắn token vào header Authorization
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý các lỗi phản hồi
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ, xóa thông tin đăng nhập và chuyển hướng đến trang đăng nhập
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default instance;
