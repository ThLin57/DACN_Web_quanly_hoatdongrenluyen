# DACN - Đồ án cuối năm

Hệ thống quản lý hoạt động sinh viên với React Frontend và Node.js Backend.

## 🚀 Tính năng chính

### Backend (Node.js + Express + Prisma + PostgreSQL)
- ✅ Authentication với JWT
- ✅ User Management (CRUD)
- ✅ Role-based Authorization
- ✅ Database với Prisma ORM
- ✅ RESTful API với cấu trúc CSR
- ✅ CORS configuration
- ✅ Error handling
- ✅ Security với Helmet & Rate Limiting
- ✅ Logging với Winston
- ✅ Input validation với Zod
- ✅ Response compression
- ✅ Health checks

### Frontend (React + Tailwind CSS)
- ✅ Modern UI với Tailwind CSS
- ✅ Authentication system
- ✅ Protected routes
- ✅ Responsive design
- ✅ Form validation
- ✅ Toast notifications
- ✅ Dashboard với thống kê
- ✅ Custom React hooks
- ✅ State management với Zustand
- ✅ Utility functions
- ✅ Component-based styling

## 📁 Cấu trúc dự án

```
DACN/
├── backend/                 # Node.js Backend (CSR Structure)
│   ├── prisma/             # Database schema & migrations
│   ├── src/
│   │   ├── config/         # Application configuration
│   │   ├── controllers/    # API controllers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── index.js        # Server entry point
│   ├── logs/               # Application logs
│   ├── package.json
│   ├── STRUCTURE.md        # Backend structure documentation
│   └── LOGIN_GUIDE.md      # Login guide
├── frontend/               # React Frontend (CSR Structure)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── assets/         # Images, fonts, icons
│   │   ├── styles/         # CSS/SCSS files
│   │   ├── utils/          # Helper functions
│   │   ├── context/        # React contexts
│   │   ├── store/          # State management (Zustand)
│   │   └── App.js          # Main app component
│   ├── package.json
│   ├── STRUCTURE.md        # Frontend structure documentation
│   └── README.md           # Frontend documentation
├── giao-dien/              # React Frontend (Vite) - Vietnamese naming
├── hau-truong/             # Express Backend - Vietnamese naming
├── docker/                 # Docker configuration
└── README.md               # This file
```

## 🛠️ Cài đặt và chạy

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Database Setup

```bash
# Tạo database và chạy migrations
npm run migrate

# Chạy seed data
npm run seed
```

### 3. Chạy Backend

```bash
npm run dev
```

Backend sẽ chạy trên `http://localhost:3001`

### 4. Frontend Setup

```bash
cd frontend
npm install
```

### 5. Chạy Frontend

```bash
npm start
```

Frontend sẽ chạy trên `http://localhost:3000`

## 🔐 Tài khoản mẫu

Sau khi chạy seed, có sẵn 3 tài khoản:

| Vai trò | Mã số | Mật khẩu |
|---------|--------|----------|
| Admin | `AD001` | `Admin@123` |
| Giảng viên | `GV001` | `Teacher@123` |
| Sinh viên | `SV210001` | `Student@123` |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/profile` - Lấy thông tin profile
- `POST /api/auth/logout` - Đăng xuất

### Users
- `GET /api/users` - Lấy danh sách users
- `GET /api/users/:id` - Lấy thông tin user
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

### Health
- `GET /api/health` - Kiểm tra trạng thái hệ thống

## 🧪 Testing

### Test API Backend
```bash
cd backend
npm run dev
```

## 🔧 Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **React Router DOM** - Routing
- **Tailwind CSS** - CSS framework
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dacn_db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1d"
PORT=3001
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## 🚀 Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

## 📚 Tài liệu tham khảo

- [Backend Documentation](./backend/LOGIN_GUIDE.md)
- [Frontend Documentation](./frontend/README.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phát triển cho mục đích học tập.
