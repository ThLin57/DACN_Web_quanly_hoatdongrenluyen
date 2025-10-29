/**
 * 🚨 EMERGENCY FIX SCRIPT
 * Chạy script này trong browser console để sửa lỗi kết nối ngay lập tức
 */

console.log('🚨 EMERGENCY FIX: Đang sửa lỗi kết nối...');

// 1. FORCE CLEAR tất cả cache
try {
  // Clear localStorage
  localStorage.removeItem('API_BASE_URL');
  localStorage.removeItem('tab_id_temp');
  localStorage.removeItem('all_tabs_registry');
  localStorage.removeItem('tab_sync_event');
  
  // Clear sessionStorage
  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach(key => {
    if (key.includes('tab_session_data') || key.includes('tab_id')) {
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('✅ Đã xóa tất cả cache');
} catch (e) {
  console.error('❌ Lỗi khi xóa cache:', e);
}

// 2. FORCE SET BaseURL về localhost
try {
  if (typeof window.setApiBase === 'function') {
    window.setApiBase('http://localhost:3001/api');
    console.log('✅ Đã set BaseURL về localhost:3001');
  } else {
    // Fallback: set trực tiếp vào localStorage
    localStorage.setItem('API_BASE_URL', 'http://localhost:3001/api');
    console.log('✅ Đã set BaseURL vào localStorage');
  }
} catch (e) {
  console.error('❌ Lỗi khi set BaseURL:', e);
}

// 3. Test kết nối backend
console.log('🧪 Testing backend connection...');
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    maso: 'admin',
    password: '123456'
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('✅ Backend hoạt động bình thường!');
    console.log('🎉 Sẵn sàng đăng nhập với admin/123456');
  } else {
    console.log('⚠️ Backend trả về:', data.message);
  }
})
.catch(error => {
  console.error('❌ Backend không kết nối được:', error.message);
  console.log('💡 Hãy kiểm tra Docker containers: docker-compose ps');
});

// 4. Reload trang sau 2 giây
console.log('🔄 Sẽ reload trang sau 2 giây...');
setTimeout(() => {
  window.location.reload();
}, 2000);

console.log('🎯 EMERGENCY FIX hoàn thành!');
console.log('📋 Sau khi reload, BaseURL sẽ là: http://localhost:3001/api');
console.log('🔐 Đăng nhập với: admin / 123456');
