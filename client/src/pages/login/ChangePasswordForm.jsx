// ChangePasswordForm.js
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Header from '../../pages/header/Header';
import Footer from '../../pages/footer/Footer';


function ChangePasswordForm({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [showNew, setShowNew] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Lấy token từ localStorage (đồng bộ với backend)
  const token = localStorage.getItem('token');

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    setLoading(true);
    try {
      if (!token) {
        setError('Bạn cần đăng nhập lại.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (res.status === 401) {
        setError(data.message || 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.message || 'Đổi mật khẩu thất bại');
        setLoading(false);
        return;
      }

      toast.success(data.message || 'Đổi mật khẩu thành công!');
      resetForm();
      if (typeof onClose === 'function') onClose();
      navigate('/'); // Chuyển hướng về trang chủ sau khi đổi mật khẩu thành công
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <>
  <Header/>
      <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 400,
        margin: 'auto',
        padding: 24,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
      noValidate
    >
      <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#222' }}>
        Đổi mật khẩu
      </h2>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <label style={{ fontWeight: '600', color: '#333' }} htmlFor="currentPassword">
          Mật khẩu hiện tại
        </label>
        <input
          id="currentPassword"
          type={showCurrent ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            marginTop: 4,
            marginBottom: 12,
            borderRadius: 6,
            border: '1.5px solid #ccc',
            fontSize: 16,
            boxSizing: 'border-box',
            transition: 'border-color 0.3s',
          }}
          required
          autoComplete="current-password"
          placeholder="Nhập mật khẩu hiện tại"
        />
        <button
          type="button"
          onClick={() => setShowCurrent(!showCurrent)}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: '#007bff',
            padding: 0,
          }}
          tabIndex={-1}
        >
          {showCurrent ? 'Ẩn' : 'Hiện'}
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <label style={{ fontWeight: '600', color: '#333' }} htmlFor="newPassword">
          Mật khẩu mới
        </label>
        <input
          id="newPassword"
          type={showNew ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            marginTop: 4,
            marginBottom: 12,
            borderRadius: 6,
            border: '1.5px solid #ccc',
            fontSize: 16,
            boxSizing: 'border-box',
            transition: 'border-color 0.3s',
          }}
          required
          autoComplete="new-password"
          placeholder="Nhập mật khẩu mới"
          minLength={6}
        />
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: '#007bff',
            padding: 0,
          }}
          tabIndex={-1}
        >
          {showNew ? 'Ẩn' : 'Hiện'}
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <label style={{ fontWeight: '600', color: '#333' }} htmlFor="confirmPassword">
          Xác nhận mật khẩu mới
        </label>
        <input
          id="confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            marginTop: 4,
            marginBottom: 12,
            borderRadius: 6,
            border: '1.5px solid #ccc',
            fontSize: 16,
            boxSizing: 'border-box',
            transition: 'border-color 0.3s',
          }}
          required
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
          minLength={6}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: '#007bff',
            padding: 0,
          }}
          tabIndex={-1}
        >
          {showConfirm ? 'Ẩn' : 'Hiện'}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 20,
            color: 'red',
            fontWeight: '600',
            textAlign: 'center',
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: 14,
          backgroundColor: loading ? '#8ab4f8' : '#007bff',
          color: '#fff',
          fontSize: 18,
          fontWeight: '700',
          border: 'none',
          borderRadius: 10,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(0,123,255,0.5)',
          transition: 'background-color 0.3s, box-shadow 0.3s',
        }}
      >
        {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
      </button>
    </form>
    <Footer/>
  </>
  );
}

export default ChangePasswordForm;