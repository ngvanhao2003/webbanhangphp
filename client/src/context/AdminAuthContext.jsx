import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/admin.service';

// Tạo context
const AdminAuthContext = createContext();

// Hook tùy chỉnh để sử dụng context
export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};

// Provider component
export const AdminAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Kiểm tra trạng thái xác thực khi component được mount
    const checkAuthentication = async () => {
      try {
        const status = await authService.checkAdminStatus();
        setIsAuthenticated(status.authenticated);
        
        if (status.authenticated) {
          setCurrentUser(authService.getAdminUser());
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái xác thực:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Hàm đăng nhập
  const login = async (username, password) => {
    try {
      const data = await authService.loginAdmin(username, password);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};
