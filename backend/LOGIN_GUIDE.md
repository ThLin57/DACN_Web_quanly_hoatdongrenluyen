# Hướng dẫn đăng nhập - DACN Backend

## Tài khoản mẫu đã được tạo

Sau khi chạy seed, hệ thống đã có sẵn 3 tài khoản mẫu:

### 1. Tài khoản Admin
- **Mã số**: `AD001`
- **Mật khẩu**: `Admin@123`
- **Vai trò**: `admin`
- **Tên**: Quản Trị Viên

### 2. Tài khoản Giảng viên
- **Mã số**: `GV001`
- **Mật khẩu**: `Teacher@123`
- **Vai trò**: `teacher`
- **Tên**: Giảng Viên A

### 3. Tài khoản Sinh viên
- **Mã số**: `SV210001`
- **Mật khẩu**: `Student@123`
- **Vai trò**: `student`
- **Tên**: Sinh Viên 1

## Cách sử dụng với Frontend

### 1. Đăng nhập
- Sử dụng **Mã số** và **Mật khẩu** tương ứng
- Ví dụ: Mã số = `AD001`, Password = `Admin@123`

### 2. API Endpoints

#### Đăng nhập
```
POST /api/auth/login
Content-Type: application/json

{
  "maso": "AD001",
  "password": "Admin@123"
}
```

#### Đăng ký
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Tên người dùng",
  "maso": "SV210002",
  "password": "password123"
}
```

#### Lấy thông tin profile
```
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Lấy danh sách users
```
GET /api/users
```

#### Cập nhật thông tin user
```
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tên mới",
  "maso": "SV210002"
}
```

## Lưu ý

1. **Mã số**: Hệ thống sử dụng trường `maso` (mã số) để xác định người dùng
2. **Password**: Tất cả mật khẩu đã được hash bằng bcrypt
3. **JWT Token**: Token có thời hạn 1 ngày (có thể cấu hình trong env)
4. **CORS**: Đã được cấu hình để cho phép frontend truy cập

## Chạy ứng dụng

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Backend sẽ chạy trên `http://localhost:3001` và Frontend trên `http://localhost:3000`
