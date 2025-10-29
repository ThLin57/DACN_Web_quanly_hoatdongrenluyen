# CHƯƠNG 5: TRIỂN KHAI HỆ THỐNG

## Tổng quan chương

Chương 5 trình bày chi tiết về quá trình triển khai hệ thống "Quản lý Hoạt động Rèn luyện sinh viên" từ giao diện người dùng, các chức năng nghiệp vụ, cơ sở dữ liệu, đến quy trình deployment trên môi trường production.

---

## Cấu trúc chương

### **5.1. Giao diện của hệ thống** ✅ HOÀN THÀNH
Mô tả chi tiết giao diện người dùng cho 4 vai trò khác nhau

**Files:**
- `5.1_GIAO_DIEN_HE_THONG.md` - Tổng quan, Login, Dashboard Admin
- `5.1_GIAO_DIEN_TEACHER.md` - Dashboard Giảng viên
- `5.1_GIAO_DIEN_MONITOR.md` - Dashboard Lớp trưởng
- `5.1_GIAO_DIEN_STUDENT.md` - Dashboard Sinh viên

**Nội dung:**
- 5.1.1. Tổng quan về giao diện (design system, colors, typography)
- 5.1.2. Màn hình đăng nhập (form, validation, responsive)
- 5.1.3. Dashboard theo vai trò:
  - A. Admin Dashboard
  - B. Teacher Dashboard
  - C. Monitor Dashboard
  - D. Student Dashboard

---

### **5.2. Các chức năng chi tiết** 🔄 TIẾP THEO
Mô tả chi tiết workflow và business logic của từng chức năng

**File:** `5.2_CHUC_NANG_CHI_TIET.md`

**Nội dung dự kiến:**
- 5.2.1. Quản lý người dùng
  - Thêm/sửa/xóa người dùng
  - Import sinh viên từ Excel
  - Reset mật khẩu
  - Phân quyền và vai trò

- 5.2.2. Quản lý hoạt động
  - Tạo hoạt động mới
  - Upload hình ảnh
  - Quy trình phê duyệt 3 cấp
  - Chỉnh sửa và xóa hoạt động

- 5.2.3. Quản lý đăng ký
  - Đăng ký tham gia
  - Phê duyệt đăng ký (single/bulk)
  - Hủy đăng ký
  - Quota management

- 5.2.4. Điểm danh QR code
  - Tạo mã QR động
  - Quét QR điểm danh
  - Xác thực và cập nhật trạng thái
  - Quản lý danh sách điểm danh

- 5.2.5. Tính điểm rèn luyện
  - Thuật toán tính điểm
  - Phân loại theo tiêu chí
  - Xếp hạng sinh viên
  - Export báo cáo

- 5.2.6. Quản lý học kỳ
  - Tạo và cấu hình học kỳ
  - Khóa học kỳ
  - Đồng bộ dữ liệu

- 5.2.7. Hệ thống thông báo
  - Tạo thông báo tự động
  - Gửi thông báo theo vai trò
  - Đánh dấu đã đọc
  - Real-time notifications

---

### **5.3. Cơ sở dữ liệu** 📝 CHƯA TẠO
Mô tả chi tiết database schema và relationships

**File:** `5.3_DATABASE_SCHEMA.md`

**Nội dung dự kiến:**
- 5.3.1. Tổng quan database
  - PostgreSQL 15
  - Prisma ORM
  - Database normalization (3NF)

- 5.3.2. ERD (Entity Relationship Diagram)
  - Sơ đồ mối quan hệ
  - Cardinality (1-1, 1-N, N-N)

- 5.3.3. Chi tiết các bảng
  - Users (SinhVien, GiangVien, Admin)
  - HoatDong (Activities)
  - DangKyHoatDong (Registrations)
  - LoaiHoatDong (Activity Types)
  - HocKy (Semesters)
  - ThongBao (Notifications)
  - Lop (Classes)
  - DiemDanh (Attendance)

- 5.3.4. Indexes và Constraints
  - Primary keys
  - Foreign keys
  - Unique constraints
  - Check constraints
  - Indexes for performance

- 5.3.5. Database migrations
  - Prisma migration workflow
  - Schema evolution
  - Data seeding

---

### **5.4. API Endpoints** 📝 CHƯA TẠO
Documentation đầy đủ về RESTful API

**File:** `5.4_API_ENDPOINTS.md`

**Nội dung dự kiến:**
- 5.4.1. API Overview
  - Base URL
  - Authentication (JWT)
  - Request/Response format
  - Error handling
  - Rate limiting

- 5.4.2. Authentication APIs
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/logout
  - POST /api/auth/refresh
  - POST /api/auth/forgot-password
  - POST /api/auth/reset-password

- 5.4.3. Admin APIs
  - GET /api/admin/dashboard
  - GET /api/admin/users
  - POST /api/admin/users
  - PUT /api/admin/users/:id
  - DELETE /api/admin/users/:id
  - POST /api/admin/users/import
  - GET /api/admin/activities
  - GET /api/admin/reports

- 5.4.4. Teacher APIs
  - GET /api/teacher/dashboard
  - GET /api/teacher/activities
  - POST /api/teacher/activities/:id/approve
  - POST /api/teacher/activities/:id/reject
  - GET /api/teacher/registrations
  - POST /api/teacher/registrations/:id/approve
  - GET /api/teacher/students
  - GET /api/teacher/reports

- 5.4.5. Monitor APIs
  - GET /api/monitor/dashboard
  - GET /api/monitor/activities
  - POST /api/monitor/activities
  - PUT /api/monitor/activities/:id
  - DELETE /api/monitor/activities/:id
  - GET /api/monitor/registrations
  - POST /api/monitor/registrations/:id/approve
  - POST /api/monitor/activities/:id/qr

- 5.4.6. Student APIs
  - GET /api/student/dashboard
  - GET /api/student/activities
  - POST /api/student/activities/:id/register
  - DELETE /api/student/activities/:id/register
  - GET /api/student/my-activities
  - POST /api/student/attendance/scan
  - GET /api/student/scores

- 5.4.7. Common APIs
  - GET /api/semesters
  - GET /api/activity-types
  - GET /api/notifications
  - PUT /api/notifications/:id/read
  - GET /api/users/profile
  - PUT /api/users/profile

---

### **5.5. Triển khai hệ thống (Deployment)** 📝 CHƯA TẠO
Hướng dẫn deploy production trên AWS EC2

**File:** `5.5_DEPLOYMENT.md`

**Nội dung dự kiến:**
- 5.5.1. Môi trường triển khai
  - AWS EC2 Ubuntu 22.04
  - Docker + Docker Compose
  - Nginx reverse proxy
  - PostgreSQL database
  - Let's Encrypt SSL

- 5.5.2. Cấu hình server
  - Security groups
  - Firewall rules
  - SSH keys
  - Domain setup

- 5.5.3. Docker deployment
  - Dockerfile multi-stage build
  - Docker Compose orchestration
  - Environment variables
  - Volume mounts

- 5.5.4. Database setup
  - PostgreSQL installation
  - Database creation
  - User permissions
  - Backup strategy

- 5.5.5. Nginx configuration
  - Reverse proxy setup
  - SSL/TLS certificates
  - HTTPS redirect
  - Gzip compression
  - Static file serving

- 5.5.6. CI/CD Pipeline
  - GitHub Actions workflow
  - Automated testing
  - Build and deploy
  - Rollback strategy

- 5.5.7. Monitoring và Logging
  - Winston logs
  - Log rotation
  - Health checks
  - Performance monitoring
  - Error tracking (Sentry)

- 5.5.8. Backup và Recovery
  - Database backups (cron jobs)
  - Backup retention policy
  - Disaster recovery plan
  - Data restoration procedure

---

## Thống kê nội dung

| Section | Files | Pages | Status |
|---------|-------|-------|--------|
| 5.1 Giao diện | 4 files | ~45 pages | ✅ Hoàn thành |
| 5.2 Chức năng | 1 file | ~25 pages | 🔄 Cần tạo |
| 5.3 Database | 1 file | ~20 pages | 📝 Cần tạo |
| 5.4 API | 1 file | ~30 pages | 📝 Cần tạo |
| 5.5 Deployment | 1 file | ~20 pages | 📝 Cần tạo |
| **TỔNG** | **8 files** | **~140 pages** | **12% hoàn thành** |

---

## Screenshots và Diagrams

### Giao diện đã mô tả:
✅ Login page layout  
✅ Admin dashboard layout  
✅ Teacher dashboard with gradient cards  
✅ Monitor dashboard with activity management  
✅ Student dashboard with gamification  

### Diagrams cần bổ sung:
- [ ] ERD diagram (Entity Relationship Diagram)
- [ ] System architecture diagram
- [ ] Deployment architecture
- [ ] API request flow diagram
- [ ] Authentication flow diagram
- [ ] Activity approval workflow diagram
- [ ] QR attendance sequence diagram

---

## Tài liệu tham khảo

Các file trong chương này tham khảo từ:
- Source code: `frontend/src/pages/`
- API routes: `backend/src/routes/`
- Database schema: `backend/prisma/schema.prisma`
- README.md: Project documentation
- Package.json: Dependencies versions

---

**Ngày cập nhật:** 29/10/2025  
**Trạng thái:** Đang thực hiện (12% hoàn thành)  
**Người thực hiện:** [Tên sinh viên]
