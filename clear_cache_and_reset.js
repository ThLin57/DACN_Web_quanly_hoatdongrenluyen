/**
 * Script để clear cache và reset BaseURL về localhost
 * Chạy trong browser console để sửa lỗi kết nối
 */

console.log('🔧 Đang reset BaseURL về localhost...');

// 1. Clear localStorage cache
try {
  localStorage.removeItem('API_BASE_URL');
  localStorage.removeItem('tab_id_temp');
  console.log('✅ Đã xóa API_BASE_URL từ localStorage');
} catch (e) {
  console.warn('⚠️ Không thể xóa localStorage:', e);
}

// 2. Clear sessionStorage cache
try {
  const keys = Object.keys(sessionStorage);
  keys.forEach(key => {
    if (key.includes('tab_session_data') || key.includes('tab_id')) {
      sessionStorage.removeItem(key);
    }
  });
  console.log('✅ Đã xóa sessionStorage cache');
} catch (e) {
  console.warn('⚠️ Không thể xóa sessionStorage:', e);
}

// 3. Set BaseURL về localhost nếu có function
if (typeof window.setApiBase === 'function') {
  window.setApiBase('http://localhost:3001/api');
  console.log('✅ Đã set BaseURL về localhost:3001');
} else {
  console.log('⚠️ Function setApiBase không có sẵn');
}

// 4. Reload trang để áp dụng thay đổi
console.log('🔄 Đang reload trang...');
setTimeout(() => {
  window.location.reload();
}, 1000);

console.log('🎉 Hoàn thành! Trang sẽ reload sau 1 giây...');
