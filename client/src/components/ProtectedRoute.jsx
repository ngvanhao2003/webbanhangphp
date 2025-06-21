import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import '../assets/css/loading.css';

// Component bảo vệ các route admin, chỉ cho phép truy cập nếu đã đăng nhập
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  // Nếu đang tải, hiển thị loader
  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  // Nếu không được xác thực, chuyển hướng đến trang đăng nhập
  // và lưu lại đường dẫn đang cố truy cập để sau khi đăng nhập có thể quay lại
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Nếu đã xác thực, hiển thị các children của route
  return <Outlet />;
};

export default ProtectedRoute;
