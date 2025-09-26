# Giao diện Giảng viên

## Tổng quan
Giao diện giảng viên được thiết kế để cung cấp đầy đủ chức năng quản lý hoạt động rèn luyện, bao gồm tất cả các tính năng của Lớp trưởng và các chức năng mở rộng riêng biệt.

## Cấu trúc thư mục

```
frontend/src/pages/teacher/
├── TeacherDashboard.js                 # Dashboard chính
├── ActivityApproval.js                 # Phê duyệt hoạt động
├── ActivityTypeManagement.js           # Quản lý loại hoạt động  
└── StudentManagementAndReports.js      # Quản lý sinh viên & báo cáo

frontend/src/components/
└── TeacherLayout.js                    # Layout chung cho giảng viên
```

## Các trang chức năng

### 1. Dashboard Giảng viên (`/teacher`)
**Mục đích**: Trang chính hiển thị tổng quan và truy cập nhanh các chức năng

**Tính năng**:
- Thống kê tổng quan (hoạt động, sinh viên, tỷ lệ tham gia)
- Các nút thao tác nhanh đến từng chức năng
- Danh sách hoạt động gần đây
- Layout với sidebar điều hướng

### 2. Phê duyệt Hoạt động (`/teacher/approve`)
**Mục đích**: Xét duyệt các hoạt động do Lớp trưởng tạo và gửi lên

**Tính năng**:
- Bảng danh sách hoạt động chờ duyệt
- Thông tin chi tiết: Tên hoạt động, Người tạo, Lớp, Ngày gửi
- Nút "Duyệt" và "Từ chối" cho từng hoạt động
- Bộ lọc theo trạng thái và tìm kiếm
- Thống kê số lượng theo từng trạng thái

**Controls**:
```javascript
// Duyệt hoạt động
handleApprove(activityId)

// Từ chối hoạt động  
handleReject(activityId)

// Tìm kiếm
searchTerm: string

// Lọc theo trạng thái
statusFilter: 'all' | 'cho_duyet' | 'da_duyet' | 'tu_choi'
```

### 3. Quản lý Loại hoạt động (`/teacher/activity-types`)
**Mục đích**: Quản lý các danh mục hoạt động cho toàn khoa hoặc trường

**Tính năng**:
- Nút "Thêm loại hoạt động mới"
- Bảng danh sách loại hoạt động với các cột:
  - Tên loại
  - Mô tả 
  - Điểm rèn luyện mặc định
  - Hành động (Sửa, Xóa)
- Modal form thêm/sửa loại hoạt động
- Tìm kiếm theo tên và mô tả

**Controls**:
```javascript
// Thêm loại hoạt động
handleAdd(formData: {
  ten_loai: string,
  mo_ta: string, 
  diem_rl_mac_dinh: number
})

// Sửa loại hoạt động
handleEdit(formData)

// Xóa loại hoạt động
handleDelete(typeId)
```

### 4. Quản lý Sinh viên & Báo cáo (`/teacher/students`)
**Mục đích**: Quản lý danh sách sinh viên và xem báo cáo thống kê

**Tính năng**:

#### Tab "Quản lý Sinh viên":
- Nút "Tạo tài khoản từ file Excel" 
- Bảng danh sách sinh viên với thông tin:
  - Họ tên, MSSV, Lớp, Email
  - Điểm rèn luyện, Trạng thái
  - Nút Xem và Sửa cho từng sinh viên
- Bộ lọc theo lớp và tìm kiếm

#### Tab "Báo cáo - Thống kê":
- Biểu đồ tỷ lệ tham gia theo lớp
- Biểu đồ điểm trung bình các lớp  
- Nút "Xuất báo cáo (PDF/Excel)"
- Thống kê tổng quan (hoạt động tháng, tỷ lệ tham gia, điểm cao nhất)

**Controls**:
```javascript
// Import sinh viên từ Excel
handleImportStudents()

// Xuất báo cáo
handleExportReport(format: 'PDF' | 'Excel')

// Xem chi tiết sinh viên
handleViewStudent(student)

// Chỉnh sửa sinh viên
handleEditStudent(student)

// Tab switching
activeTab: 'students' | 'reports'
```

## Layout và Navigation

### TeacherLayout Component
Cung cấp sidebar navigation với các mục:
- Dashboard
- Tạo hoạt động  
- Phê duyệt hoạt động
- Quản lý loại HĐ
- Quản lý sinh viên
- QR điểm danh

**Responsive Design**:
- Desktop: Sidebar cố định bên trái
- Mobile: Sidebar có thể thu gọn với hamburger menu

## Routes Configuration

```javascript
// Trong App.js
React.createElement(Route, { 
  key: 'teacher-approve', 
  path: '/teacher/approve', 
  element: React.createElement(RoleGuard, { 
    allow: ['GIANG_VIEN','ADMIN'], 
    element: React.createElement(ActivityApproval) 
  }) 
}),

React.createElement(Route, { 
  key: 'teacher-activity-types', 
  path: '/teacher/activity-types', 
  element: React.createElement(RoleGuard, { 
    allow: ['GIANG_VIEN','ADMIN'], 
    element: React.createElement(ActivityTypeManagement) 
  }) 
}),

React.createElement(Route, { 
  key: 'teacher-students', 
  path: '/teacher/students', 
  element: React.createElement(RoleGuard, { 
    allow: ['GIANG_VIEN','ADMIN'], 
    element: React.createElement(StudentManagementAndReports) 
  }) 
})
```

## API Integration

### Endpoints sử dụng:
- `GET /api/activities` - Lấy danh sách hoạt động
- `PUT /api/activities/:id` - Cập nhật trạng thái hoạt động
- `GET /api/activity-types` - Lấy danh sách loại hoạt động
- `POST /api/activity-types` - Tạo loại hoạt động mới
- `PUT /api/activity-types/:id` - Cập nhật loại hoạt động
- `DELETE /api/activity-types/:id` - Xóa loại hoạt động
- `GET /api/users` - Lấy danh sách người dùng/sinh viên

## Styling và UI

**Framework**: TailwindCSS
**Icons**: Lucide React
**Color Scheme**: 
- Primary: Blue (600-700)
- Success: Green (600-700) 
- Warning: Yellow (600-700)
- Danger: Red (600-700)
- Info: Purple (600-700)

**Components tái sử dụng**:
- StatCard: Hiển thị thống kê
- Modal: Dialog form
- TabButton: Nút chuyển tab
- Card layouts cho danh sách items

## Lưu ý phát triển

1. **State Management**: Sử dụng React hooks (useState, useEffect)
2. **Error Handling**: Có xử lý lỗi và hiển thị thông báo
3. **Loading States**: Hiển thị spinner khi đang tải dữ liệu
4. **Responsive**: Tối ưu cho cả desktop và mobile
5. **Accessibility**: Sử dụng semantic HTML và ARIA labels
6. **Performance**: Lazy loading và debounce cho search

## Cách sử dụng

1. Đăng nhập với vai trò `GIANG_VIEN`
2. Truy cập `/teacher` để vào dashboard chính
3. Sử dụng sidebar hoặc các nút truy cập nhanh để điều hướng
4. Mỗi trang có hướng dẫn và tooltip riêng
5. Dữ liệu được tự động đồng bộ giữa các trang

## Tính năng mở rộng

Có thể mở rộng thêm:
- Real-time notifications
- Advanced charts và analytics  
- Bulk operations cho sinh viên
- Export templates cho các loại báo cáo
- Integration với hệ thống LMS khác