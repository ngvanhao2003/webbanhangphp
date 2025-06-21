import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function LoginForm({ onLoginSuccess, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // trạng thái ghi nhớ mật khẩu
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    const data = await res.json();

    localStorage.setItem('token', data.token);

    toast.success('Đăng nhập thành công!');

    onLoginSuccess(data.user);

      setTimeout(() => {
        onClose();
      }, 10);

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      {/* Background mờ */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
          padding: '40px 35px',
          borderRadius: '12px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          width: '360px',
          maxWidth: '90%',
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
          Đăng nhập
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
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
              placeholder="Nhập tên đăng nhập"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 15px',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1.8px solid #ddd',
                transition: 'border-color 0.3s',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#007bff')}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
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
              placeholder="Nhập mật khẩu"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 15px',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1.8px solid #ddd',
                transition: 'border-color 0.3s',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#007bff')}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>

          {/* Phần ghi nhớ mật khẩu và quên mật khẩu */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
              fontSize: '0.9rem',
              color: '#555',
            }}
          >
            <label
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              htmlFor="rememberMe"
            >
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Ghi nhớ mật khẩu
            </label>

            <Link
              to="/forgot-password"
              style={{
                color: '#007bff',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#0056b3')}
              onMouseLeave={(e) => (e.target.style.color = '#007bff')}
            >
              Quên mật khẩu?
            </Link>
          </div>

          {error && (
            <div style={{ color: 'red', marginBottom: '20px', textAlign: 'center' }}>
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
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Nút đăng ký dưới form */}
        <div
          style={{
            marginTop: '22px',
            textAlign: 'center',
            fontSize: '0.95rem',
            color: '#666',
          }}
        >
          <span>Bạn chưa có tài khoản? </span>
          <Link
            to="/register"
            style={{
              color: '#007bff',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'color 0.3s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#0056b3')}
            onMouseLeave={(e) => (e.target.style.color = '#007bff')}
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </>
  );
}

export default LoginForm;
