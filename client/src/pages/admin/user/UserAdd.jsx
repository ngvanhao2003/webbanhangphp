import React, { useState } from 'react';
import adminService from '../../../services/admin.service';
import { useNavigate } from 'react-router-dom';

export default function UserAdd() {
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    role: 'user',
    status: 1,
    avatar: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAvatarChange = e => {
    setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      let avatarUrl = '';
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);

        const res = await adminService.post('/api/users/upload-avatar', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        avatarUrl = res.data.avatar || '';
        console.log('Avatar upload response:', res.data);
      }

      // Chuẩn bị dữ liệu gửi lên backend
      const userData = { ...form, name: form.full_name, avatar: avatarUrl };
      delete userData.full_name;

      if (userData.role === 'editor') userData.role = 'staff';

      userData.status = Number(userData.status);

      console.log('Dữ liệu gửi lên backend:', userData);

      await adminService.post('/api/users', userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      navigate('/admin/user');
    } catch (err) {
      console.error('Lỗi chi tiết:', err.response || err);

      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Tạo người dùng thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
      padding: 0
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(44,62,80,0.10)',
        padding: '40px 32px',
        width: '100%',
        maxWidth: 420
      }}>
        <h2 className="mb-4" style={{ fontWeight: 800, color: '#2563eb', textAlign: 'center', marginBottom: 32, letterSpacing: 1 }}>Thêm người dùng mới</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group mb-4">
            <input className="form-control" name="username" value={form.username} onChange={handleChange} required placeholder="Tên đăng nhập" style={{ height: 48, fontSize: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', marginBottom: 16 }} />
            <input className="form-control" name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Họ tên" style={{ height: 48, fontSize: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', marginBottom: 16 }} />
            <input className="form-control" name="email" value={form.email} onChange={handleChange} required type="email" placeholder="Email" style={{ height: 48, fontSize: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', marginBottom: 16 }} />
            <input className="form-control" name="password" value={form.password} onChange={handleChange} required type="password" placeholder="Mật khẩu" style={{ height: 48, fontSize: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', marginBottom: 16 }} />
            <select className="form-control" name="role" value={form.role} onChange={handleChange} style={{ height: 48, fontSize: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', marginBottom: 16 }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
            <select className="form-control" name="status" value={form.status} onChange={handleChange} style={{ height: 48, fontSize: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', marginBottom: 16 }}>
              <option value={1}>Kích hoạt</option>
              <option value={0}>Vô hiệu hóa</option>
            </select>
            {/* <input type="file" className="form-control-file" accept="image/*" onChange={handleAvatarChange} style={{ marginBottom: 16 }} /> */}
          </div>
          {error && <div className="text-danger mb-3 text-center" style={{ fontWeight: 600 }}>{error}</div>}
          <button className="btn btn-primary w-100" type="submit" disabled={loading} style={{ fontWeight: 700, borderRadius: 12, height: 48, fontSize: 17, background: 'linear-gradient(90deg,#36d1c4 0%,#2563eb 100%)', border: 'none', boxShadow: '0 2px 8px #e0e7ef' }}>
            {loading ? 'Đang tạo...' : 'Tạo người dùng'}
          </button>
        </form>
      </div>
    </div>
  );
}
