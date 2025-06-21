import axiosInstance from "../axios";

const authService = {
  // Đăng nhập với quyền admin
  async loginAdmin(username, password) {
    try {
      console.log("Gọi API đăng nhập admin:", `/api/auth/admin/login`);
      const response = await axiosInstance.post(`/api/auth/admin/login`, {
        username,
        password,
      });

      if (response.data.token) {
        // Lưu thông tin đăng nhập vào localStorage
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("adminUser", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      throw error.response ? error.response.data : error;
    }
  },

  // Kiểm tra trạng thái đăng nhập của admin
  async checkAdminStatus() {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        return { authenticated: false };
      }

      console.log("Gọi API kiểm tra trạng thái:", `/api/auth/admin/status`);
      const response = await axiosInstance.get(`/api/auth/admin/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Lỗi kiểm tra trạng thái:", error);
      // Nếu token không hợp lệ hoặc hết hạn
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      return { authenticated: false };
    }
  },

  // Lấy token từ localStorage
  getAdminToken() {
    return localStorage.getItem("adminToken");
  },

  // Lấy thông tin user từ localStorage
  getAdminUser() {
    const userStr = localStorage.getItem("adminUser");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Đăng xuất
  logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  },

  // Gọi API lấy danh sách người dùng
  async get(url, config) {
    return axiosInstance.get(url, config);
  },

  // Gọi API tạo mới
  async post(url, data, config) {
    return axiosInstance.post(url, data, config);
  },

  // Gọi API cập nhật người dùng
  async put(url, data, config) {
    return axiosInstance.put(url, data, config);
  },

  // Gọi API xóa người dùng
  async delete(url, config) {
    return axiosInstance.delete(url, config);
  },
};

export default authService;
