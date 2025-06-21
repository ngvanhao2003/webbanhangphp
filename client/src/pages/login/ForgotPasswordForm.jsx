import React, { useState } from 'react';
import { toast } from 'react-toastify';

function ForgotPasswordForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gửi yêu cầu thất bại');
      }

      const data = await res.json();
      toast.success(data.message || 'Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email.');

      // Tự động đóng form sau 2 giây, nếu onClose là hàm thì gọi
      setTimeout(() => {
        if (typeof onClose === 'function') {
          onClose();
        }
      }, 2000);
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
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
        }}
        // Khi click background thì gọi onClose nếu là hàm
        onClick={() => {
          if (typeof onClose === 'function') {
            onClose();
          }
        }}
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
        onClick={(e) => e.stopPropagation()} // Ngăn không cho click trong form đóng popup
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
          Quên mật khẩu
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
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
              Email đăng ký
            </label>
            <input
              type="email"
              id="email"
              placeholder="Nhập email của bạn"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </form>
      </div>
    </>
  );
}

export default ForgotPasswordForm;
