import './App.css';
import React, { Profiler } from 'react'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Home from './pages/admin/home/Home'
import Login from './pages/admin/login/Login';
import Register from './pages/admin/login/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';
import UserHome from './pages/home/UserHome';
import Contact from './pages/contact/Contact';
import About from './pages/about/About';
import ProductAll from './pages/products/ProductAll';
import ProductDetail from './pages/products/ProductDetail';
import LoginForm from './pages/login/login';
import RegisterForm from './pages/login/register';
import { ToastContainer } from 'react-toastify';
import VerifyEmail from './components/VerifyEmail';
import Cart from './pages/cart/Cart';
import 'react-toastify/dist/ReactToastify.css';
import ForgotPasswordForm from './pages/login/ForgotPasswordForm';
import ChangePasswordForm from './pages/login/ChangePasswordForm';
import Profile from './pages/profile/Profile';
import AddressList from './pages/profile/Address';
import Order from './pages/order/Order';
import Orders from './pages/order/Orders';
import OrderDetail from './pages/order/OrderDetail';
import MomoReturn from './pages/payment/MomoReturn';
function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path='/admin/login' element={<Login/>} />
          <Route path='/admin/register' element={<Register/>} />
          
          {/* Protected admin routes */}
          <Route element={<ProtectedRoute />}>
            <Route path='/admin/*' element={<Home />} />
          </Route>
          {/* ✅ User home route */}
          <Route path="/" element={<UserHome />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/san-pham" element={<ProductAll />} />
          <Route path="/san-pham/:id" element={<ProductDetail />} />
          {/* User authentication routes */}
          <Route path="/login" element={<LoginForm/>} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/cart" element={<Cart/>} />
          <Route path="/user/detail/:id" element={<Profile />} />
          <Route path="/user/address/:id" element={<AddressList />} />
          <Route path="/order/:id" element={<Order />} />
          <Route path="/chitiet/:id" element={<OrderDetail />} />
          <Route path="/orders/user/:userId" element={<Orders />} />
          <Route path="/payment/momo-return" element={<MomoReturn />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/change-password" element={<ChangePasswordForm />} />
          </Route>
          
          {/* Default redirect */}
          {/* <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} /> */}
        </Routes>
        <ToastContainer />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
