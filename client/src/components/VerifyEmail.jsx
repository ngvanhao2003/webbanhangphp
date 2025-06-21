import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

function VerifyEmail() {
  const [message, setMessage] = useState('Đang xác nhận...');
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');

  useEffect(() => {
    if (!token) {
      setMessage('Không tìm thấy mã xác nhận.');
      setStatus('error');
      return;
    }

    fetch(`/api/users/verify-email?token=${token}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          setStatus('error');
          throw new Error(data.message || 'Xác nhận thất bại.');
        }
        setStatus('success');
        return data;
      })
      .then(data => setMessage(data.message))
      .catch(err => setMessage(err.message));
  }, [token]);

  return (
    <div style={{ padding: 20, maxWidth: 480, margin: '40px auto', textAlign: 'center', fontFamily: 'Arial' }}>
      <h2>Xác nhận Email</h2>
      {/* <p style={{ color: status === 'error' ? 'red' : 'green' }}>{message}</p> */}

      {status === 'success' && (
        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
          Đăng nhập ngay
        </Link>
      )}
    </div>
  );
}

export default VerifyEmail;
