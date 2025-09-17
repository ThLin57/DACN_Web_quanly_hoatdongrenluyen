# 🚀 DACN - Web Quản Lý Hoạt Động Rèn Luyện

## 📋 Mô tả dự án
Hệ thống quản lý hoạt động rèn luyện cho sinh viên với đầy đủ chức năng quản lý, đăng ký hoạt động, theo dõi điểm rèn luyện và thông báo.

## ⚡ Quick Start (Cài đặt nhanh)

### 🪟 Windows:
```bash
# Tải về dự án
git clone https://github.com/ThLin57/DACN_Web_quanly_hoatdongrenluyen.git
cd DACN_Web_quanly_hoatdongrenluyen

# Chạy setup tự động (1 lệnh duy nhất!)
setup.bat
```

### 🐧 Linux/macOS:
```bash
# Tải về dự án
git clone https://github.com/ThLin57/DACN_Web_quanly_hoatdongrenluyen.git
cd DACN_Web_quanly_hoatdongrenluyen

# Chạy setup tự động (1 lệnh duy nhất!)
chmod +x setup.sh
./setup.sh
```

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

## 🔧 Setup thủ công (nếu cần)

### Backend:
```bash
cd backend
npm install
docker-compose up -d
npx prisma migrate dev
npm run seed
npm start
```

### Frontend:
```bash
cd frontend
npm install
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

### Database:
```bash
# Xem database
cd backend && npx prisma studio

# Dừng database
cd backend && docker-compose down

# Khởi động lại database
cd backend && docker-compose restart

# Reset database (xóa tất cả dữ liệu)
cd backend && docker-compose down -v && docker-compose up -d
```

### Development:
```bash
# Chạy backend
cd backend && npm start

# Chạy frontend
cd frontend && npm start

# Chạy cả hai (cần 2 terminal)
npm run dev  # (nếu có script này)
```

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **Port đã được sử dụng**:
   ```bash
   # Kiểm tra port
   netstat -an | findstr :3001
   netstat -an | findstr :5433
   ```

2. **Docker không chạy**:
   - Khởi động Docker Desktop
   - Kiểm tra: `docker --version`

3. **Database connection failed**:
   ```bash
   cd backend
   docker-compose down
   docker-compose up -d
   ```

4. **npm install failed**:
   ```bash
   npm cache clean --force
   npm install
   ```

## 📚 API Documentation

### Endpoints chính:
- `GET /api/health` - Health check
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile
- `GET /api/activities` - Danh sách hoạt động
- `POST /api/activities/:id/register` - Đăng ký hoạt động

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