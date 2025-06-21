import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../assets/css/admin-login.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Gửi request đăng ký (cần chỉnh lại endpoint cho phù hợp backend)
      const res = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, full_name: fullName, email })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Đăng ký thành công! Bạn có thể đăng nhập.');
        setTimeout(() => navigate('/admin/login'), 1500);
      } else {
        setError(data.message || 'Đăng ký thất bại!');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-bg" style={{minHeight:'100vh',background:'linear-gradient(135deg,#e0eafc 0%,#cfdef3 100%)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="login-box" style={{width:400,background:'#fff',borderRadius:18,boxShadow:'0 8px 32px rgba(44,62,80,0.10)',padding:'40px 32px'}}>
        <div className="login-logo" style={{fontWeight:800,fontSize:32,letterSpacing:1,color:'#2563eb',textAlign:'center',marginBottom:24}}>
          <span style={{color:'#36d1c4'}}>Admin</span> <span style={{color:'#2563eb'}}>Register</span>
        </div>
        <div className="card border-0" style={{boxShadow:'none',background:'transparent'}}>
          <div className="card-body login-card-body p-0">
            <p className="login-box-msg" style={{fontWeight:600,fontSize:18,color:'#374151',textAlign:'center',marginBottom:24}}>Tạo tài khoản quản trị mới</p>
            {error && (
              <div className="alert alert-danger" role="alert" style={{fontWeight:500,fontSize:15}}>
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success" role="alert" style={{fontWeight:500,fontSize:15}}>
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="input-group mb-4" style={{borderRadius:12,overflow:'hidden',boxShadow:'0 2px 8px #e0e7ef'}}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  style={{height:48,fontSize:16,border:'none',background:'#f8fafc'}}
                />
                <div className="input-group-append">
                  <div className="input-group-text" style={{background:'#e0e7ef',border:'none'}}>
                    <span className="fas fa-user" style={{color:'#2563eb',fontSize:18}}></span>
                  </div>
                </div>
              </div>
              <div className="input-group mb-4" style={{borderRadius:12,overflow:'hidden',boxShadow:'0 2px 8px #e0e7ef'}}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Họ tên"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  style={{height:48,fontSize:16,border:'none',background:'#f8fafc'}}
                />
                <div className="input-group-append">
                  <div className="input-group-text" style={{background:'#e0e7ef',border:'none'}}>
                    <span className="fas fa-id-card" style={{color:'#2563eb',fontSize:18}}></span>
                  </div>
                </div>
              </div>
              <div className="input-group mb-4" style={{borderRadius:12,overflow:'hidden',boxShadow:'0 2px 8px #e0e7ef'}}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{height:48,fontSize:16,border:'none',background:'#f8fafc'}}
                />
                <div className="input-group-append">
                  <div className="input-group-text" style={{background:'#e0e7ef',border:'none'}}>
                    <span className="fas fa-envelope" style={{color:'#2563eb',fontSize:18}}></span>
                  </div>
                </div>
              </div>
              <div className="input-group mb-4" style={{borderRadius:12,overflow:'hidden',boxShadow:'0 2px 8px #e0e7ef'}}>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{height:48,fontSize:16,border:'none',background:'#f8fafc'}}
                />
                <div className="input-group-append">
                  <div className="input-group-text" style={{background:'#e0e7ef',border:'none'}}>
                    <span className="fas fa-lock" style={{color:'#2563eb',fontSize:18}}></span>
                  </div>
                </div>
              </div>
              <div className="row mb-3 align-items-center">
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-block"
                    style={{width:'100%',borderRadius:8,fontWeight:700,fontSize:16,border:'2px solid #36d1c4',color:'#2563eb',background:'#f8fafc',height:44}}
                    onClick={() => navigate('/admin/login')}
                  >
                    Đăng nhập
                  </button>
                </div>
                <div className="col-6 text-right">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                    style={{width:'100%',borderRadius:8,fontWeight:700,fontSize:16,background:'linear-gradient(90deg,#36d1c4 0%,#2563eb 100%)',border:'none',boxShadow:'0 2px 8px #e0e7ef',height:44}}
                  >
                    {loading ? 'Đang xử lý...' : 'Đăng ký'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
