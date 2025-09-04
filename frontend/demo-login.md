# Demo Chức năng Đăng nhập - Frontend DACN

## 🎯 Mục tiêu
Test chức năng đăng nhập sử dụng **Mã số** thay vì Email theo cấu trúc database mới.

## 🔐 Tài khoản Test

### 1. Admin
- **Mã số**: `AD001`
- **Mật khẩu**: `Admin@123`
- **Vai trò**: `admin`

### 2. Giảng viên
- **Mã số**: `GV001`
- **Mật khẩu**: `Teacher@123`
- **Vai trò**: `teacher`

### 3. Sinh viên
- **Mã số**: `SV210001`
- **Mật khẩu**: `Student@123`
- **Vai trò**: `student`

## 🚀 Cách Test

### Bước 1: Khởi động Backend
```bash
cd backend
npm run dev
```
Backend sẽ chạy trên `http://localhost:3001`

### Bước 2: Khởi động Frontend
```bash
cd frontend
npm start
```
Frontend sẽ chạy trên `http://localhost:3000`

### Bước 3: Test Đăng nhập

1. **Mở trình duyệt** và truy cập `http://localhost:3000/login`
2. **Nhập mã số** (ví dụ: `AD001`)
3. **Nhập mật khẩu** (ví dụ: `Admin@123`)
4. **Click "Đăng nhập"**

### Bước 4: Kiểm tra Kết quả

- ✅ **Thành công**: Chuyển hướng đến Dashboard
- ✅ **Token**: Được lưu trong localStorage
- ✅ **User Info**: Hiển thị thông tin người dùng
- ✅ **Role-based Access**: Kiểm tra quyền truy cập

## 🔍 Kiểm tra Console

### Backend Logs
```bash
# Kiểm tra logs
cd backend
tail -f logs/combined.log
```

### Frontend Console
- Mở Developer Tools (F12)
- Kiểm tra Console tab
- Kiểm tra Network tab để xem API calls

## 📱 Test Cases

### Test Case 1: Đăng nhập Admin
- **Input**: `AD001` / `Admin@123`
- **Expected**: Đăng nhập thành công, role = admin

### Test Case 2: Đăng nhập Giảng viên
- **Input**: `GV001` / `Teacher@123`
- **Expected**: Đăng nhập thành công, role = teacher

### Test Case 3: Đăng nhập Sinh viên
- **Input**: `SV210001` / `Student@123`
- **Expected**: Đăng nhập thành công, role = student

### Test Case 4: Đăng nhập sai
- **Input**: `INVALID` / `WRONG`
- **Expected**: Hiển thị lỗi validation

## 🛠️ Troubleshooting

### Lỗi thường gặp

1. **Backend không khởi động**
   - Kiểm tra port 3001 có bị chiếm không
   - Kiểm tra database connection

2. **Frontend không kết nối được Backend**
   - Kiểm tra proxy trong package.json
   - Kiểm tra CORS configuration

3. **Validation errors**
   - Kiểm tra format dữ liệu gửi lên
   - Kiểm tra validation schema

### Debug Commands

```bash
# Test API trực tiếp
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"maso":"AD001","password":"Admin@123"}'

# Kiểm tra health endpoint
curl http://localhost:3001/api/health
```

## 📊 Kết quả mong đợi

- ✅ **Authentication**: JWT token được tạo và validate
- ✅ **User Data**: Thông tin user được trả về đầy đủ
- ✅ **Role Management**: Phân quyền theo vai trò
- ✅ **Error Handling**: Xử lý lỗi validation và authentication
- ✅ **Security**: Password được hash, token có expiration

## 🎉 Hoàn thành

Khi tất cả test cases pass, chức năng đăng nhập đã được hoàn thiện thành công với:
- **Backend**: Sử dụng `maso` thay vì `email`
- **Frontend**: Form đăng nhập với field "Mã số"
- **Database**: Tích hợp với schema Prisma
- **Security**: JWT authentication + bcrypt hashing
