
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

### 9) Mang dữ liệu DB sang máy khác (Backup/Restore)

Dữ liệu Prisma là dữ liệu thật trong Postgres (volume Docker), không tự đi theo code. Có 2 cách phổ biến:

- Dump/restore (khuyến nghị):
	- Tạo bản sao trên máy nguồn:
		```powershell
		# tạo file dump
		docker compose exec db bash -lc "pg_dump -U admin -d Web_QuanLyDiemRenLuyen -Fc -f /tmp/db.dump"
		docker cp dacn_db:/tmp/db.dump .\db.dump
		```
	- Khôi phục trên máy đích:
		```powershell
		docker compose --profile dev up -d db
		docker cp .\db.dump dacn_db:/tmp/db.dump
		docker compose exec db bash -lc "pg_restore -U admin -d Web_QuanLyDiemRenLuyen -c -1 /tmp/db.dump"
		```

- Dùng script PowerShell có sẵn:
	- Backup:
		```powershell
		./scripts/backup-db.ps1
		# hoặc chỉ định tên file:
		./scripts/backup-db.ps1 -Output .\db.dump
		```
	- Restore:
		```powershell
		./scripts/restore-db.ps1 -Input .\db.dump
		```

Lưu ý: Không cần chạy seed nếu bạn muốn dữ liệu giống hệt máy nguồn. Seed chỉ dùng khi DB mới và bạn cần dữ liệu mẫu để test nhanh.
