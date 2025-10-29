import React from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import http from '../services/http';

export default function ForgotPassword() {
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
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    try {
      setIsLoading(true);
      const res = await http.post('/auth/forgot', { identifier: identifier.trim() });
      const data = res.data?.data || res.data;
      setSuccess('Nếu tài khoản tồn tại, chúng tôi đã gửi hướng dẫn khôi phục.');
      if (data?.token) {
        // Dev mode: backend trả token để test nhanh
        setDevToken(data.token);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden animate-page-enter">
      {/* Decorative subtle background accents (still white overall) */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-50 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-indigo-50 blur-3xl opacity-60" />
      <main role="main" className="w-full max-w-md">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lại</span>
          </button>
        </div>
        {/* Gradient border wrapper keeps inner white */}
        <div className="p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-card-enter">
          <div className="bg-white rounded-[14px] shadow-xl transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5">
          <div className="p-4 sm:p-7">
            <div className="text-center">
              <h1 className="block text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">Quên mật khẩu?</h1>
              <p className="text-sm text-gray-600">
                Nhớ mật khẩu rồi?{' '}
                <a className="text-blue-600 hover:text-blue-700 underline font-medium transition-colors duration-300" href="/login">
                  Đăng nhập tại đây
                </a>
              </p>
            </div>

            <div className="mt-5">
              <form onSubmit={handleSubmit} className="grid gap-y-4">
                <div className="animate-item" style={{animationDelay: '80ms'}}>
                  <label htmlFor="email" className="block text-sm font-medium ml-1 mb-2 text-gray-700">
                    Địa chỉ Email hoặc Mã số
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="email"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="py-3 pl-10 pr-4 block w-full border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:shadow-[0_8px_30px_rgba(59,130,246,0.15)]"
                      placeholder="example@email.com hoặc admin"
                      aria-describedby="email-error"
                      required
                    />
                  </div>
                  {error && (
                    <p id="email-error" className="text-xs text-red-600 mt-2">
                      {error}
                    </p>
                  )}
                </div>
                {success && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3 animate-item" style={{animationDelay: '120ms'}}>
                    {success}
                    {devToken && (
                      <div className="mt-2 text-gray-700">
                        Token (dev): <code className="px-2 py-1 bg-gray-100 rounded">{devToken}</code>
                      </div>
                    )}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-lg border border-transparent font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-indigo-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 shadow-md active:translate-y-px"
                >
                  {isLoading ? 'Đang gửi...' : 'Khôi phục mật khẩu'}
                </button>
              </form>
            </div>
          </div>
          </div>
        </div>

        <style>{`
          @keyframes pageEnter { from { opacity: 0 } to { opacity: 1 } }
          @keyframes cardEnter { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
          @keyframes itemEnter { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
          .animate-page-enter { animation: pageEnter .35s ease-out both; }
          .animate-card-enter { animation: cardEnter .45s ease-out both; }
          .animate-item { animation: itemEnter .4s ease-out both; }
        `}</style>
      </main>
    </div>
  );
}
