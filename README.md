# 🚀 DACN - Web Quản Lý Hoạt Động Rèn Luyện

## 📋 Mô tả dự án
Hệ thống quản lý hoạt động rèn luyện cho sinh viên với đầy đủ chức năng quản lý, đăng ký hoạt động, theo dõi điểm rèn luyện và thông báo.

## ⚡ Quick Start (Cài đặt nhanh)

### 📋 Bước 1: Tải về dự án
```bash
git clone https://github.com/ThLin57/DACN_Web_quanly_hoatdongrenluyen.git
cd DACN_Web_quanly_hoatdongrenluyen
```

### 🪟 Bước 2: Chạy setup tự động (Windows)
```bash
# Chạy file setup.bat (double-click hoặc chạy trong Command Prompt)
setup.bat
```

### 🐧 Bước 2: Chạy setup tự động (Linux/macOS)
```bash
# Cấp quyền thực thi và chạy
chmod +x setup.sh
./setup.sh
```

### 🚀 Bước 3: Khởi động ứng dụng
Sau khi setup xong, mở **2 terminal** và chạy:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 🌐 Bước 4: Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🎯 Yêu cầu hệ thống

### Bắt buộc:
- **Node.js** (v16 trở lên) - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)

### Tùy chọn:
- **Visual Studio Code** - [Download](https://code.visualstudio.com/)

## 📁 Cấu trúc dự án

```
DACN_Web_quanly_hoatdongrenluyen/
├── backend/                 # Backend API (Node.js + Express)
│   ├── src/                # Source code
│   ├── prisma/             # Database schema & migrations
│   ├── docker-compose.yml  # PostgreSQL container
│   └── package.json        # Backend dependencies
├── frontend/               # Frontend (React.js)
│   ├── src/                # Source code
│   └── package.json        # Frontend dependencies
├── setup.bat               # Windows setup script
├── setup.sh                # Linux/macOS setup script
└── README.md               # This file
```

## 🔧 Setup thủ công (nếu script tự động không hoạt động)

### 📦 Backend Setup:
```bash
# 1. Cài đặt dependencies
cd backend
npm install

# 2. Khởi động database
docker-compose up -d

# 3. Chạy migrations
npx prisma migrate dev

# 4. Seed dữ liệu mẫu
npm run seed

# 5. Khởi động server
npm start
```

### 🎨 Frontend Setup:
```bash
# 1. Cài đặt dependencies
cd frontend
npm install

# 2. Khởi động development server
npm start
```

## 🌐 Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: PostgreSQL trên port 5433

## 🔑 Thông tin đăng nhập

| Vai trò | Tên đăng nhập | Mật khẩu |
|---------|---------------|----------|
| Admin | admin | Admin@123 |
| Giáo viên | gv001 | Teacher@123 |
| Lớp trưởng | lt001 | Monitor@123 |
| Sinh viên | 2021003 | Student@123 |

## 📊 Thông tin Database

- **Host**: localhost
- **Port**: 5433
- **Database**: Web_QuanLyDiemRenLuyen
- **Username**: admin
- **Password**: abc

## 🛠️ Các lệnh hữu ích

### 🗄️ Database Management:
```bash
# Xem database (Prisma Studio)
cd backend && npx prisma studio

# Dừng database
cd backend && docker-compose down

# Khởi động lại database
cd backend && docker-compose restart

# Reset database (xóa tất cả dữ liệu)
cd backend && docker-compose down -v && docker-compose up -d

# Chạy migration mới
cd backend && npx prisma migrate dev

# Seed lại dữ liệu
cd backend && npm run seed
```

### 🚀 Development Commands:
```bash
# Chạy backend
cd backend && npm start

# Chạy frontend
cd frontend && npm start

# Chạy cả hai cùng lúc (cần cài concurrently)
npm run dev
```

### 📊 Root Scripts (từ thư mục gốc):
```bash
# Setup backend
npm run setup:backend

# Setup frontend
npm run setup:frontend

# Dừng database
npm run stop:db

# Khởi động lại database
npm run restart:db

# Mở Prisma Studio
npm run studio
```

## 🐛 Troubleshooting

### ❌ Lỗi thường gặp và cách khắc phục:

#### 1. **Port đã được sử dụng**
```bash
# Kiểm tra port đang sử dụng
netstat -an | findstr :3001  # Windows
netstat -an | findstr :5433  # Windows

lsof -i :3001  # Linux/macOS
lsof -i :5433  # Linux/macOS

# Giải pháp: Dừng process hoặc đổi port
```

#### 2. **Docker không chạy**
```bash
# Kiểm tra Docker
docker --version
docker ps

# Giải pháp: Khởi động Docker Desktop
# Windows: Mở Docker Desktop
# Linux: sudo systemctl start docker
```

#### 3. **Database connection failed**
```bash
# Kiểm tra container
cd backend
docker-compose ps

# Khởi động lại database
docker-compose down
docker-compose up -d

# Kiểm tra logs
docker-compose logs postgres
```

#### 4. **npm install failed**
```bash
# Xóa cache và cài lại
npm cache clean --force
rm -rf node_modules package-lock.json  # Linux/macOS
rmdir /s node_modules & del package-lock.json  # Windows
npm install
```

#### 5. **Prisma migration failed**
```bash
# Reset database và chạy lại migration
cd backend
docker-compose down -v
docker-compose up -d
npx prisma migrate dev
npm run seed
```

#### 6. **Setup script không chạy được**
```bash
# Windows: Chạy Command Prompt as Administrator
# Linux/macOS: Cấp quyền thực thi
chmod +x setup.sh
./setup.sh
```

## 📚 API Documentation

### 🔗 Endpoints chính:

#### **🔐 Authentication:**
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile
- `POST /api/auth/change` - Đổi mật khẩu

#### **📊 Activities:**
- `GET /api/activities` - Danh sách hoạt động
- `GET /api/activities/:id` - Chi tiết hoạt động
- `POST /api/activities/:id/register` - Đăng ký hoạt động
- `GET /api/auth/my-activities` - Hoạt động đã đăng ký

#### **📈 Dashboard:**
- `GET /api/dashboard/stats` - Thống kê dashboard
- `GET /api/auth/points` - Điểm rèn luyện

#### **🏥 Health Check:**
- `GET /api/health` - Kiểm tra trạng thái server

### 📝 Request/Response Examples:

#### **Login:**
```json
POST /api/auth/login
{
  "maso": "2021003",
  "password": "Student@123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Nguyễn Văn A",
    "role": "student"
  }
}
```

#### **Get Profile:**
```json
GET /api/auth/profile
Headers: { "Authorization": "Bearer <token>" }

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nguyễn Văn A",
    "maso": "2021003",
    "email": "student@example.com",
    "role": "student",
    "lop": "CNTT01",
    "khoa": "Công nghệ thông tin",
    "ngaysinh": "2003-01-01",
    "sdt": "0123456789"
  }
}
```

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Tác giả

- **ThLin57** - [GitHub](https://github.com/ThLin57)

## 📞 Liên hệ

Nếu có vấn đề gì, hãy tạo issue trên GitHub repository.

---

**🎉 Chúc bạn coding vui vẻ!**