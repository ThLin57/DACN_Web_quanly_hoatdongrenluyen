import { Link } from 'react-router-dom';
import React from 'react';
import http from '../services/http';

export default function Header() {
  const [profile, setProfile] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      http.get('/auth/profile')
        .then(response => {
          setProfile(response.data);
        })
        .catch(error => {
          console.error('Failed to load profile:', error);
          localStorage.removeItem('token');
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setProfile(null);
    window.location.href = '/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-gray-900 hover:opacity-90 transition flex-shrink-0">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold">
            TA
          </span>
          <span className="text-base sm:text-lg">TailAdmin</span>
        </Link>

        {/* Search bar - always visible */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm hoạt động, sinh viên..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 text-sm"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </form>

        {profile ? (
          <div className="flex items-center gap-3 relative">
            <button
              type="button"
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setOpen(!open)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {profile.ho_ten ? profile.ho_ten.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {profile.ho_ten || profile.ten_dn || 'User'}
              </span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Đăng nhập
            </Link>
          </div>
        )}
      </div>

      {open && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  );
}
