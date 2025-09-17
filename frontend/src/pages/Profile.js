import React from 'react';
import { http } from '../services/http';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { User, Phone, GraduationCap, Star, Key, Edit3 } from 'lucide-react';

export default function ProfilePage(){
  const [profile, setProfile] = React.useState(null);
  const [form, setForm] = React.useState({ sdt: '', currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [msg, setMsg] = React.useState('');
  const [err, setErr] = React.useState('');
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [activities, setActivities] = React.useState([]);
  const [points, setPoints] = React.useState({ total: 0, thisSemester: 0 });
  const [filters, setFilters] = React.useState({ semester: '', year: '' });
  const [activityFilters, setActivityFilters] = React.useState({ semester: '', year: '', status: '' });
  const [loading, setLoading] = React.useState(false);
  const [activitiesLoading, setActivitiesLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('basic');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({
    dateOfBirth: '',
    phone: '',
    email: '',
    emailPhu: '',
    fatherPhone: '',
    motherPhone: '',
    homeAddress: '',
    emergencyPhone: '',
    fatherName: '',
    motherName: ''
  });
  const [editLoading, setEditLoading] = React.useState(false);
  const [editMessage, setEditMessage] = React.useState('');

  React.useEffect(function load(){
    http.get('/auth/profile').then(function(res){
      const p = res.data?.data || null; setProfile(p); setForm(function(prev){ return Object.assign({}, prev, { sdt: p?.sdt || '' }); });
    }).catch(function(){});
  }, []);

  // Function to load points with filters
  const loadPoints = React.useCallback(function(semester, year) {
    setLoading(true);
    const params = {};
    if (semester) params.semester = semester;
    if (year) params.year = year;
    
    http.get('/auth/points', { params })
      .then(function(res){
        const pointsData = res.data?.data || {};
        setPoints({
          total: pointsData.total || 0,
          thisSemester: pointsData.currentSemester || 0,
          thisYear: pointsData.currentYear || 0,
          byType: pointsData.byType || {},
          activitiesCount: pointsData.activitiesCount || 0,
          breakdown: pointsData.breakdown || {},
          studentInfo: pointsData.studentInfo || {},
          activityDetails: pointsData.activityDetails || []
        });
      })
      .catch(function(){
        setPoints({ total: 0, thisSemester: 0, thisYear: 0, byType: {}, activitiesCount: 0, breakdown: {}, studentInfo: {}, activityDetails: [] });
      })
      .finally(function(){
        setLoading(false);
      });
  }, []);

  // Function to load activities with filters
  const loadActivities = React.useCallback(function(semester, year, status) {
    setActivitiesLoading(true);
    const params = {};
    if (semester) params.semester = semester;
    if (year) params.year = year;
    if (status) params.status = status;
    
    http.get('/auth/my-activities', { params })
      .then(function(res){
        const activitiesData = res.data?.data || {};
        setActivities(activitiesData.activities || []);
      })
      .catch(function(){
        setActivities([]);
      })
      .finally(function(){
        setActivitiesLoading(false);
      });
  }, []);

  // Load activities and points
  React.useEffect(function loadData(){
    // Load points without filters initially
    loadPoints('', '');
    
    // Load activities without filters initially
    loadActivities('', '', '');
  }, [loadPoints, loadActivities]);

  const role = (profile?.role || 'student').toLowerCase();

  // Function to start editing
  const startEdit = React.useCallback(function() {
    if (profile) {
      setEditData({
        dateOfBirth: profile.ngaysinh ? new Date(profile.ngaysinh).toISOString().split('T')[0] : '',
        phone: profile.sdt || '',
        email: profile.email || '',
        emailPhu: profile.email_phu || '',
        fatherPhone: profile.sdt_cha || '',
        motherPhone: profile.sdt_me || '',
        homeAddress: profile.dia_chi_gia_dinh || '',
        emergencyPhone: profile.sdt_khan_cap || '',
        fatherName: profile.ten_cha || '',
        motherName: profile.ten_me || ''
      });
      setIsEditing(true);
      setEditMessage('');
    }
  }, [profile]);

  // Function to cancel editing
  const cancelEdit = React.useCallback(function() {
    setIsEditing(false);
    setEditData({
      dateOfBirth: '',
      phone: '',
      email: '',
      emailPhu: '',
      fatherPhone: '',
      motherPhone: '',
      homeAddress: '',
      emergencyPhone: '',
      fatherName: '',
      motherName: ''
    });
    setEditMessage('');
  }, []);

  // Function to save changes
  const saveChanges = React.useCallback(function() {
    setEditLoading(true);
    setEditMessage('');
    
    // Map frontend field names to backend field names
    const backendData = {
      ngaysinh: editData.dateOfBirth,
      sdt: editData.phone,
      email: editData.email,
      email_phu: editData.emailPhu,
      sdt_cha: editData.fatherPhone,
      sdt_me: editData.motherPhone,
      dia_chi_gia_dinh: editData.homeAddress,
      sdt_khan_cap: editData.emergencyPhone,
      ten_cha: editData.fatherName,
      ten_me: editData.motherName
    };
    
    http.put('/auth/profile', backendData)
      .then(function(res) {
        setEditMessage('Cập nhật thông tin thành công!');
        // Reload profile data from server
        http.get('/auth/profile').then(function(profileRes) {
          const updatedProfile = profileRes.data?.data || null;
          setProfile(updatedProfile);
          setForm(function(prev) {
            return Object.assign({}, prev, { sdt: updatedProfile?.sdt || '' });
          });
        }).catch(function(err) {
          console.error('Error reloading profile:', err);
        });
        setIsEditing(false);
        setTimeout(function() {
          setEditMessage('');
        }, 3000);
      })
      .catch(function(err) {
        setEditMessage('Có lỗi xảy ra khi cập nhật thông tin: ' + (err.response?.data?.message || err.message));
      })
      .finally(function() {
        setEditLoading(false);
      });
  }, [editData]);

  // Function to handle edit data changes
  const handleEditChange = React.useCallback(function(e) {
    const { name, value } = e.target;
    setEditData(function(prev) {
      return { ...prev, [name]: value };
    });
  }, []);

  function handleChange(e){
    var name = e.target.name; var value = e.target.value;
    setForm(function(prev){ var next = Object.assign({}, prev); next[name] = value; return next; });
  }

  function handleFilterChange(e){
    var name = e.target.name; var value = e.target.value;
    setFilters(function(prev){ 
      var next = Object.assign({}, prev); 
      next[name] = value; 
      return next; 
    });
    
    // Reload points with new filter
    var newFilters = Object.assign({}, filters, { [name]: value });
    loadPoints(newFilters.semester, newFilters.year);
  }

  function handleActivityFilterChange(e){
    var name = e.target.name; var value = e.target.value;
    setActivityFilters(function(prev){ 
      var next = Object.assign({}, prev); 
      next[name] = value; 
      return next; 
    });
    
    // Reload activities with new filter
    var newFilters = Object.assign({}, activityFilters, { [name]: value });
    loadActivities(newFilters.semester, newFilters.year, newFilters.status);
  }


  async function changePassword(e){
    e.preventDefault(); setMsg(''); setErr('');
    if(form.newPassword !== form.confirmNewPassword){ setErr('Xác nhận mật khẩu mới không khớp'); return; }
    try {
      await http.post('/auth/change', { currentPassword: form.currentPassword, newPassword: form.newPassword, confirmNewPassword: form.confirmNewPassword });
      setMsg('Đổi mật khẩu thành công'); 
      setForm(function(prev){ return Object.assign({}, prev, { currentPassword: '', newPassword: '', confirmNewPassword: '' }); });
      // Close modal after successful password change
      setTimeout(function(){ setShowPasswordModal(false); }, 1500);
    } catch (error) {
      setErr(error?.response?.data?.message || 'Không thể đổi mật khẩu');
    }
  }

  const content = React.createElement('div', { key: 'profile-content' }, [
      // Header Section
      React.createElement('div', { key: 'header', className: 'flex items-center justify-between' }, [
        React.createElement('div', { key: 'title-section', className: 'flex items-center gap-4' }, [
          React.createElement('div', { key: 'icon', className: 'w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center' }, 
            React.createElement(User, { className: 'w-6 h-6 text-blue-600' })
          ),
          React.createElement('div', { key: 'text' }, [
            React.createElement('h1', { key: 'title', className: 'text-3xl font-bold text-gray-900' }, 'Thông tin cá nhân'),
            React.createElement('p', { key: 'subtitle', className: 'text-gray-600 mt-1' }, 'Quản lý thông tin tài khoản của bạn')
          ])
        ]),
        React.createElement('div', { key: 'actions', className: 'flex gap-3' }, [
          React.createElement('button', { 
            key: 'password-btn', 
            className: 'flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors',
            onClick: function(){ setShowPasswordModal(true); }
          }, [
            React.createElement(Key, { key: 'icon', className: 'w-4 h-4' }),
            'Đổi mật khẩu'
          ]),
          React.createElement('button', { 
            key: 'edit-btn', 
            className: 'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
            onClick: startEdit
          }, [
            React.createElement(Edit3, { key: 'icon', className: 'w-4 h-4' }),
            'Chỉnh sửa'
          ])
        ])
      ]),

      // Error/Success Messages
      err ? React.createElement('div', { key: 'e', className: 'text-sm text-red-600' }, err) : null,
      msg ? React.createElement('div', { key: 'm', className: 'text-sm text-green-600' }, msg) : null,

      // Main Content Card
      React.createElement('div', { key: 'main-card', className: 'bg-white rounded-xl border shadow-sm' }, [
        // Profile Summary
        React.createElement('div', { key: 'profile-summary', className: 'p-6 border-b' }, [
          React.createElement('div', { key: 'profile-info', className: 'flex items-center gap-4' }, [
            React.createElement('div', { key: 'avatar', className: 'w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-700' }, 
              (profile?.name || profile?.email || 'U').slice(0,1).toUpperCase()
            ),
            React.createElement('div', { key: 'details' }, [
              React.createElement('h2', { key: 'name', className: 'text-xl font-semibold text-gray-900' }, profile?.name || '—'),
              React.createElement('p', { key: 'id', className: 'text-gray-600' }, profile?.maso || '—'),
              React.createElement('p', { key: 'class', className: 'text-sm text-gray-500' }, 
                (profile?.lop || '—') + ' • ' + (profile?.khoa || '—')
              )
            ])
          ])
        ]),

        // Tabs Navigation
        React.createElement('div', { key: 'tabs', className: 'px-6 pt-4' }, [
          React.createElement('div', { key: 'tab-list', className: 'flex space-x-8' }, [
            tabButton('basic', 'Thông tin cơ bản', User, 'Họ tên, MSSV, lớp, khoa', activeTab, setActiveTab),
            tabButton('contact', 'Liên hệ & Gia đình', Phone, 'SĐT, địa chỉ, thông tin gia đình', activeTab, setActiveTab),
            tabButton('education', 'Học vấn', Star, 'THPT, điểm số, thông tin học tập', activeTab, setActiveTab)
          ])
        ]),

        // Tab Content
        React.createElement('div', { key: 'tab-content', className: 'p-6' }, [
          activeTab === 'basic' ? renderBasicInfo() : null,
          activeTab === 'contact' ? renderContactInfo() : null,
          activeTab === 'education' ? renderEducationInfo() : null
        ])
      ])
    ]);

  // Points and Activities sections (kept outside tabs as requested)
  const additionalSections = React.createElement('div', { key: 'additional-sections', className: 'space-y-6' }, [
    // Points card
      React.createElement('div', { key: 'points', className: 'bg-white rounded-xl border p-6' }, [
        React.createElement('div', { key: 'header', className: 'flex flex-col md:flex-row md:items-center md:justify-between mb-4' }, [
          React.createElement('h2', { key: 't', className: 'text-lg font-semibold mb-2 md:mb-0' }, 'Điểm rèn luyện'),
          // Filter controls
          React.createElement('div', { key: 'filters', className: 'flex flex-col sm:flex-row gap-2' }, [
            React.createElement('select', {
              key: 'semester',
              name: 'semester',
              value: filters.semester,
              onChange: handleFilterChange,
              className: 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            }, [
              React.createElement('option', { key: 'all', value: '' }, 'Tất cả học kỳ'),
              React.createElement('option', { key: 'hoc_ky_1', value: 'hoc_ky_1' }, 'Học kỳ 1'),
              React.createElement('option', { key: 'hoc_ky_2', value: 'hoc_ky_2' }, 'Học kỳ 2')
            ]),
            React.createElement('select', {
              key: 'year',
              name: 'year',
              value: filters.year,
              onChange: handleFilterChange,
              className: 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            }, [
              React.createElement('option', { key: 'all', value: '' }, 'Tất cả năm học'),
              React.createElement('option', { key: '2023-2024', value: '2023-2024' }, '2023-2024'),
              React.createElement('option', { key: '2024-2025', value: '2024-2025' }, '2024-2025'),
              React.createElement('option', { key: '2025-2026', value: '2025-2026' }, '2025-2026')
            ])
          ])
        ]),
        // Loading indicator
        loading ? React.createElement('div', { key: 'loading', className: 'text-center py-4' }, [
          React.createElement('div', { key: 'spinner', className: 'inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600' }),
          React.createElement('div', { key: 'text', className: 'text-sm text-gray-500 mt-2' }, 'Đang tải...')
        ]) : null,
        React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-6' }, [
          React.createElement('div', { key: 'total', className: 'text-center p-4 bg-blue-50 rounded-lg' }, [
            React.createElement('div', { key: 'val', className: 'text-3xl font-bold text-blue-600' }, points.total || 0),
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-600' }, 'Tổng điểm'),
            React.createElement('div', { key: 'count', className: 'text-xs text-gray-500 mt-1' }, (points.breakdown?.totalActivities || 0) + ' hoạt động')
          ]),
          React.createElement('div', { key: 'semester', className: 'text-center p-4 bg-green-50 rounded-lg' }, [
            React.createElement('div', { key: 'val', className: 'text-3xl font-bold text-green-600' }, points.thisSemester || 0),
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-600' }, 'Học kỳ này'),
            React.createElement('div', { key: 'count', className: 'text-xs text-gray-500 mt-1' }, (points.breakdown?.currentSemesterActivities || 0) + ' hoạt động')
          ]),
          React.createElement('div', { key: 'year', className: 'text-center p-4 bg-purple-50 rounded-lg' }, [
            React.createElement('div', { key: 'val', className: 'text-3xl font-bold text-purple-600' }, points.thisYear || 0),
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-600' }, 'Năm học này'),
            React.createElement('div', { key: 'count', className: 'text-xs text-gray-500 mt-1' }, (points.breakdown?.currentYearActivities || 0) + ' hoạt động')
          ])
        ]),
        // Current filter info
        (filters.semester || filters.year) ? React.createElement('div', { key: 'filterInfo', className: 'mt-4 p-3 bg-blue-50 rounded-lg' }, [
          React.createElement('div', { key: 'title', className: 'text-sm font-medium text-blue-800 mb-1' }, 'Đang lọc theo:'),
          React.createElement('div', { key: 'filters', className: 'text-sm text-blue-700' }, [
            filters.semester ? React.createElement('span', { key: 'semester' }, 'Học kỳ ' + (filters.semester === 'hoc_ky_1' ? '1' : '2')) : null,
            filters.semester && filters.year ? React.createElement('span', { key: 'separator' }, ' • ') : null,
            filters.year ? React.createElement('span', { key: 'year' }, 'Năm học ' + filters.year) : null
          ])
        ]) : null,
        // Points breakdown by type
        Object.keys(points.byType || {}).length > 0 ? React.createElement('div', { key: 'breakdown', className: 'mt-4' }, [
          React.createElement('h3', { key: 'title', className: 'text-sm font-medium text-gray-700 mb-3' }, 'Phân bổ theo loại hoạt động'),
          React.createElement('div', { key: 'types', className: 'space-y-2' }, 
            Object.entries(points.byType || {}).map(function([type, points]) {
              return React.createElement('div', { key: type, className: 'flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg' }, [
                React.createElement('span', { key: 'type', className: 'text-sm text-gray-700' }, type),
                React.createElement('span', { key: 'points', className: 'text-sm font-semibold text-blue-600' }, points + ' điểm')
              ]);
            })
          )
        ]) : null,
        // Activity details if available
        points.activityDetails && points.activityDetails.length > 0 ? React.createElement('div', { key: 'activityDetails', className: 'mt-4' }, [
          React.createElement('h3', { key: 'title', className: 'text-sm font-medium text-gray-700 mb-3' }, 'Chi tiết hoạt động'),
          React.createElement('div', { key: 'activities', className: 'space-y-2 max-h-48 overflow-y-auto' }, 
            points.activityDetails.map(function(activity, idx) {
              return React.createElement('div', { key: String(activity.id || idx), className: 'flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg' }, [
                React.createElement('div', { key: 'info', className: 'flex-1' }, [
                  React.createElement('div', { key: 'name', className: 'text-sm font-medium text-gray-800' }, activity.name),
                  React.createElement('div', { key: 'details', className: 'text-xs text-gray-500' }, 
                    activity.type + ' • ' + activity.semester + ' • ' + activity.year
                  )
                ]),
                React.createElement('div', { key: 'points', className: 'text-sm font-semibold text-green-600' }, '+' + activity.points)
              ]);
            })
          )
        ]) : null
      ]),

      // Activities card
      React.createElement('div', { key: 'activities', className: 'bg-white rounded-xl border p-6' }, [
        React.createElement('div', { key: 'header', className: 'flex flex-col md:flex-row md:items-center md:justify-between mb-4' }, [
          React.createElement('h2', { key: 't', className: 'text-lg font-semibold mb-2 md:mb-0' }, 'Danh sách hoạt động'),
          // Activity filter controls
          React.createElement('div', { key: 'filters', className: 'flex flex-col sm:flex-row gap-2' }, [
            React.createElement('select', {
              key: 'semester',
              name: 'semester',
              value: activityFilters.semester,
              onChange: handleActivityFilterChange,
              className: 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            }, [
              React.createElement('option', { key: 'all', value: '' }, 'Tất cả học kỳ'),
              React.createElement('option', { key: 'hoc_ky_1', value: 'hoc_ky_1' }, 'Học kỳ 1'),
              React.createElement('option', { key: 'hoc_ky_2', value: 'hoc_ky_2' }, 'Học kỳ 2')
            ]),
            React.createElement('select', {
              key: 'year',
              name: 'year',
              value: activityFilters.year,
              onChange: handleActivityFilterChange,
              className: 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            }, [
              React.createElement('option', { key: 'all', value: '' }, 'Tất cả năm học'),
              React.createElement('option', { key: '2023-2024', value: '2023-2024' }, '2023-2024'),
              React.createElement('option', { key: '2024-2025', value: '2024-2025' }, '2024-2025'),
              React.createElement('option', { key: '2025-2026', value: '2025-2026' }, '2025-2026')
            ]),
            React.createElement('select', {
              key: 'status',
              name: 'status',
              value: activityFilters.status,
              onChange: handleActivityFilterChange,
              className: 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            }, [
              React.createElement('option', { key: 'all', value: '' }, 'Tất cả trạng thái'),
              React.createElement('option', { key: 'cho_duyet', value: 'cho_duyet' }, 'Chờ duyệt'),
              React.createElement('option', { key: 'da_duyet', value: 'da_duyet' }, 'Đã duyệt'),
              React.createElement('option', { key: 'da_tham_gia', value: 'da_tham_gia' }, 'Đã tham gia'),
              React.createElement('option', { key: 'tu_choi', value: 'tu_choi' }, 'Từ chối')
            ])
          ])
        ]),
        // Loading indicator
        activitiesLoading ? React.createElement('div', { key: 'loading', className: 'text-center py-4' }, [
          React.createElement('div', { key: 'spinner', className: 'inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600' }),
          React.createElement('div', { key: 'text', className: 'text-sm text-gray-500 mt-2' }, 'Đang tải...')
        ]) : null,
        // Activities list
        React.createElement('div', { key: 'list', className: 'space-y-3 max-h-96 overflow-y-auto' }, 
          activities.length > 0 ? 
            activities.map(function(activity, idx){
              return React.createElement('div', { key: String(activity.id || idx), className: 'p-3 bg-gray-50 rounded-lg' }, [
                React.createElement('div', { key: 'header', className: 'flex items-start justify-between gap-2 mb-2' }, [
                  React.createElement('div', { key: 'info', className: 'flex-1' }, [
                    React.createElement('div', { key: 'name', className: 'font-medium text-gray-800' }, activity.name || 'Hoạt động'),
                    React.createElement('div', { key: 'details', className: 'text-sm text-gray-500' }, 
                      activity.type + ' • ' + 
                      (activity.startDate ? new Date(activity.startDate).toLocaleDateString('vi-VN') : '') + ' • ' +
                      activity.semester + ' • ' + activity.year
                    )
                  ]),
                  React.createElement('span', { 
                    key: 'status', 
                    className: 'px-2 py-1 rounded-full text-xs font-medium ' + getStatusStyle(activity.status)
                  }, getStatusLabel(activity.status))
                ]),
                React.createElement('div', { key: 'footer', className: 'flex items-center justify-between text-sm' }, [
                  React.createElement('div', { key: 'points', className: 'font-semibold text-green-600' }, 
                    '+' + activity.points + ' điểm'
                  ),
                  React.createElement('div', { key: 'date', className: 'text-gray-500' }, 
                    'Đăng ký: ' + (activity.registrationDate ? new Date(activity.registrationDate).toLocaleDateString('vi-VN') : '')
                  )
                ]),
                activity.rejectionReason ? React.createElement('div', { 
                  key: 'rejection', 
                  className: 'mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700' 
                }, 'Lý do từ chối: ' + activity.rejectionReason) : null
              ]);
            }) :
            React.createElement('div', { key: 'empty', className: 'text-center text-gray-500 py-8' }, 'Chưa có hoạt động nào được đăng ký')
        )
      ])
    ]);

  // Render functions for each tab
  function renderBasicInfo() {
    if (isEditing) {
      return React.createElement('div', { key: 'basic-content', className: 'space-y-6' }, [
        // Edit Message
        editMessage ? React.createElement('div', { 
          key: 'edit-message', 
          className: editMessage.includes('thành công') ? 'p-4 bg-green-100 text-green-800 rounded-lg' : 'p-4 bg-red-100 text-red-800 rounded-lg' 
        }, editMessage) : null,

        // Basic Information Edit Form
        React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 md:grid-cols-2 gap-6' }, [
          // Read-only fields
          infoField('Họ và tên', profile?.name || '—'),
          infoField('MSSV', profile?.maso || '—'),
          infoField('Lớp', profile?.lop || '—'),
          infoField('Niên khóa', profile?.nienkhoa || '—'),
          infoField('Tên đăng nhập', profile?.maso || '—'),
          infoField('Giới tính', profile?.gt === 'nam' ? 'Nam' : profile?.gt === 'nu' ? 'Nữ' : '—'),
          infoField('Khoa', profile?.khoa || '—'),
          infoField('CCCD/CMND', 'Chưa cập nhật', true),
          React.createElement('div', { key: 'status', className: 'space-y-1' }, [
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, 'Trạng thái tài khoản'),
            React.createElement('span', { key: 'value', className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800' }, 'Hoạt động')
          ]),
          
          // Editable fields
          React.createElement('div', { key: 'dateOfBirth', className: 'space-y-1' }, [
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, 'Ngày sinh *'),
            React.createElement('input', { 
              key: 'input', 
              type: 'date', 
              name: 'dateOfBirth', 
              value: editData.dateOfBirth, 
              onChange: handleEditChange,
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
            })
          ]),
          React.createElement('div', { key: 'email', className: 'space-y-1' }, [
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, 'Email *'),
            React.createElement('input', { 
              key: 'input', 
              type: 'email', 
              name: 'email', 
              value: editData.email, 
              onChange: handleEditChange,
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
            })
          ])
        ]),

        // Action buttons
        React.createElement('div', { key: 'actions', className: 'flex gap-3' }, [
          React.createElement('button', { 
            key: 'save-btn', 
            onClick: saveChanges, 
            disabled: editLoading,
            className: 'flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors' 
          }, editLoading ? 'Đang lưu...' : 'Lưu thay đổi'),
          React.createElement('button', { 
            key: 'cancel-btn', 
            onClick: cancelEdit, 
            disabled: editLoading,
            className: 'flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors' 
          }, 'Hủy')
        ])
      ]);
    }

    return React.createElement('div', { key: 'basic-content', className: 'space-y-6' }, [
      React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 md:grid-cols-2 gap-6' }, [
        infoField('Họ và tên', profile?.name || '—'),
        infoField('MSSV', profile?.maso || '—'),
        infoField('Ngày sinh', profile?.ngaysinh ? new Date(profile.ngaysinh).toLocaleDateString('vi-VN') : '—'),
        infoField('Lớp', profile?.lop || '—'),
        infoField('Niên khóa', profile?.nienkhoa || '—'),
        infoField('Email', profile?.email || '—'),
        infoField('Tên đăng nhập', profile?.maso || '—'),
        infoField('Giới tính', profile?.gt === 'nam' ? 'Nam' : profile?.gt === 'nu' ? 'Nữ' : '—'),
        infoField('Khoa', profile?.khoa || '—'),
        infoField('CCCD/CMND', 'Chưa cập nhật', true),
        React.createElement('div', { key: 'status', className: 'space-y-1' }, [
          React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, 'Trạng thái tài khoản'),
          React.createElement('span', { key: 'value', className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800' }, 'Hoạt động')
        ]),
        infoField('Ngày tạo tài khoản', profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : '—'),
        infoField('Cập nhật lần cuối', profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('vi-VN') : '—')
      ])
    ]);
  }

  function renderContactInfo() {
    if (isEditing) {
      return React.createElement('div', { key: 'contact-content', className: 'space-y-6' }, [
        // Edit Message
        editMessage ? React.createElement('div', { 
          key: 'edit-message', 
          className: editMessage.includes('thành công') ? 'p-4 bg-green-100 text-green-800 rounded-lg' : 'p-4 bg-red-100 text-red-800 rounded-lg' 
        }, editMessage) : null,

        // Contact Information Edit Form
        React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 md:grid-cols-2 gap-6' }, [
          // Editable fields
          React.createElement('div', { key: 'phone', className: 'space-y-1' }, [
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, 'Số điện thoại *'),
            React.createElement('input', { 
              key: 'input', 
              type: 'tel', 
              name: 'phone', 
              value: editData.phone, 
              onChange: handleEditChange,
              placeholder: 'Nhập số điện thoại',
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
            })
          ]),
          React.createElement('div', { key: 'emailPhu', className: 'space-y-1' }, [
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, 'Email phụ'),
            React.createElement('input', { 
              key: 'input', 
              type: 'email', 
              name: 'emailPhu', 
              value: editData.emailPhu, 
              onChange: handleEditChange,
              placeholder: 'Nhập email phụ',
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
            })
          ]),
          React.createElement('div', { key: 'fatherPhone', className: 'space-y-1' }, [
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, 'SĐT cha'),
            React.createElement('input', { 
              key: 'input', 
              type: 'tel', 
              name: 'fatherPhone', 
              value: editData.fatherPhone, 
              onChange: handleEditChange,
              placeholder: 'Nhập SĐT cha',
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
            })
          ]),
          React.createElement('div', { key: 'motherPhone', className: 'space-y-1' }, [
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, 'SĐT mẹ'),
            React.createElement('input', { 
              key: 'input', 
              type: 'tel', 
              name: 'motherPhone', 
              value: editData.motherPhone, 
              onChange: handleEditChange,
              placeholder: 'Nhập SĐT mẹ',
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
            })
          ]),
          React.createElement('div', { key: 'homeAddress', className: 'space-y-1 md:col-span-2' }, [
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, 'Địa chỉ gia đình'),
            React.createElement('textarea', { 
              key: 'input', 
              name: 'homeAddress', 
              value: editData.homeAddress, 
              onChange: handleEditChange,
              placeholder: 'Nhập địa chỉ gia đình',
              rows: 3,
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
            })
          ]),
          React.createElement('div', { key: 'emergencyPhone', className: 'space-y-1' }, [
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, 'SĐT khẩn cấp'),
            React.createElement('input', { 
              key: 'input', 
              type: 'tel', 
              name: 'emergencyPhone', 
              value: editData.emergencyPhone, 
              onChange: handleEditChange,
              placeholder: 'Nhập SĐT khẩn cấp',
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
            })
          ]),
          React.createElement('div', { key: 'fatherName', className: 'space-y-1' }, [
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, 'Tên cha'),
            React.createElement('input', { 
              key: 'input', 
              type: 'text', 
              name: 'fatherName', 
              value: editData.fatherName, 
              onChange: handleEditChange,
              placeholder: 'Nhập tên cha',
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
            })
          ]),
          React.createElement('div', { key: 'motherName', className: 'space-y-1' }, [
            React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, 'Tên mẹ'),
            React.createElement('input', { 
              key: 'input', 
              type: 'text', 
              name: 'motherName', 
              value: editData.motherName, 
              onChange: handleEditChange,
              placeholder: 'Nhập tên mẹ',
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
            })
          ])
        ]),

        // Action buttons
        React.createElement('div', { key: 'actions', className: 'flex gap-3' }, [
          React.createElement('button', { 
            key: 'save-btn', 
            onClick: saveChanges, 
            disabled: editLoading,
            className: 'flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors' 
          }, editLoading ? 'Đang lưu...' : 'Lưu thay đổi'),
          React.createElement('button', { 
            key: 'cancel-btn', 
            onClick: cancelEdit, 
            disabled: editLoading,
            className: 'flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors' 
          }, 'Hủy')
        ])
      ]);
    }

    return React.createElement('div', { key: 'contact-content', className: 'space-y-6' }, [
      React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 md:grid-cols-2 gap-6' }, [
        infoField('Số điện thoại', profile?.sdt || '—'),
        infoField('Email phụ', profile?.email_phu || '—'),
        infoField('SĐT cha', profile?.sdt_cha || '—'),
        infoField('SĐT mẹ', profile?.sdt_me || '—'),
        infoField('Địa chỉ gia đình', profile?.dia_chi_gia_dinh || '—'),
        infoField('SĐT khẩn cấp', profile?.sdt_khan_cap || '—'),
        infoField('Tên cha', profile?.ten_cha || '—'),
        infoField('Tên mẹ', profile?.ten_me || '—')
      ])
    ]);
  }

  function renderEducationInfo() {
    return React.createElement('div', { key: 'education-content', className: 'space-y-8' }, [
      // Education Information Section
      React.createElement('div', { key: 'education-section', className: 'space-y-4' }, [
        React.createElement('div', { key: 'header', className: 'flex items-center gap-2' }, [
          React.createElement(GraduationCap, { key: 'icon', className: 'w-5 h-5 text-blue-600' }),
          React.createElement('h3', { key: 'title', className: 'text-lg font-semibold text-gray-900' }, 'Thông tin học vấn')
        ]),
        React.createElement('div', { key: 'fields', className: 'space-y-4' }, [
          infoField('Trường THPT', 'Chưa cập nhật', true),
          infoField('Năm tốt nghiệp THPT', 'Chưa cập nhật', true),
          infoField('Điểm TB THPT', 'Chưa cập nhật', true)
        ])
      ])
    ]);
  }

  return React.createElement('div', { className: 'min-h-screen bg-gray-50' }, [
    React.createElement(Header, { key: 'hdr' }),
    React.createElement('div', { key: 'main-wrapper', className: 'flex' }, [
      React.createElement(Sidebar, { key: 'sb', role: role }),
      React.createElement('main', { key: 'main', className: 'flex-1 p-6 space-y-6' }, [
        content,
        additionalSections
      ])
    ]),
    // Password change modal
    showPasswordModal ? React.createElement('div', { key: 'modal', className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' }, [
      React.createElement('div', { key: 'modalContent', className: 'bg-white rounded-xl p-6 w-full max-w-md mx-4' }, [
        React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-4' }, [
          React.createElement('h3', { key: 'title', className: 'text-lg font-semibold' }, 'Đổi mật khẩu'),
          React.createElement('button', { 
            key: 'close', 
            className: 'text-gray-400 hover:text-gray-600',
            onClick: function(){ setShowPasswordModal(false); setForm(function(prev){ return Object.assign({}, prev, { currentPassword: '', newPassword: '', confirmNewPassword: '' }); }); setErr(''); setMsg(''); }
          }, '✕')
        ]),
        React.createElement('form', { key: 'form', onSubmit: changePassword, className: 'space-y-4' }, [
          input('Mật khẩu hiện tại', 'currentPassword', form.currentPassword, handleChange, 'password'),
          input('Mật khẩu mới', 'newPassword', form.newPassword, handleChange, 'password'),
          input('Xác nhận mật khẩu mới', 'confirmNewPassword', form.confirmNewPassword, handleChange, 'password'),
          React.createElement('div', { key: 'btns', className: 'flex gap-3 pt-4' }, [
            React.createElement('button', { 
              key: 'cancel', 
              type: 'button', 
              className: 'flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50',
              onClick: function(){ setShowPasswordModal(false); setForm(function(prev){ return Object.assign({}, prev, { currentPassword: '', newPassword: '', confirmNewPassword: '' }); }); setErr(''); setMsg(''); }
            }, 'Hủy'),
            React.createElement('button', { 
              key: 'submit', 
              type: 'submit', 
              className: 'flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700'
            }, 'Đổi mật khẩu')
          ])
        ])
      ])
    ]) : null
  ]);
}


function infoField(label, value, isPlaceholder = false) {
  return React.createElement('div', { key: label, className: 'space-y-1' }, [
    React.createElement('div', { key: 'label', className: 'text-sm text-gray-500' }, label),
    React.createElement('div', { key: 'value', className: `text-sm ${isPlaceholder ? 'text-gray-500' : 'text-gray-900'}` }, value)
  ]);
}

function tabButton(id, title, Icon, subtitle, activeTab, setActiveTab) {
  const isActive = activeTab === id;
  return React.createElement('button', {
    key: id,
    type: 'button',
    onClick: function() { setActiveTab(id); },
    className: `flex flex-col items-center gap-2 pb-4 border-b-2 transition-colors ${
      isActive 
        ? 'border-blue-600 text-blue-600' 
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`
  }, [
    React.createElement(Icon, { key: 'icon', className: `w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}` }),
    React.createElement('div', { key: 'content', className: 'text-center' }, [
      React.createElement('div', { key: 'title', className: 'text-sm font-medium' }, title),
      React.createElement('div', { key: 'subtitle', className: 'text-xs text-gray-500 mt-1' }, subtitle)
    ])
  ]);
}


function input(label, name, value, onChange, type){
  return React.createElement('div', { className: 'space-y-1' }, [
    React.createElement('div', { key: 'l', className: 'text-sm text-gray-500' }, label),
    React.createElement('input', { key: 'i', type: type || 'text', name: name, value: value || '', onChange: onChange, className: 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent' })
  ]);
}

function getStatusLabel(status) {
  const statusMap = {
    'cho_duyet': 'Chờ duyệt',
    'da_duyet': 'Đã duyệt', 
    'da_tham_gia': 'Đã tham gia',
    'tu_choi': 'Từ chối'
  };
  return statusMap[status] || status || 'Không xác định';
}

function getStatusStyle(status) {
  const styleMap = {
    'cho_duyet': 'bg-yellow-100 text-yellow-700',
    'da_duyet': 'bg-blue-100 text-blue-700',
    'da_tham_gia': 'bg-green-100 text-green-700', 
    'tu_choi': 'bg-red-100 text-red-700'
  };
  return styleMap[status] || 'bg-gray-100 text-gray-700';
}


