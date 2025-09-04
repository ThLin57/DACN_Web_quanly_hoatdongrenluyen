import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { toast } from 'react-hot-toast';
import logo from '../image/logo.png';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const userMenuRef = React.useRef(null);

  const handleLogout = async () => {
    await logout();
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    toast.success('Chức năng chuyển chế độ tối/sáng sẽ được phát triển!');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const openChangePwd = () => setShowChangePwd(true);
  const closeChangePwd = () => { if (!submitting) setShowChangePwd(false); };
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitChangePassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmNewPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      setSubmitting(true);
      const res = await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmNewPassword,
      });
      const message = res.data?.message || 'Đổi mật khẩu thành công';
      toast.success(message);
      setShowChangePwd(false);
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại';
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach(x => toast.error(`${x.field}: ${x.message}`));
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header Điều Hướng */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img src={logo} alt="Logo hệ thống quản lý hoạt động sinh viên" className="h-12 w-12 rounded-full object-cover" />
              </div>
              <div className="hidden md:block ml-4">
                <h1 className="text-2xl font-bold text-white">Hệ Thống Quản Lý Hoạt Động</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 text-white hover:text-blue-200">
                  <i className="fas fa-bell"></i>
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 animate-bounce">3</span>
                </button>
              </div>
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <img src="https://via.placeholder.com/32x32/FFFFFF/3B82F6?text=U" alt="Ảnh đại diện người dùng" className="h-8 w-8 rounded-full" />
                  <span className="text-sm font-medium text-white">{user?.name || user?.email}</span>
                  <i className={`fas fa-chevron-down text-xs text-white transition-transform ${showUserMenu ? 'rotate-180' : ''}`}></i>
                </button>
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'Người dùng'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-user mr-3 w-4 text-center"></i>
                      <span>Thông tin cá nhân</span>
                    </Link>
                    
                    <button
                      onClick={() => { openChangePwd(); setShowUserMenu(false); }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <i className="fas fa-key mr-3 w-4 text-center"></i>
                      <span>Đổi mật khẩu</span>
                    </button>
                    
                    <button
                      onClick={() => { toggleTheme(); setShowUserMenu(false); }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <i className="fas fa-moon mr-3 w-4 text-center"></i>
                      <span>Chế độ Tối/Sáng</span>
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => { handleLogout(); setShowUserMenu(false); }}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <i className="fas fa-sign-out-alt mr-3 w-4 text-center"></i>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Thanh Điều Hướng Sidebar */}
        <aside className="hidden md:flex w-64 bg-white text-blue-800 shadow-lg" style={{minHeight: 'calc(100vh - 80px)'}}>
          <nav className="mt-8 w-full">
            <div className="px-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-4">Menu Chính</h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className={`flex items-center px-4 py-2 rounded-lg ${isActive('/') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100 text-blue-700'}`}
                  >
                    <i className="fas fa-home mr-3"></i>
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className={`flex items-center px-4 py-2 rounded-lg ${isActive('/profile') ? 'bg-blue-600 text-white' : 'hover:bg-blue-100 text-blue-700'}`}
                  >
                    <i className="fas fa-user mr-3"></i>
                    <span>Thông tin cá nhân</span>
                  </Link>
                </li>
                <li>
                  <a href="#" className="flex items-center px-4 py-2 hover:bg-blue-100 text-blue-700 rounded-lg">
                    <i className="fas fa-calendar-alt mr-3"></i>
                    <span>Hoạt động</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-4 py-2 hover:bg-blue-100 text-blue-700 rounded-lg">
                    <i className="fas fa-chart-bar mr-3"></i>
                    <span>Báo cáo</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-4 py-2 hover:bg-blue-100 text-blue-700 rounded-lg">
                    <i className="fas fa-bell mr-3"></i>
                    <span>Thông báo</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Nội Dung Chính */}
        <main className="flex-1 p-8 bg-white">
          {children}
        </main>
      </div>

      {/* Chân Trang */}
      <footer className="bg-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Hệ Thống Quản Lý Hoạt Động</h3>
              <p className="text-gray-300 text-sm">Công cụ quản lý toàn diện các hoạt động sinh viên và điểm rèn luyện</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <p className="text-gray-300 text-sm">Email: support@activity.edu.vn</p>
              <p className="text-gray-300 text-sm">Điện thoại: (024) 1234 5678</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
              <p className="text-gray-300 text-sm">Hướng dẫn sử dụng</p>
              <p className="text-gray-300 text-sm">Câu hỏi thường gặp</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300 text-sm">© 2024 Hệ Thống Quản Lý Hoạt Động. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Điều Hướng Di Động */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Link to="/" className={`flex flex-col items-center py-2 ${isActive('/') ? 'text-blue-600' : 'text-gray-600'}`}>
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center py-2 ${isActive('/profile') ? 'text-blue-600' : 'text-gray-600'}`}>
            <i className="fas fa-user text-lg"></i>
            <span className="text-xs mt-1">Hồ sơ</span>
          </Link>
          <a href="#" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-bell text-lg"></i>
            <span className="text-xs mt-1">Thông báo</span>
          </a>
          <button onClick={() => setShowMobileSettings(true)} className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-ellipsis-h text-lg"></i>
            <span className="text-xs mt-1">Khác</span>
          </button>
        </div>
      </div>

      {/* Modal Menu Di Động */}
      {showMobileSettings && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileSettings(false)}></div>
          <div className="relative bg-white rounded-t-xl shadow-2xl w-full p-4">
            <div className="flex justify-center mb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
              <img src="https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U" alt="Ảnh đại diện" className="h-10 w-10 rounded-full mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Người dùng'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <ul className="space-y-2">
              <li>
                <button onClick={() => { openChangePwd(); setShowMobileSettings(false); }} className="flex items-center p-3 hover:bg-gray-100 rounded-lg w-full text-left">
                  <i className="fas fa-key mr-4 text-gray-600"></i>
                  <span>Đổi mật khẩu</span>
                </button>
              </li>
              <li>
                <button onClick={() => { toggleTheme(); setShowMobileSettings(false); }} className="flex items-center p-3 hover:bg-gray-100 rounded-lg w-full text-left">
                  <i className="fas fa-moon mr-4 text-gray-600"></i>
                  <span>Chế độ Tối/Sáng</span>
                </button>
              </li>
              <li>
                <button onClick={() => { handleLogout(); setShowMobileSettings(false); }} className="flex items-center p-3 hover:bg-red-50 rounded-lg w-full text-left text-red-600">
                  <i className="fas fa-sign-out-alt mr-4"></i>
                  <span>Đăng xuất</span>
                </button>
              </li>
            </ul>
            <button onClick={() => setShowMobileSettings(false)} className="btn btn-secondary w-full mt-4">Đóng</button>
          </div>
        </div>
      )}

      {/* Modal Đổi Mật Khẩu */}
      {showChangePwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeChangePwd}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h3>
              <button onClick={closeChangePwd} className="p-2 hover:bg-gray-100 rounded-md">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <form onSubmit={submitChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                <input name="currentPassword" type="password" value={form.currentPassword} onChange={onChange} className="w-full form-input" placeholder="Nhập mật khẩu hiện tại" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input name="newPassword" type="password" value={form.newPassword} onChange={onChange} className="w-full form-input" placeholder="Nhập mật khẩu mới" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <input name="confirmNewPassword" type="password" value={form.confirmNewPassword} onChange={onChange} className="w-full form-input" placeholder="Nhập lại mật khẩu mới" />
              </div>
              <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
                {submitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
