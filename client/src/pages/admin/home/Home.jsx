import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "../../../context/AdminAuthContext";
import Dashboard from "../dashboard/Dashboard";
import Category from "../category/Category";
import Brand from "../brand/Brand";
import PostRoutes from "../post/Post";
import Topic from "../topic/Topic";
import Contact from "../contact/Contact";
import ContactDetail from "../contact/ContactDetail";
import UserManagement from "../user/UserManagement";
import UserEdit from "../user/UserEdit";
import UserAdd from "../user/UserAdd";
import Order from "../order/Order";
import OrderDetail from "../order/OrderDetail";
import Product from "../product/Product";
import ProductAdd from "../product/ProductAdd";
import ProductDetail from "../product/ProductDetail";
import Coupon from "../coupon/Coupon";
import AdminReviewPage from "../review/AdminReviewPage";
import Payment from "../payment/Payment";
import Footer from "../footer/Footer";
import Nav from "../nav/Nav";
import Sidebar from "../sidebar/Sidebar";
import AdminBannerPage from "../banner/AdminBannerPage";
import BannerEditPage from "../banner/BannerEditPage";

export default function Home() {
  const { isAuthenticated, loading } = useAdminAuth();

  // Nếu không được xác thực, component sẽ không render vì đã có ProtectedRoute
  // Nhưng thêm kiểm tra này để đảm bảo an toàn hơn
  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="wrapper">
      <Nav />
      <Sidebar />
      <div className="content-wrapper">
        {" "}
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="product" element={<Product />} />
          <Route path="product/add" element={<ProductAdd />} />
          <Route path="product/edit/:id" element={<ProductDetail />} />
          <Route path="category" element={<Category />} />
          <Route path="brand" element={<Brand />} />
          <Route path="post/*" element={<PostRoutes />} />
          <Route path="topic" element={<Topic />} />
          <Route path="order" element={<Order />} />
          <Route path="order/:id" element={<OrderDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="contact/:id" element={<ContactDetail />} />
          <Route path="banner" element={<AdminBannerPage />} />
          <Route path="banner/:id/edit" element={<BannerEditPage />} />
          <Route path="coupon" element={<Coupon />} />
          <Route path="review" element={<AdminReviewPage />} />
          <Route path="payment" element={<Payment />} />
          <Route path="user" element={<UserManagement />} />
          <Route path="user/:id/edit" element={<UserEdit />} />
          <Route path="user/add" element={<UserAdd />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
