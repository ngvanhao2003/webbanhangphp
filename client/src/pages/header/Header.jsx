import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';  // dùng NavLink thay cho Link
import LoginForm from '../login/login'; // import form đăng nhập
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faUser } from '@fortawesome/free-solid-svg-icons';
import '../../assets/style.css';
import logo from '../../assets/img/logo.jpg';

function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const updateCartCountFromStorage = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setCartCount(totalQuantity);
  };

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) setUser(JSON.parse(userJson));
    else setUser(null);

    updateCartCountFromStorage();

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    function onUserChange() {
      const newUserJson = localStorage.getItem('user');
      if (newUserJson) setUser(JSON.parse(newUserJson));
      else setUser(null);
    }

    function handleStorageChange(event) {
      if (event.key === 'cart') {
        updateCartCountFromStorage();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('userChange', onUserChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('userChange', onUserChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowLogin(false);
    localStorage.setItem('user', JSON.stringify(userData));
    window.dispatchEvent(new Event('userChange'));
  };

  const handleLogout = () => {
    setUser(null);
    setShowDropdown(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('userChange'));
  };

  return (
    <>
      <section id="header">
        <NavLink to="/">
          <img src={logo} className="logo" alt="logo" style={{ width: "60px" }} />
        </NavLink>
        <div>
          <ul id="navbar">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'active nav-item' : 'nav-item')}
                end
              >
                Trang chủ
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/san-pham"
                className={({ isActive }) => (isActive ? 'active nav-item' : 'nav-item')}
              >
                Shop
              </NavLink>
            </li>
            {/* <li>
              <NavLink
                to="/blog"
                className={({ isActive }) => (isActive ? 'active nav-item' : 'nav-item')}
              >
                Blog
              </NavLink>
            </li> */}
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => (isActive ? 'active nav-item' : 'nav-item')}
              >
                Liên hệ
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) => (isActive ? 'active nav-item' : 'nav-item')}
              >
                Giới thiệu
              </NavLink>
            </li>

            <li id="lg-bag" style={{ position: 'relative' }}>
              <NavLink to="/cart" style={{ position: 'relative', display: 'inline-block' }}>
                <FontAwesomeIcon icon={faCartShopping} size="lg" />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-12px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '0 7px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      lineHeight: '20px',
                      minWidth: '20px',
                      height: '20px',
                      textAlign: 'center',
                      boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      whiteSpace: 'nowrap',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </NavLink>
            </li>

            <li id="lg-bag" ref={dropdownRef} style={{ position: 'relative' }}>
              {!user ? (
                <button
                  onClick={() => setShowLogin(true)}
                  style={{ fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <FontAwesomeIcon icon={faUser} /> Đăng nhập
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: user ? '#4CAF50' : 'inherit', // Xanh lá nếu đã đăng nhập
                      fontSize: '1.2rem',
                    }}
                    aria-haspopup="true"
                    aria-expanded={showDropdown}
                  >
                    <FontAwesomeIcon icon={faUser} color={user ? '#4CAF50' : undefined} />
                  </button>
                  {showDropdown && (
                    <ul
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                        padding: '10px',
                        width: '180px',
                        zIndex: 1000,
                      }}
                    >
                      <li style={{ padding: '8px 10px' }}>
                        Xin chào, <strong>{user.full_name || user.username}</strong>
                      </li>
                      <li style={{ padding: '8px 10px' }}>
                        <NavLink to={`/user/detail/${user?.id || ''}`}>Thông tin cá nhân</NavLink>
                      </li>
                      {/* <li style={{ padding: '8px 10px' }}>
                        <NavLink to={`/user/address/${user?.id || ''}`}>Địa chỉ</NavLink>
                      </li> */}
                      <li style={{ padding: '8px 10px' }}>
                        <NavLink to="/change-password">Đổi mật khẩu</NavLink>
                      </li>
                      <li style={{ padding: '8px 10px' }}>
                        <NavLink to={`/orders/user/${user?.id || ''}`}>Đơn hàng của tôi</NavLink>
                      </li>
                      <li style={{ padding: '8px 10px', borderTop: '1px solid #ddd', marginTop: '5px' }}>
                        <button
                          onClick={handleLogout}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'red',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left',
                            padding: 0,
                            fontSize: '1rem',
                          }}
                        >
                          Đăng xuất
                        </button>
                      </li>
                    </ul>
                  )}
                </>
              )}
            </li>

            <a href="#" id="close">
              <i className="fa-solid fa-xmark"></i>
            </a>
          </ul>
        </div>

        <div id="mobile">
          <NavLink to="/cart">
            <i className="fa-solid fa-cart-shopping"></i>
          </NavLink>
          <i id="bar" className="fas fa-outdent"></i>
        </div>
      </section>

      {showLogin && (
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}
    </>
  );
}

export default Header;
