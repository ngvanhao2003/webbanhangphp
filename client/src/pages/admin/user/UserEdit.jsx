import React, { useEffect, useState } from 'react';
import adminService from '../../../services/admin.service';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    role: '',
    status: 1
  });

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await adminService.get(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setForm({
        username: res.data.username || '',
        full_name: res.data.full_name || '',
        email: res.data.email || '',
        role: res.data.role || '',
        status: res.data.status
      });
    } catch (err) {
      setError('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      await adminService.put(`/api/users/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/admin/user');
    } catch (err) {
      setError('Cập nhật thất bại');
    }
  };

  return (
    <div className="content-wrapper d-flex align-items-center justify-content-center" style={{minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)'}}>
      <div className="card shadow-lg p-4" style={{maxWidth: 480, width: '100%', borderRadius: 24, background: '#fff', border: 'none', margin: '40px auto'}}>
        <div className="mb-4 d-flex align-items-center justify-content-between">
          <h2 style={{fontWeight: 700, color: '#2563eb', margin: 0}}>Chỉnh sửa người dùng</h2>
          <Link to="/admin/user" className="btn btn-light" style={{borderRadius: 8, fontWeight: 600, color: '#2563eb', border: '1px solid #cbd5e1'}}>Quay lại</Link>
        </div>
        {loading ? (
          <div className="text-center" style={{fontSize: 20, color: '#64748b'}}>Đang tải...</div>
        ) : error ? (
          <div className="text-danger text-center" style={{fontSize: 18}}>{error}</div>
        ) : (
          <form onSubmit={handleSubmit} style={{width: '100%'}}>
            <div className="form-group text-center mb-4">
              <img src={form.avatar || user?.avatar || '/images/users/default-avatar.png'} alt="avatar" style={{width:90, height:90, borderRadius:'50%', objectFit:'cover', marginBottom:8, boxShadow:'0 2px 8px #cbd5e1'}} />
            </div>
            <div className="form-group mb-3">
              <label style={{fontWeight: 500}}>Tên đăng nhập</label>
              <input className="form-control" name="username" value={form.username} disabled style={{background:'#e5e7eb', fontWeight:500}} />
            </div>
            <div className="form-group mb-3">
              <label style={{fontWeight: 500}}>Họ tên</label>
              <input className="form-control" name="full_name" value={form.full_name} onChange={handleChange} style={{background:'#fff'}} />
            </div>
            <div className="form-group mb-3">
              <label style={{fontWeight: 500}}>Email</label>
              <input className="form-control" name="email" value={form.email} onChange={handleChange} style={{background:'#fff'}} />
            </div>
            <div className="form-group mb-3">
              <label style={{fontWeight: 500}}>Vai trò</label>
              <select className="form-control" name="role" value={form.role} onChange={handleChange} style={{background:'#fff'}}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <div className="form-group mb-4">
              <label style={{fontWeight: 500}}>Trạng thái</label>
              <select className="form-control" name="status" value={form.status} onChange={handleChange} style={{background:'#fff'}}>
                <option value={1}>Kích hoạt</option>
                <option value={0}>Vô hiệu hóa</option>
              </select>
            </div>
            {error && <div className="text-danger mb-3 text-center" style={{fontWeight:500}}>{error}</div>}
            <button className="btn btn-primary btn-block" type="submit" style={{borderRadius: 8, fontWeight: 700, fontSize: 18, padding: '10px 0', boxShadow:'0 1px 4px #cbd5e1'}}>Lưu</button>
          </form>
        )}
      </div>
    </div>
  );
}
