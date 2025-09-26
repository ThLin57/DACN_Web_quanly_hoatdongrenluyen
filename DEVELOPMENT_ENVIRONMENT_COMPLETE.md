# 🔧 DACN - Hệ thống Development Environment HOÀN CHỈNH

## ✅ **TRẠNG THÁI HIỆN TẠI - TẤT CẢ SERVICES ĐANG CHẠY**

### 🌐 **Frontend (React)**
- **URL**: http://localhost:3000
- **Container**: `dacn_frontend_dev`
- **Status**: ✅ Running
- **Description**: Giao diện người dùng React với TailwindCSS

### 🔧 **Backend API (Node.js + Express)**
- **URL**: http://localhost:3001
- **Container**: `dacn_backend_dev`
- **Status**: ✅ Running  
- **Description**: API server với authentication, role-based access control

### 🗄️ **Database (PostgreSQL)**
- **URL**: localhost:5434
- **Container**: `dacn_db`
- **Status**: ✅ Running
- **Credentials**:
  - User: `admin`
  - Password: `abc`
  - Database: `Web_QuanLyDiemRenLuyen`

### 📊 **Prisma Studio (Database GUI)**
- **URL**: http://localhost:5555
- **Container**: `dacn_prisma_studio`
- **Status**: ✅ Running
- **Description**: Visual database editor để xem và chỉnh sửa data

---

## 🚀 **CÁCH SỬ DỤNG**

### **1. Khởi động Development Environment**
```powershell
# Khởi động tất cả services
.\scripts\quickstart-dev.ps1

# Hoặc manual
docker compose --profile dev up -d db prisma-studio backend-dev frontend-dev
```

### **2. Dừng Development Environment** 
```powershell
# Dừng tất cả
docker compose down

# Hoặc dừng từng service
docker stop dacn_frontend_dev dacn_backend_dev dacn_db dacn_prisma_studio
```

### **3. Xem logs để debug**
```powershell
# Tất cả logs
docker compose logs -f

# Logs của từng service
docker logs dacn_frontend_dev -f
docker logs dacn_backend_dev -f  
docker logs dacn_db -f
docker logs dacn_prisma_studio -f
```

---

## 📋 **DEVELOPMENT WORKFLOW**

### **Frontend Development**
1. Code thay đổi trong `./frontend/src/`
2. Hot reload tự động (React development server)
3. Test tại http://localhost:3000

### **Backend Development**  
1. Code thay đổi trong `./backend/src/`
2. Nodemon tự động restart server
3. API endpoints tại http://localhost:3001/api

### **Database Management**
1. **Prisma Studio**: http://localhost:5555 (GUI visual)
2. **Direct connection**: localhost:5434 (với PostgreSQL client)
3. **Migrations**: `docker exec dacn_backend_dev npx prisma migrate dev`

---

## 🔍 **TROUBLESHOOTING**

### **Vấn đề 1: Containers không start**
```powershell
# Xem chi tiết lỗi
docker compose logs [service-name]

# Force recreate
.\scripts\quickstart-dev.ps1 -Recreate
```

### **Vấn đề 2: Database connection lỗi**
```powershell
# Kiểm tra DB container
docker logs dacn_db

# Restart database
docker restart dacn_db
```

### **Vấn đề 3: Frontend/Backend không load**
```powershell
# Clear node_modules và reinstall
docker compose down
docker volume rm dacn_web_quanly_hoatdongrenluyen-master_frontend_node_modules
docker volume rm dacn_web_quanly_hoatdongrenluyen-master_backend_node_modules
.\scripts\quickstart-dev.ps1 -Build
```

### **Vấn đề 4: Port conflicts**
```powershell
# Kiểm tra ports đang sử dụng
netstat -an | findstr "3000\|3001\|5434\|5555"

# Kill processes if needed
taskkill /F /PID [PID]
```

---

## 🎯 **SERVICES OVERVIEW**

| Service | Container | Port | Status | Purpose |
|---------|-----------|------|--------|---------|
| **Frontend** | dacn_frontend_dev | 3000 | ✅ | React UI |
| **Backend** | dacn_backend_dev | 3001 | ✅ | API Server |
| **Database** | dacn_db | 5434 | ✅ | PostgreSQL |
| **Prisma Studio** | dacn_prisma_studio | 5555 | ✅ | DB GUI |

---

## 💡 **QUICK COMMANDS**

```powershell
# Khởi động development
.\scripts\quickstart-dev.ps1

# Restart lại nếu có lỗi
.\scripts\quickstart-dev.ps1 -Recreate

# Build lại containers
.\scripts\quickstart-dev.ps1 -Build

# Dừng hệ thống
docker compose down

# Xem trạng thái
docker ps

# Xem logs real-time
docker compose logs -f

# Truy cập bash trong container
docker exec -it dacn_backend_dev sh
docker exec -it dacn_frontend_dev sh
```

---

## 🎉 **KẾT LUẬN**

**✅ HỆ THỐNG DEVELOPMENT HOÀN CHỈNH!**

- ✅ Database PostgreSQL hoạt động 
- ✅ Prisma Studio có thể truy cập
- ✅ Backend API server chạy ổn định
- ✅ Frontend React với hot reload
- ✅ Tất cả services kết nối với nhau thành công

**Giờ bạn có thể development bình thường!** 🚀

**URLs để truy cập:**
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend: http://localhost:3001  
- 📊 Prisma Studio: http://localhost:5555

**Không còn thiếu service nào nữa!** 💪