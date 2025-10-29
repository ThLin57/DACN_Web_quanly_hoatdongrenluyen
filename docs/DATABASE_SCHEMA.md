# Database Schema - ERD & Migration

## Tổng quan

Hệ thống sử dụng PostgreSQL với Prisma ORM. Schema được định nghĩa trong `backend/prisma/schema.prisma`.

## ERD (Entity Relationship Diagram)

### Core Entities

```
┌─────────────┐
│  NguoiDung  │ (Người dùng - User)
│─────────────│
│ id (PK)     │
│ ten_dn      │
│ email       │
│ ho_ten      │
│ vai_tro_id  │──┐
│ trang_thai  │  │
└─────────────┘  │
                 │
┌─────────────┐  │
│   VaiTro    │◄─┘ (Vai trò - Role)
│─────────────│
│ id (PK)     │
│ ten_vt      │
│ quyen_han   │
└─────────────┘

┌─────────────┐
│  SinhVien   │ (Sinh viên - Student)
│─────────────│
│ id (PK)     │
│ nguoi_dung_id (FK) ──┐
│ mssv        │        │
│ lop_id      │──┐     │
└─────────────┘  │     │
                 │     │
┌─────────────┐  │     │
│     Lop     │◄─┘     │
│─────────────│        │
│ id (PK)     │        │
│ ten_lop     │        │
│ chu_nhiem   │──┐     │
│ lop_truong  │──┼──┐  │
└─────────────┘  │  │  │
                 │  │  │
                 │  │  │
┌─────────────┐  │  │  │
│  HoatDong   │  │  │  │
│─────────────│  │  │  │
│ id (PK)     │  │  │  │
│ loai_hd_id  │──┼──┼──┼──┐
│ nguoi_tao_id│──┘  │  │  │
│ ten_hd      │     │  │  │
│ trang_thai  │     │  │  │
└─────────────┘     │  │  │
                     │  │  │
┌─────────────┐      │  │  │
│LoaiHoatDong │◄─────┘  │  │
│─────────────│         │  │
│ id (PK)     │         │  │
│ ten_loai_hd │         │  │
└─────────────┘         │  │
                        │  │
┌─────────────────────┐ │  │
│ DangKyHoatDong      │ │  │
│─────────────────────│ │  │
│ id (PK)             │ │  │
│ sv_id (FK) ─────────┼─┘  │
│ hd_id (FK) ─────────┘    │
│ trang_thai_dk            │
└─────────────────────┘    │
                           │
┌─────────────────────┐    │
│     DiemDanh        │    │
│─────────────────────│    │
│ id (PK)             │    │
│ nguoi_diem_danh_id  │──┐ │
│ sv_id (FK) ─────────┼──┼─┘
│ hd_id (FK) ─────────┼──┘
│ tg_diem_danh        │
│ phuong_thuc         │
└─────────────────────┘

┌─────────────┐
│  ThongBao   │ (Thông báo - Notification)
│─────────────│
│ id (PK)     │
│ nguoi_gui_id│──┐
│ nguoi_nhan_id│─┼─┐
│ loai_tb_id  │  │ │
└─────────────┘  │ │
                 │ │
┌─────────────┐  │ │
│LoaiThongBao│◄─┘ │
│─────────────│   │
│ id (PK)     │   │
└─────────────┘   │
                  │
                  │
                  └─► Tham chiếu NguoiDung
```

## Các bảng chính

### 1. `nguoi_dung` (NguoiDung)
Người dùng hệ thống (có thể là Sinh viên, Lớp trưởng, Giảng viên, Admin).

**Quan hệ:**
- `vai_tro_id` → `vai_tro.id` (1-n)
- 1-1 với `sinh_vien` (optional)

### 2. `sinh_vien` (SinhVien)
Thông tin sinh viên mở rộng.

**Quan hệ:**
- `nguoi_dung_id` → `nguoi_dung.id` (1-1, unique)
- `lop_id` → `lop.id` (n-1)

### 3. `lop` (Lop)
Lớp học.

**Quan hệ:**
- `chu_nhiem` → `nguoi_dung.id` (n-1)
- `lop_truong` → `sinh_vien.id` (n-1, optional)
- 1-n với `sinh_viens`

### 4. `hoat_dong` (HoatDong)
Hoạt động rèn luyện.

**Quan hệ:**
- `loai_hd_id` → `loai_hoat_dong.id` (n-1)
- `nguoi_tao_id` → `nguoi_dung.id` (n-1)
- 1-n với `dang_ky_hd` (DangKyHoatDong)
- 1-n với `diem_danh` (DiemDanh)

### 5. `dang_ky_hoat_dong` (DangKyHoatDong)
Đăng ký tham gia hoạt động.

**Quan hệ:**
- `sv_id` → `sinh_vien.id` (n-1)
- `hd_id` → `hoat_dong.id` (n-1)
- Unique constraint: `(sv_id, hd_id)`

### 6. `diem_danh` (DiemDanh)
Điểm danh tham gia hoạt động (QR, thủ công).

**Quan hệ:**
- `nguoi_diem_danh_id` → `nguoi_dung.id` (n-1) - Người điểm danh
- `sv_id` → `sinh_vien.id` (n-1) - Sinh viên được điểm danh
- `hd_id` → `hoat_dong.id` (n-1)
- Unique constraint: `(sv_id, hd_id)`

### 7. `thong_bao` (ThongBao)
Thông báo trong hệ thống.

**Quan hệ:**
- `nguoi_gui_id` → `nguoi_dung.id` (n-1)
- `nguoi_nhan_id` → `nguoi_dung.id` (n-1)
- `loai_tb_id` → `loai_thong_bao.id` (n-1)

## Enums

- `TrangThaiTaiKhoan`: `hoat_dong`, `khong_hoat_dong`, `khoa`
- `TrangThaiHoatDong`: `cho_duyet`, `da_duyet`, `tu_choi`, `da_huy`, `ket_thuc`
- `TrangThaiDangKy`: `cho_duyet`, `da_duyet`, `tu_choi`, `da_tham_gia`
- `PhuongThucDiemDanh`: `qr`, `ma_vach`, `truyen_thong`
- `TrangThaiThamGia`: `co_mat`, `vang_mat`, `muon`, `ve_som`
- `GioiTinh`: `nam`, `nu`, `khac`
- `HocKy`: `hoc_ky_1`, `hoc_ky_2`

## Migration Scripts

### Vị trí migrations
Tất cả migrations được lưu tại: `backend/prisma/migrations/`

### Chạy migrations
```bash
cd backend
npm run migrate
# hoặc
npx prisma migrate dev
```

### Tạo migration mới
```bash
npx prisma migrate dev --name ten_migration
```

### Deploy migrations (production)
```bash
npx prisma migrate deploy
```

### Xem trạng thái migrations
```bash
npx prisma migrate status
```

## Tạo ERD từ Prisma Schema

### Option 1: Prisma ERD Generator (khuyến nghị)
```bash
npm install -D prisma-erd-generator @mermaid-js/mermaid-cli
npx prisma generate
# Sẽ tạo file ERD tại prisma/ERD.md
```

### Option 2: Prisma Studio (trực quan)
```bash
npx prisma studio
# Mở http://localhost:5555
```

### Option 3: Export sang SQL và dùng công cụ ERD
```bash
npx prisma db pull  # Pull schema từ DB (nếu đã có)
npx prisma migrate dev --create-only  # Tạo migration mới
# Sử dụng PostgreSQL ERD tools (pgAdmin, DBeaver, ...)
```

### Option 4: Online tools
- [dbdiagram.io](https://dbdiagram.io) - Import từ Prisma schema
- [draw.io](https://app.diagrams.net/) - Vẽ ERD thủ công
- [Mermaid](https://mermaid.live) - Tạo diagram từ code

## Schema Source

Schema chính xác và đầy đủ nhất tại: [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma)

## Quick Reference

- **Tổng số bảng**: 9 bảng chính
- **Quan hệ chính**: 
  - User ↔ Role (n-1)
  - User ↔ Student (1-1, optional)
  - Student ↔ Class (n-1)
  - Activity ↔ Registration (1-n)
  - Activity ↔ Attendance (1-n)
- **Indexes**: 
  - Unique constraints trên `ten_dn`, `email`, `mssv`, `ma_hd`, `qr`
  - Composite unique: `(sv_id, hd_id)` cho đăng ký và điểm danh
