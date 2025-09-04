# Cấu trúc Frontend - DACN

## 🏗️ Cấu trúc thư mục mới (Client-side Rendering)

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # UI components (Button, Input, Card, etc.)
│   │   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   │   ├── forms/          # Form components
│   │   └── common/         # Common components
│   ├── pages/              # Trang chính của ứng dụng
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard pages
│   │   └── profile/        # Profile pages
│   ├── services/           # API calls và HTTP requests
│   │   ├── api/            # API endpoints
│   │   ├── auth.service.js # Authentication service
│   │   └── user.service.js # User service
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.js      # Authentication hook
│   │   ├── useApi.js       # API handling hook
│   │   └── useLocalStorage.js # LocalStorage hook
│   ├── assets/             # Hình ảnh, fonts, icons
│   │   ├── icons/          # Icon components
│   │   ├── images/         # Image files
│   │   └── fonts/          # Font files
│   ├── styles/             # CSS/SCSS files
│   │   ├── components.css  # Component styles
│   │   ├── utilities.css   # Utility classes
│   │   └── index.css       # Main CSS file
│   ├── utils/              # Helper functions
│   │   ├── validation.js   # Validation utilities
│   │   ├── format.js       # Formatting utilities
│   │   └── index.js        # Export file
│   ├── context/            # React Context cho state management
│   │   └── AuthContext.js  # Authentication context
│   ├── store/              # State management (Zustand)
│   │   ├── authStore.js    # Authentication store
│   │   ├── uiStore.js      # UI state store
│   │   └── index.js        # Export file
│   ├── App.js              # Main app component
│   └── index.js            # Entry point
├── public/                 # Static assets
├── package.json
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── STRUCTURE.md            # This file
└── README.md               # Frontend documentation
```

## 🔄 Thay đổi chính

### 1. **Cấu trúc mới**
- **`hooks/`**: Custom React hooks tái sử dụng
- **`assets/`**: Tập trung tài nguyên tĩnh
- **`styles/`**: CSS modules và utility classes
- **`utils/`**: Helper functions và utilities
- **`store/`**: State management với Zustand

### 2. **Custom Hooks**
- **`useAuth`**: Authentication state management
- **`useApi`**: API calls với loading và error states
- **`useLocalStorage`**: LocalStorage management

### 3. **State Management**
- **Zustand**: Lightweight state management
- **Auth Store**: Authentication state
- **UI Store**: UI state (sidebar, theme, notifications)

### 4. **Utility Functions**
- **Validation**: Form validation utilities
- **Formatting**: Data formatting utilities
- **Helpers**: Common helper functions

### 5. **Styling System**
- **Tailwind CSS**: Utility-first CSS framework
- **Component Styles**: Pre-built component styles
- **Utility Classes**: Custom utility classes

## 🚀 Tính năng mới

### **State Management**
- ✅ Zustand stores
- ✅ Persistent authentication state
- ✅ UI state management
- ✅ Notification system

### **Custom Hooks**
- ✅ Authentication hooks
- ✅ API handling hooks
- ✅ LocalStorage hooks
- ✅ Reusable logic

### **Utility Functions**
- ✅ Form validation
- ✅ Data formatting
- ✅ Vietnamese localization
- ✅ Common helpers

### **Styling**
- ✅ Tailwind CSS
- ✅ Component styles
- ✅ Utility classes
- ✅ Responsive design

## 📝 Cách sử dụng

### **1. Custom Hooks**
```javascript
import { useAuth, useApi } from './hooks';

// Sử dụng authentication hook
const { user, login, logout } = useAuth();

// Sử dụng API hook
const { data, loading, error, execute } = useApi(apiFunction);
```

### **2. State Management**
```javascript
import { useAuthStore, useUIStore } from './store';

// Authentication store
const { user, login, logout } = useAuthStore();

// UI store
const { sidebarOpen, toggleSidebar } = useUIStore();
```

### **3. Utility Functions**
```javascript
import { isValidEmail, formatDate, formatRole } from './utils';

// Validation
const isValid = isValidEmail(email);

// Formatting
const formattedDate = formatDate(date);
const roleDisplay = formatRole('admin');
```

### **4. Styling**
```javascript
// Sử dụng component classes
<button className="btn btn-primary">Click me</button>

// Sử dụng utility classes
<div className="card hover-lift">
  <h2 className="text-gradient">Title</h2>
</div>
```

## 🔧 Cài đặt dependencies

```bash
cd frontend
npm install zustand
npm install
```

## 📊 Lợi ích của cấu trúc mới

1. **Modular**: Tách biệt rõ ràng các chức năng
2. **Reusable**: Hooks và utilities có thể tái sử dụng
3. **Maintainable**: Dễ bảo trì và mở rộng
4. **Scalable**: Cấu trúc hỗ trợ mở rộng
5. **Modern**: Sử dụng các công nghệ hiện đại

## 🚨 Lưu ý quan trọng

1. **Chức năng đăng nhập**: Hoàn toàn không bị ảnh hưởng
2. **API integration**: Sử dụng hooks mới để gọi API
3. **State management**: Chuyển từ Context sang Zustand
4. **Styling**: Sử dụng hệ thống CSS mới
5. **Components**: Có thể cần cập nhật để sử dụng hooks mới

## 🔄 Migration từ cấu trúc cũ

### **Bước 1: Cài đặt dependencies**
```bash
npm install zustand
```

### **Bước 2: Cập nhật imports**
```javascript
// Cũ
import { useAuth } from '../contexts/AuthContext';

// Mới
import { useAuth } from '../hooks/useAuth';
```

### **Bước 3: Cập nhật state management**
```javascript
// Cũ
const { user } = useContext(AuthContext);

// Mới
const { user } = useAuthStore();
```

### **Bước 4: Cập nhật styling**
```javascript
// Cũ
className="btn-primary"

// Mới
className="btn btn-primary"
```

## 📈 Lợi ích của cấu trúc mới

1. **Performance tốt hơn**: Zustand nhẹ hơn Context
2. **Developer Experience**: Hooks và utilities dễ sử dụng
3. **Code Quality**: Tách biệt rõ ràng, dễ test
4. **Maintenance**: Dễ bảo trì và debug
5. **Scalability**: Dễ dàng mở rộng tính năng mới
