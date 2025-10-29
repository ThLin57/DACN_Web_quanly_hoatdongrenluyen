import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import http from '../../services/http';
import './AuthModern.css';

export default function ForgotPasswordModern() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [devToken, setDevToken] = React.useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDevToken('');
    if (!identifier) {
      setError('Vui lòng nhập email hoặc mã số');
      return;
    }
    try {
      setIsLoading(true);
      const res = await http.post('/auth/forgot', { identifier: identifier.trim() });
      const data = res.data?.data || res.data;
      setSuccess('Nếu tài khoản tồn tại, chúng tôi đã gửi hướng dẫn khôi phục.');
      if (data?.token) {
        setDevToken(data.token);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="auth-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL || ''}/images/VNUR.jpg)`
      }}
    >
      <div className="auth-heading">
        <span className="line1">HỆ THỐNG QUẢN LÝ</span>
        <span className="line2">HOẠT ĐỘNG RÈN LUYỆN CỦA SINH VIÊN</span>
      </div>
      <div className="box">
        <div className="flip-card-inner">
          <div className="box-login">
            <ul>
              <form onSubmit={handleSubmit}>
                <h1>QUÊN MẬT KHẨU</h1>
                
                <div className="email-login">
                  <input 
                    className="inpt" 
                    type="text" 
                    name="identifier" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email hoặc mã số sinh viên" 
                    required 
                  />
                  <i className='fa fa-envelope'></i>
                </div>
                {error && <div className="error-message">{error}</div>}

                {success && (
                  <div className="success-message">
                    {success}
                    {devToken && (
                      <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                        Token (dev): <code style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{devToken}</code>
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" className="btn" disabled={isLoading}>
                  {isLoading ? 'Đang gửi...' : 'KHÔI PHỤC MẬT KHẨU'}
                </button>
              </form>
              <div className="register-link">
                <p>Nhớ mật khẩu rồi? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập</a></p>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
