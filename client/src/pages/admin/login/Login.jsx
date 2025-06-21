import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import '../../../assets/css/admin-login.css';
import '../../../assets/css/loading.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAdminAuth();
  
  // Lấy đường dẫn trước đó nếu có, mặc định là '/admin'
  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    // Nếu đã đăng nhập thì chuyển đến trang admin
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sử dụng hàm login từ context
      const response = await login(username, password);
      if (response && response.token) {
        // Đăng nhập thành công, việc điều hướng sẽ được xử lý bởi useEffect
      } else {
        setError('Đăng nhập không thành công');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setError(error.message || 'Đăng nhập không thành công. Kiểm tra thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-bg" style={{minHeight:'100vh',background:'linear-gradient(135deg,#e0eafc 0%,#cfdef3 100%)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="login-box" style={{width:400,background:'#fff',borderRadius:18,boxShadow:'0 8px 32px rgba(44,62,80,0.10)',padding:'40px 32px'}}>
        <div className="login-logo" style={{fontWeight:800,fontSize:32,letterSpacing:1,color:'#2563eb',textAlign:'center',marginBottom:24}}>
          <span style={{color:'#36d1c4'}}>Admin</span> <span style={{color:'#2563eb'}}>Panel</span>
        </div>
        <div className="card border-0" style={{boxShadow:'none',background:'transparent'}}>
          <div className="card-body login-card-body p-0">
            <p className="login-box-msg" style={{fontWeight:600,fontSize:18,color:'#374151',textAlign:'center',marginBottom:24}}>Đăng nhập để bắt đầu phiên làm việc</p>
            {error && (
              <div className="alert alert-danger" role="alert" style={{fontWeight:500,fontSize:15}}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="input-group mb-4" style={{borderRadius:12,overflow:'hidden',boxShadow:'0 2px 8px #e0e7ef'}}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  type="password"
                  className="form-control"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <div className="col-7">
                  <div className="icheck-primary" style={{display:'flex',alignItems:'center',gap:6}}>
                    <input type="checkbox" id="remember" style={{width:16,height:16}} />
                    <label htmlFor="remember" style={{fontWeight:500,fontSize:15,marginBottom:0}}>Ghi nhớ đăng nhập</label>
                  </div>
                </div>
                <div className="col-5 text-right">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                    style={{width:'100%',borderRadius:8,fontWeight:700,fontSize:16,background:'linear-gradient(90deg,#36d1c4 0%,#2563eb 100%)',border:'none',boxShadow:'0 2px 8px #e0e7ef',height:44}}
                  >
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
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
