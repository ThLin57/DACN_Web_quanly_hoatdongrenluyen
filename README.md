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

## 🔧 Thiết lập nhanh (Windows + Docker)

Phần này hướng dẫn chạy đầy đủ Database, Backend, Frontend và Prisma Studio trên máy Windows bằng Docker (PowerShell). Cấu hình bám sát `docker-compose.yml` hiện tại với profiles `dev` và `prod`.

### 0) Yêu cầu
- Docker Desktop (WSL2 bật sẵn)
- Git
- Node.js 18+ (chỉ khi cần chạy lệnh Prisma thủ công; không bắt buộc nếu chỉ dùng Docker)
- Các cổng trống: `3000` (FE), `3001` (BE), `5434` (Postgres host), `5555` (Prisma Studio)

### 1) Clone dự án
```powershell
git clone https://github.com/ThLin57/DACN_Web_quanly_hoatdongrenluyen.git
cd DACN_Web_quanly_hoatdongrenluyen
```

### 2) Chạy chế độ Development (hot reload)
Khởi động Postgres, backend dev (nodemon) và frontend dev (CRA):
```powershell
docker compose --profile dev up -d
```

Kiểm tra tình trạng container:
```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Sau khi lên:
- DB: `dacn_db` (host: `localhost:5434`)
- Backend: `dacn_backend_dev` (http://localhost:3001)
- Frontend: `dacn_frontend_dev` (http://localhost:3000)

Backend container sẽ tự chạy: migrate (retry đến khi DB sẵn sàng) → generate → `npm run dev`.

### 3) Seed dữ liệu (nếu cần)
```powershell
docker compose exec backend-dev node prisma/seed.js
```

### 4) Mở Prisma Studio (từ container, truy cập từ host)
Chạy Studio trong container backend và bind ra 0.0.0.0:5555 để máy host truy cập:
```powershell
docker compose exec backend-dev npx prisma studio --host 0.0.0.0 --port 5555 --browser none
```
Truy cập Studio: http://localhost:5555

Lưu ý: Frontend dev đã cấu hình `proxy` về `http://dacn_backend_dev:3001`, nên các request `/api/...` sẽ tự đi nội bộ tới backend container.

### 5) Xác minh đồng bộ
- Frontend: http://localhost:3000
- Backend health: http://localhost:3001/health
- Prisma Studio: http://localhost:5555

Sửa dữ liệu trong Studio (bảng `SinhVien`, `HoatDong`, vv.), refresh giao diện để thấy thay đổi.

### 6) Dừng và khởi động lại
```powershell
# Dừng toàn bộ dev stack
docker compose --profile dev down

# Khởi động lại sau này
docker compose --profile dev up -d
```

### 7) Chạy chế độ Production (tùy chọn)
Chạy 1 container backend (build và serve FE build kèm BE):
```powershell
docker compose --profile prod up -d --build app
```
Truy cập ứng dụng (FE build + BE): http://localhost:3001

### 8) Khắc phục sự cố
- Trùng cổng `3000`/`3001`/`5434`/`5555`: Chỉnh lại phần `ports` trong `docker-compose.yml` rồi up lại.
- DB sạch dữ liệu hoặc cần reset nhanh trong dev:
```powershell
docker compose --profile dev down -v
docker compose --profile dev up -d
```
- Prisma migrate/generate lỗi: chạy thủ công trong container:
```powershell
docker compose exec backend-dev sh -lc "npx prisma migrate deploy && npx prisma generate"
```
- Xem log:
```powershell
docker compose logs -f backend-dev
docker compose logs -f frontend-dev
```
- Studio không mở: đảm bảo dùng `--host 0.0.0.0 --port 5555` và cổng 5555 không bị chặn.
- CORS/JWT: FE dev dùng proxy nội bộ tới BE nên CORS tối thiểu; cần đăng nhập đúng để có token hợp lệ.

Tài liệu chi tiết: xem `SETUP_DEV.md`.
