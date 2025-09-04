# Frontend - DACN

Frontend cho ứng dụng DACN được xây dựng bằng React và Tailwind CSS.

## Công nghệ sử dụng

- **React 18** - Thư viện JavaScript cho UI
- **React Router DOM** - Routing cho ứng dụng
- **Tailwind CSS** - Framework CSS utility-first
- **Axios** - HTTP client
- **React Hook Form** - Quản lý form
- **React Hot Toast** - Thông báo toast

## Cấu trúc thư mục

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Layout.js
│   │   └── ProtectedRoute.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   ├── Profile.js
│   │   └── Register.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy ứng dụng ở môi trường development:
```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## Build cho production

```bash
npm run build
```

## Tính năng

### Authentication
- Đăng nhập/Đăng ký
- Quản lý token JWT
- Protected routes
- Auto logout khi token hết hạn

### Dashboard
- Hiển thị thông tin người dùng
- Danh sách tất cả người dùng
- Trạng thái hệ thống
- Thống kê nhanh

### Profile
- Xem thông tin cá nhân
- Cập nhật thông tin
- Hiển thị thông tin tài khoản

### UI/UX
- Responsive design
- Modern UI với Tailwind CSS
- Loading states
- Toast notifications
- Form validation

## API Integration

Frontend tích hợp với backend thông qua các endpoints:

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/profile` - Lấy thông tin profile
- `GET /api/users` - Lấy danh sách users
- `PUT /api/users/:id` - Cập nhật user
- `GET /api/health` - Kiểm tra trạng thái hệ thống

## Environment Variables

Tạo file `.env` trong thư mục frontend:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Scripts

- `npm start` - Chạy development server
- `npm run build` - Build cho production
- `npm test` - Chạy tests
- `npm run eject` - Eject từ Create React App

## Lưu ý

- Backend phải chạy trên port 3001
- CORS đã được cấu hình trong backend
- Proxy được cấu hình trong package.json để tránh CORS issues trong development
