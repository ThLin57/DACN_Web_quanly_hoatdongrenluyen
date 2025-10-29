## 1) Giới thiệu ngắn, tính năng chính, ảnh chụp màn hình

Hệ thống Quản lý Hoạt động Rèn luyện Sinh viên (SVRL) hỗ trợ quản lý, đăng ký, điểm danh, tính điểm rèn luyện theo học kỳ cho sinh viên; kèm phân quyền Lớp trưởng, Giảng viên và Quản trị.

- Tính năng chính:
  - Đăng nhập JWT, đổi/khôi phục mật khẩu, đăng ký tài khoản sinh viên
  - Danh sách hoạt động – lọc, đăng ký/hủy; điểm danh QR
  - Hoạt động của tôi, xem điểm rèn luyện theo học kỳ
  - Lớp trưởng: quản lý hoạt động lớp, phê duyệt đăng ký, thống kê
  - Giảng viên: phê duyệt hoạt động, quản lý loại hoạt động, xem danh sách SV
  - Admin: quản lý tài khoản, vai trò quyền, học kỳ, QR điểm danh

Ảnh màn hình (minh họa): `frontend/public/VNUR.jpg`, `cntt.png`, `dhdl.jpg`, `it.jpg`

## 2) Kiến trúc (tổng thể, tech stack, lý do chọn)

- Tổng thể: FE (React) ↔ BE (Express + Prisma) ↔ PostgreSQL
  - Auth: JWT, RBAC theo vai trò trong DB; middleware Helmet, CORS, Rate Limit
  - Upload: Multer; QR Attendance; Zod validation
- Tech stack:
  - Frontend: React 18, React Router, Tailwind CSS, Axios
  - Backend: Node.js, Express 5, Prisma ORM, PostgreSQL, JWT, bcryptjs
  - Triển khai: Docker Compose (dev/prod), Nginx (prod), AWS EC2 (tài liệu kèm)
- Lý do:
  - Prisma: an toàn SQL, mô hình hóa schema rõ, migrate/seed dễ
  - Express: linh hoạt middleware, dễ mở rộng
  - React: component-based UI, ecosystem phong phú

Sơ đồ (ASCII):
```
Browser (React) --Axios--> Express API --Prisma--> PostgreSQL
                 <-- JWT --             <-- data --
```

**Tài liệu mở rộng:**
- Database Schema & ERD: [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md)
- API Documentation (OpenAPI/Swagger): [`docs/api/openapi.yaml`](./docs/api/openapi.yaml)

## 3) Hướng dẫn chạy nhanh (Local & Docker), biến môi trường, seeding

### Local
```bash
# Backend
cd backend && npm install && npm run migrate && npm run seed && npm run dev   # http://localhost:3001

# Frontend
cd ../frontend && npm install && npm start                                     # http://localhost:3000
```

### Docker (Windows/Linux/Mac)
```bash
# Dev (hot reload FE/BE + Postgres)
docker compose --profile dev up -d

# Prod (serve FE build kèm BE trong 1 container)
docker compose --profile prod up -d --build app
```

### Biến môi trường
Backend `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dacn_db"
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="1d"
PORT=3001
CORS_ORIGIN=http://localhost:3000
```
Frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Seeding
```bash
cd backend
npm run seed
```

## 4) Tài khoản demo, Swagger, link deploy

- **Demo accounts API**: `GET /api/auth/demo-accounts`
  - `admin` / `Admin@123`
  - `gv001` / `Teacher@123`
  - `lt001` / `Monitor@123`
  - `2021003` / `Student@123`
- **API Documentation**:
  - OpenAPI/Swagger spec: [`docs/api/openapi.yaml`](./docs/api/openapi.yaml)
  - Swagger UI: Import file `openapi.yaml` vào [Swagger Editor](https://editor.swagger.io) hoặc [Swagger UI](https://petstore.swagger.io)
  - Có thể cấu hình Swagger UI trong backend (xem [Hướng dẫn](#swagger-ui-setup))
- **Link deploy**: (cập nhật khi có, ví dụ: `https://svrl.example.com`)

### Swagger UI Setup (tùy chọn)

Nếu muốn host Swagger UI trực tiếp trong backend:

```bash
cd backend
npm install swagger-ui-express
```

Thêm vào `backend/src/index.js`:
```javascript
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/api/openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

Truy cập: `http://localhost:3001/api-docs`

## 5) Cấu trúc thư mục, conventions

```
backend/
  src/
    routes/ controllers/ middlewares/ services/ utils/
  prisma/ schema.prisma migrations/ seed_*.js
frontend/
  src/ pages/ components/ contexts/ services/
docs/ scripts/ docker-compose.yml
```

- Coding style: JS/React chuẩn ESLint; tên biến mô tả rõ, tránh viết tắt
- Commit: Conventional Commits (feat, fix, refactor, docs, chore, test)
- Branch: main (ổn định), feat/* (tính năng), fix/* (sửa lỗi), hotfix/* (khẩn)

## 6) Kịch bản demo (Use cases chính)

- Đăng nhập (UI): `/login` → nhập demo account → chuyển hướng về trang theo vai trò
- Quên/đặt lại mật khẩu: `/forgot-password` → nhận token demo → `/reset?token=...`
- Danh sách hoạt động (SV): `/student/activities` → lọc/đăng ký → xem "Hoạt động của tôi"
- Điểm rèn luyện: `/student/scores` → chọn học kỳ
- Điểm danh QR: `/student/qr-scanner`
- Lớp trưởng: `/monitor/activities` tạo hoạt động; `/monitor/approvals` phê duyệt
- Giảng viên: `/teacher/approve` phê duyệt hoạt động; `/teacher/activity-types`
- Admin: `/admin/users` quản lý tài khoản; `/admin/roles` phân quyền; `/admin/semesters`

API liên quan:
- Auth: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/forgot`, `POST /api/auth/reset`
- Hoạt động: `GET /api/activities`, đăng ký/huỷ: các route trong `backend/src/routes/activities.route.js`
- Điểm rèn luyện: `GET /api/auth/points`, Hoạt động của tôi: `GET /api/auth/my-activities`

---

Tài liệu mở rộng:
- `docs/` (AWS deploy, SSL, báo cáo)
- `docker-compose.yml` (dev/prod profiles)
- `backend/src/index.js` (Helmet, CORS, rate-limit; `GET /health`)
