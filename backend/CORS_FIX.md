# 🔧 Sửa lỗi CORS - DACN Backend

## 🚨 Vấn đề đã gặp
```
Access to XMLHttpRequest at 'http://localhost:3001/api/auth/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Giải pháp đã áp dụng

### 1. **Cập nhật CORS Middleware**
- Sửa file `backend/src/middlewares/cors.js`
- Cho phép tất cả origins trong development
- Đặt CORS middleware trước tất cả routes

### 2. **Thay đổi thứ tự Middleware**
- CORS middleware được đặt đầu tiên trong `index.js`
- Đảm bảo CORS được xử lý trước khi routes được định nghĩa

### 3. **Cấu hình CORS đơn giản**
```javascript
const corsOptions = {
  origin: true, // Cho phép tất cả origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204
};
```

## 🧪 Test CORS

### Test OPTIONS Request (Preflight)
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method OPTIONS -Headers @{"Origin"="http://localhost:3000"} -Verbose

# Expected Response:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Credentials: true
# Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

### Test API Login
```bash
cd backend
node test-api.js
```

## 🚀 Cách Test Frontend

### Bước 1: Khởi động Backend
```bash
cd backend
npm run dev
```

### Bước 2: Khởi động Frontend
```bash
cd frontend
npm start
```

### Bước 3: Test Đăng nhập
1. Mở `http://localhost:3000/login`
2. Nhập **Mã số**: `AD001`
3. Nhập **Mật khẩu**: `Admin@123`
4. Click "Đăng nhập"

## 📋 Tài khoản Test

| Vai trò | Mã số | Mật khẩu |
|---------|--------|----------|
| **Admin** | `AD001` | `Admin@123` |
| **Giảng viên** | `GV001` | `Teacher@123` |
| **Sinh viên** | `SV210001` | `Student@123` |

## 🔍 Kiểm tra Console

### Backend Console
- CORS headers được gửi đúng
- Preflight request được xử lý
- API calls thành công

### Frontend Console
- Không còn lỗi CORS
- API calls thành công
- Token được nhận và lưu

## 🛠️ Troubleshooting

### Nếu vẫn gặp lỗi CORS:

1. **Kiểm tra Backend đã khởi động**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Kiểm tra CORS Headers**
   ```bash
   # PowerShell
   Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method OPTIONS -Verbose
   ```

3. **Restart Backend**
   ```bash
   # Dừng backend (Ctrl+C)
   npm run dev
   ```

4. **Kiểm tra Browser Console**
   - Mở Developer Tools (F12)
   - Kiểm tra Network tab
   - Xem CORS headers

## 📊 Kết quả mong đợi

- ✅ **CORS Headers**: Được gửi đúng
- ✅ **Preflight Request**: Được xử lý thành công
- ✅ **API Calls**: Không còn lỗi CORS
- ✅ **Authentication**: Đăng nhập thành công
- ✅ **Token**: Được nhận và lưu

## 🎉 Hoàn thành

Lỗi CORS đã được sửa hoàn toàn. Frontend có thể kết nối với Backend mà không gặp vấn đề gì.

**Bây giờ bạn có thể test chức năng đăng nhập từ frontend!** 🚀
