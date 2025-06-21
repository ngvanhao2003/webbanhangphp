import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';

export default function Nav() {
    const { currentUser, logout } = useAdminAuth();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };
    
    return (        
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
            <ul className="navbar-nav">                <li className="nav-item">
                    <button type="button" className="nav-link btn" data-widget="pushmenu" style={{ background: 'none', border: 'none' }}>
                        <i className="fas fa-bars"></i>
                    </button>
                </li>
            </ul>
            <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                    <div className="nav-link" title={currentUser?.email || ''}>
                        <i className="far fa-user"></i> {currentUser?.name || 'Quản lý'}
                    </div>
                </li>
                <li className="nav-item">
                    <div className="nav-link" style={{cursor: 'pointer'}} onClick={handleLogout}>
                        <i className="fas fa-power-off"></i> Thoát
                    </div>
                </li>
            </ul>
        </nav>
    );
}