// test_admin_api.js
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Test admin login và admin functions
async function testAdminAPI() {
  try {
    console.log('🧪 Testing Admin API...\n');

    // 1. Login as admin
    console.log('1. Đăng nhập với tài khoản admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      maso: 'admin',
      password: 'Admin@123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Đăng nhập admin thành công');
      const token = loginResponse.data.data.token;
      const authHeaders = { Authorization: `Bearer ${token}` };

      // 2. Test admin dashboard
      console.log('\n2. Test admin dashboard...');
      const dashboardResponse = await axios.get(`${API_BASE}/admin/dashboard`, {
        headers: authHeaders
      });
      
      if (dashboardResponse.data.success) {
        console.log('✅ Admin dashboard API hoạt động');
        console.log('📊 Stats:', dashboardResponse.data.data);
      }

      // 3. Test get users
      console.log('\n3. Test lấy danh sách users...');
      const usersResponse = await axios.get(`${API_BASE}/admin/users`, {
        headers: authHeaders
      });
      
      if (usersResponse.data.success) {
        console.log('✅ Lấy danh sách users thành công');
        console.log(`👥 Tổng ${usersResponse.data.data.length} users`);
        console.log('First user:', usersResponse.data.data[0]);
      }

      // 4. Test create new user
      console.log('\n4. Test tạo user mới...');
      const newUser = {
        maso: 'test_user_' + Date.now(),
        email: `test${Date.now()}@dlu.edu.vn`,
        hoten: 'Test User ' + Date.now(),
        role: 'SINH_VIEN',
        password: 'Test@123',
        lop: 'TEST001',
        khoa: 'CNTT'
      };

      const createResponse = await axios.post(`${API_BASE}/admin/users`, newUser, {
        headers: authHeaders
      });

      if (createResponse.data.success) {
        console.log('✅ Tạo user mới thành công');
        const userId = createResponse.data.data.id;
        console.log('🆔 User ID:', userId);

        // 5. Test update user
        console.log('\n5. Test cập nhật user...');
        const updateResponse = await axios.put(`${API_BASE}/admin/users/${userId}`, {
          hoten: 'Updated Test User',
          khoa: 'Updated CNTT'
        }, {
          headers: authHeaders
        });

        if (updateResponse.data.success) {
          console.log('✅ Cập nhật user thành công');
        }

        // 6. Test delete user
        console.log('\n6. Test xóa user...');
        const deleteResponse = await axios.delete(`${API_BASE}/admin/users/${userId}`, {
          headers: authHeaders
        });

        if (deleteResponse.data.success) {
          console.log('✅ Xóa user thành công');
        }
      }

      // 7. Test RBAC permissions
      console.log('\n7. Test RBAC permissions...');
      
      // Test as regular user
      const studentLogin = await axios.post(`${API_BASE}/auth/login`, {
        maso: 'demo',
        password: 'Demo@123'
      });

      if (studentLogin.data.success) {
        const studentToken = studentLogin.data.data.token;
        const studentHeaders = { Authorization: `Bearer ${studentToken}` };

        try {
          await axios.get(`${API_BASE}/admin/dashboard`, {
            headers: studentHeaders
          });
          console.log('❌ RBAC lỗi: Student có thể truy cập admin dashboard');
        } catch (error) {
          if (error.response?.status === 403) {
            console.log('✅ RBAC hoạt động: Student không thể truy cập admin dashboard');
          } else {
            console.log('⚠️ Lỗi không xác định:', error.response?.status);
          }
        }
      }

      console.log('\n🎉 Test Admin API hoàn thành!');

    } else {
      console.log('❌ Đăng nhập admin thất bại');
    }

  } catch (error) {
    console.error('💥 Lỗi test API:', error.response?.data || error.message);
  }
}

// Chạy test
testAdminAPI();