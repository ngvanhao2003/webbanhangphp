import React from 'react';
import { Link } from 'react-router-dom';
import '../../../assets/css/admin-sidebar.css';
import { useAdminAuth } from '../../../context/AdminAuthContext';

export default function Sidebar() {
    const { currentUser } = useAdminAuth();
    return (
        <aside className="admin-sidebar main-sidebar sidebar-dark-primary elevation-4">
            <Link to="/admin" className="brand-link" style={{ textDecoration: 'none' }}>
                <img src={`${process.env.PUBLIC_URL}/assets/dist/img/AdminLTELogo.png`} className="brand-image img-circle elevation-3" alt="Logo" style={{ opacity: '0.8' }}/>
                <span className="brand-text font-weight-light">Admin</span>
            </Link>
            <div className="sidebar">
                <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                    <div className="image">
                        <img src={currentUser?.avatar || `${process.env.PUBLIC_URL}/assets/dist/img/user2-160x160.jpg`} className="img-circle elevation-2" alt="User"/>
                    </div>
                    <div className="info">
                        <span className="d-block text-light">{currentUser?.username || 'Admin'}</span>
                    </div>
                </div>
                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                        <li className="nav-item">
                            <Link to="/admin/dashboard" className="nav-link">
                                <i className="nav-icon fas fa-tachometer-alt"></i>
                                <p style={{ color: 'white' }}>Dashboard</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/order" className="nav-link">
                                <i className="fas fa-shopping-bag"></i>
                                <p style={{ color: 'white' }}>Đơn hàng</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/product" className="nav-link">
                                <i className="fas fa-cube"></i>
                                <p style={{ color: 'white' }}>Sản phẩm</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/coupon" className="nav-link">
                                <i className="fas fa-tag"></i>
                                <p style={{ color: 'white' }}>Mã giảm giá</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/review" className="nav-link">
                                <i className="fas fa-star nav-icon"></i>
                                <p style={{ color: 'white' }}>Quản lý đánh giá</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/banner" className="nav-link">
                                <i className="fas fa-image nav-icon"></i>
                                <p style={{ color: 'white' }}>Quản lý Banner</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/user" className="nav-link">
                                <i className="fas fa-users nav-icon"></i>
                                <p style={{ color: 'white' }}>Quản lý người dùng</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/category" className="nav-link">
                                <i className="fas fa-list-alt nav-icon"></i>
                                <p style={{ color: 'white' }}>Quản lý danh mục</p>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/admin/brand" className="nav-link">
                                <i className="fas fa-copyright nav-icon"></i>
                                <p style={{ color: 'white' }}>Quản lý thương hiệu</p>
                            </Link>
                        </li>
                        {/* <li className="nav-item">
                            <Link to="/admin/post" className="nav-link">
                                <i className="fas fa-newspaper nav-icon"></i>
                                <p style={{ color: 'white' }}>Quản lý bài viết</p>
                            </Link>
                        </li> */}
                        <li className="nav-item">
                            <Link to="/admin/contact" className="nav-link">
                                <i className="fas fa-address-book nav-icon"></i>
                                <p style={{ color: 'white' }}>Quản lý liên hệ</p>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}