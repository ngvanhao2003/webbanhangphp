import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Link,useNavigate } from 'react-router-dom';

function RegisterForm({ onRegisterSuccess, onClose }) {
    const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // Xử lý submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name || !form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    try {
      // Giả lập gọi API, bạn thay đoạn này bằng fetch/post thật
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Đăng ký thất bại');
      }
    // Sau khi đăng ký thành công, thay vì toast "Đăng ký thành công!"
    toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
    navigate('/'); // Chuyển hướng đến trang đăng nhập
      if (onRegisterSuccess) onRegisterSuccess();
      setTimeout(onClose, 500); // Đóng popup sau khi đăng ký thành công
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nền mờ */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
        }}
        onClick={onClose}
      />
      {/* Form popup */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          padding: '38px 32px',
          borderRadius: '12px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          width: '380px',
          maxWidth: '95%',
          zIndex: 1000,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            marginBottom: '25px',
            fontWeight: '700',
            fontSize: '1.8rem',
            color: '#333',
            textAlign: 'center',
            letterSpacing: '1px',
          }}
        >
          Đăng ký tài khoản
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Họ tên */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#555',
                fontSize: '0.95rem',
              }}
            >
              Họ tên
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              placeholder="Nhập họ tên"
              value={form.full_name}
              onChange={handleChange}
              style={inputStyle}
              required
              autoFocus
              onFocus={(e) => (e.target.style.borderColor = '#007bff')}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>
          {/* Tên đăng nhập */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#555',
                fontSize: '0.95rem',
              }}
            >
              Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Nhập tên đăng nhập"
              value={form.username}
              onChange={handleChange}
              style={inputStyle}
              required
              onFocus={(e) => (e.target.style.borderColor = '#007bff')}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>
          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#555',
                fontSize: '0.95rem',
              }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Nhập email"
              value={form.email}
              onChange={handleChange}
              style={inputStyle}
              required
              onFocus={(e) => (e.target.style.borderColor = '#007bff')}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>
          {/* Mật khẩu */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#555',
                fontSize: '0.95rem',
              }}
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              style={inputStyle}
              required
              onFocus={(e) => (e.target.style.borderColor = '#007bff')}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>
          {/* Xác nhận mật khẩu */}
          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: '600',
                color: '#555',
                fontSize: '0.95rem',
              }}
            >
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={handleChange}
              style={inputStyle}
              required
              onFocus={(e) => (e.target.style.borderColor = '#007bff')}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>
          {error && (
            <div style={{ color: 'red', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 0',
              backgroundColor: loading ? '#8ab4f8' : '#007bff',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: '700',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0,123,255,0.4)',
              transition: 'background-color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#0056b3';
                e.target.style.boxShadow = '0 6px 15px rgba(0,86,179,0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#007bff';
                e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.4)';
              }
            }}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        {/* Đã có tài khoản? */}
        <div
          style={{
            marginTop: '22px',
            textAlign: 'center',
            fontSize: '0.95rem',
            color: '#666',
          }}
        >
          <span>Đã có tài khoản? </span>
          <Link
            to="/login"
            style={{
              color: '#007bff',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#0056b3')}
            onMouseLeave={(e) => (e.target.style.color = '#007bff')}
            onClick={onClose}
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  fontSize: '1rem',
  borderRadius: '8px',
  border: '1.8px solid #ddd',
  transition: 'border-color 0.3s',
  outline: 'none',
};

export default RegisterForm;
