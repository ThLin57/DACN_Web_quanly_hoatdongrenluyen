# User Management System Implementation

## Overview

This document describes the complete implementation of the User Management System according to the specified usecases (U1-U6, U21). The system provides comprehensive user management, authentication, profile management, and student points tracking functionality.

## Features Implemented

### 1. User Authentication & Authorization (U1, U3, U4)
- **Login/Logout**: Secure JWT-based authentication
- **Password Management**: Change password with validation
- **Role-Based Access Control (RBAC)**: 4-tier role system
  - `ADMIN`: Full system access
  - `GIANG_VIEN`: Teacher privileges
  - `LOP_TRUONG`: Class monitor privileges  
  - `SINH_VIEN`: Student access

### 2. User Management (U2, U21)
- **CRUD Operations**: Complete user lifecycle management
- **User Registration**: Create new user accounts
- **Profile Management**: Update user information
- **Status Management**: Activate/deactivate user accounts
- **Admin Interface**: Comprehensive user management dashboard

### 3. User Profile (U5)
- **Personal Information**: View and edit profile details
- **Account Settings**: Manage account preferences
- **Password Change**: Secure password update functionality
- **Student Information**: Academic details and class information

### 4. Student Points Tracking (U6)
- **Points Summary**: Overall points calculation and classification
- **Points Detail**: Activity-based points breakdown
- **Attendance History**: Complete participation tracking
- **Report Generation**: PDF reports for points summary
- **Filtering**: By semester, academic year, and status

## Architecture

### Backend Structure

```
backend/src/
├── controllers/
│   ├── users.controller.js      # User management operations
│   ├── student-points.controller.js  # Points tracking
│   └── auth.controller.js       # Authentication (existing)
├── routes/
│   ├── users.route.js          # User management routes
│   ├── student-points.route.js # Points tracking routes
│   └── auth.route.js           # Authentication routes
├── middlewares/
│   ├── auth.js                 # JWT authentication
│   └── rbac.js                 # Role-based access control
└── validators/
    └── users.validator.js      # Input validation schemas
```

### Frontend Structure

```
frontend/src/
├── pages/
│   ├── admin/
│   │   └── UserManagement.js   # Admin user management interface
│   └── profile/
│       ├── UserProfile.js      # User profile management
│       └── StudentPoints.js    # Student points dashboard
└── components/
    ├── Header.js               # Updated with profile navigation
    └── Sidebar.js              # Navigation menu
```

## API Endpoints

### User Management
- `GET /users` - List all users (Admin only)
- `POST /users` - Create new user (Admin only)
- `GET /users/:id` - Get user by ID (Admin only)
- `PUT /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)
- `PUT /users/:id/status` - Update user status (Admin only)

### User Profile
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update current user profile
- `PUT /users/change-password` - Change user password

### Student Points
- `GET /student-points/summary` - Get points summary
- `GET /student-points/detail` - Get detailed points breakdown
- `GET /student-points/attendance` - Get attendance history
- `GET /student-points/report` - Download points report (PDF)

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/register` - User registration

## Database Schema

### Key Tables
- `nguoi_dung` - User accounts and basic information
- `vai_tro` - User roles and permissions
- `sinh_vien` - Student-specific information
- `lop` - Class information
- `hoat_dong_dang_ky` - Activity registrations
- `diem_danh` - Attendance records

### Relationships
- User → Role (Many-to-One)
- User → Student (One-to-One)
- Student → Class (Many-to-One)
- Student → Activity Registrations (One-to-Many)
- Registration → Attendance (One-to-Many)

## Authentication & Security

### JWT Token Structure
```javascript
{
  "id": "user_id",
  "ten_dn": "username", 
  "vai_tro": "SINH_VIEN",
  "iat": timestamp,
  "exp": timestamp
}
```

### RBAC Implementation
- Route-level protection using `requireAuth` middleware
- Permission-based access using `requirePermission` middleware
- Frontend role guards for component access control

### Password Security
- bcrypt hashing with salt rounds
- Password strength validation
- Secure password change workflow

## Usage Examples

### 1. Admin User Management

```javascript
// Create new user
const newUser = {
  ten_dn: 'student001',
  mat_khau: 'password123',
  ho_ten: 'Nguyen Van A',
  email: 'student001@university.edu.vn',
  vai_tro: 'SINH_VIEN'
};

const response = await http.post('/users', newUser);
```

### 2. User Profile Update

```javascript
// Update profile information
const profileData = {
  ho_ten: 'Nguyen Van A Updated',
  email: 'newemail@university.edu.vn',
  ngay_sinh: '2000-01-15',
  gt: 'nam',
  dia_chi: '123 Main Street, City',
  sdt: '0901234567'
};

const response = await http.put('/users/profile', profileData);
```

### 3. Student Points Query

```javascript
// Get points summary with filters
const filters = {
  hoc_ky: '1',
  nam_hoc: '2024-2025'
};

const response = await http.get('/student-points/summary', { params: filters });
```

## Frontend Components

### UserProfile Component
- Personal information editing
- Password change modal
- Student information display
- Responsive design with Tailwind CSS

### StudentPoints Component  
- Points summary dashboard
- Tabbed interface (Summary, Detail, Attendance)
- Filtering by semester and academic year
- Export functionality for reports

### UserManagement Component (Admin)
- User CRUD operations
- Search and filter functionality
- Modal-based editing interface
- Bulk operations support

## Testing

### Automated Tests
Run the test suite to verify all functionality:

```bash
cd backend
node test_user_management.js
```

### Test Coverage
- Authentication flow
- User CRUD operations
- Profile management
- Password change
- Student points calculation
- Error handling and validation

## Installation & Setup

### Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend Setup
```bash
cd frontend  
npm install
npm start
```

### Environment Variables
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-jwt-secret"
NODE_ENV="development"
PORT=3001
```

## Configuration

### RBAC Permissions
Configure role permissions in `backend/src/middlewares/rbac.js`:

```javascript
const PERMISSIONS = {
  'users.create': ['ADMIN'],
  'users.read': ['ADMIN', 'GIANG_VIEN'],
  'users.update': ['ADMIN'],
  'users.delete': ['ADMIN'],
  'profile.read': ['*'],
  'profile.update': ['*'],
  'student-points.read': ['SINH_VIEN', 'LOP_TRUONG', 'GIANG_VIEN', 'ADMIN']
};
```

### Points Calculation
Student points are automatically calculated based on:
- Activity participation
- Attendance verification
- Activity type and weight
- Semester and academic year

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check JWT token validity
   - Verify user credentials
   - Ensure proper role assignments

2. **Permission Denied**
   - Verify user role permissions
   - Check RBAC middleware configuration
   - Confirm route protection setup

3. **Profile Update Failed**
   - Validate input data format
   - Check required field constraints
   - Verify database constraints

4. **Points Not Calculated**
   - Ensure activity registrations exist
   - Check attendance records
   - Verify points calculation logic

### Debug Mode
Enable detailed logging by setting:
```env
LOG_LEVEL=debug
```

## Future Enhancements

### Planned Features
- Email verification for registration
- Two-factor authentication
- Advanced reporting and analytics
- Bulk user import/export
- Activity recommendation system
- Mobile app integration

### Performance Optimizations
- Database query optimization
- Caching for frequently accessed data
- Pagination for large datasets
- Image upload for user avatars

## Contributing

### Code Standards
- Use ESLint for code formatting
- Follow RESTful API conventions
- Write comprehensive tests
- Document all API endpoints
- Use meaningful commit messages

### Development Workflow
1. Create feature branch
2. Implement functionality
3. Write tests
4. Update documentation
5. Submit pull request

## License

This project is part of the Activity Management System for educational institutions.

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team