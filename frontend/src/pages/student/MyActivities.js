import React from 'react';
import { Clock, CheckCircle, XCircle, Calendar, MapPin, Award, Users, Eye, AlertCircle, UserX, QrCode, ChevronRight, FileText, Trophy } from 'lucide-react';
import http from '../../services/http';

export default function MyActivities(){
  const [tab, setTab] = React.useState('pending');
  const [data, setData] = React.useState({ pending: [], approved: [], joined: [], rejected: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(function(){
    let mounted = true;
    loadMyActivities();
    return function(){ mounted = false; };

    async function loadMyActivities(){
      try {
        setLoading(true);
        setError('');
        
        // Sử dụng endpoint mới từ dashboard
        const res = await http.get('/dashboard/activities/me');
        console.log('API Response:', res.data); // Debug log
        
        // Kiểm tra cấu trúc response
        const activities = res.data?.success && Array.isArray(res.data.data) 
          ? res.data.data 
          : Array.isArray(res.data) 
            ? res.data 
            : [];
        
        console.log('Processed activities:', activities); // Debug log
        
        // Phân loại theo trạng thái đăng ký
        const pending = activities.filter(x => (x.trang_thai_dk || '').toLowerCase() === 'cho_duyet');
        const approved = activities.filter(x => (x.trang_thai_dk || '').toLowerCase() === 'da_duyet');
        const joined = activities.filter(x => (x.trang_thai_dk || '').toLowerCase() === 'da_tham_gia');
        const rejected = activities.filter(x => (x.trang_thai_dk || '').toLowerCase() === 'tu_choi');
        
        console.log('Categories:', { pending: pending.length, approved: approved.length, joined: joined.length, rejected: rejected.length }); // Debug log
        
        if (!mounted) return;
        setData({ pending, approved, joined, rejected });
      } catch (err) {
        console.error('Load my activities error:', err);
        console.error('Error details:', err.response?.data); // Debug log
        if (!mounted) return;
        setError(err?.response?.data?.message || err?.message || 'Lỗi tải dữ liệu hoạt động');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
  }, []);

  async function cancelRegistration(hdId, activityName){
    if (!window.confirm(`Bạn có chắc muốn hủy đăng ký hoạt động "${activityName}"?`)) return;
    
    try {
      const res = await http.post(`/activities/${hdId}/cancel`);
      if (res.data?.success) {
        alert('Đã hủy đăng ký thành công!');
        // Reload data instead of full page refresh
        window.location.reload();
      } else {
        alert(res.data?.message || 'Hủy đăng ký thành công');
        window.location.reload();
      }
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Hủy đăng ký thất bại';
      alert(errorMsg);
    }
  }

  function ActivityCard({ activity, status }) {
    const activityData = activity.hoat_dong || activity;
    const startDate = activityData.ngay_bd ? new Date(activityData.ngay_bd) : null;
    const endDate = activityData.ngay_kt ? new Date(activityData.ngay_kt) : null;
    const registrationDate = activity.ngay_dang_ky ? new Date(activity.ngay_dang_ky) : null;
    const approvalDate = activity.ngay_duyet ? new Date(activity.ngay_duyet) : null;

    const statusConfig = {
      'pending': { 
        icon: Clock, 
        bg: 'bg-yellow-50', 
        border: 'border-yellow-200', 
        text: 'text-yellow-700', 
        dot: 'bg-yellow-400',
        label: 'Chờ phê duyệt' 
      },
      'approved': { 
        icon: CheckCircle, 
        bg: 'bg-green-50', 
        border: 'border-green-200', 
        text: 'text-green-700', 
        dot: 'bg-green-400',
        label: 'Đã duyệt' 
      },
      'joined': { 
        icon: Trophy, 
        bg: 'bg-blue-50', 
        border: 'border-blue-200', 
        text: 'text-blue-700', 
        dot: 'bg-blue-400',
        label: 'Đã tham gia' 
      },
      'rejected': { 
        icon: XCircle, 
        bg: 'bg-red-50', 
        border: 'border-red-200', 
        text: 'text-red-700', 
        dot: 'bg-red-400',
        label: 'Bị từ chối' 
      }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const StatusIcon = config.icon;

    return React.createElement('div', {
      className: `bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${config.border}`
    }, [
      // Header with status
      React.createElement('div', { key: 'header', className: 'flex items-start justify-between mb-4' }, [
        React.createElement('div', { key: 'title-section', className: 'flex-1' }, [
          React.createElement('h3', { key: 'title', className: 'text-lg font-semibold text-gray-900 mb-2' }, 
            activityData.ten_hd || activityData.name || 'Hoạt động'),
          React.createElement('div', { key: 'status', className: 'flex items-center gap-2' }, [
            React.createElement('div', { className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} ${config.border} border` }, [
              React.createElement(StatusIcon, { className: 'h-4 w-4 mr-2' }),
              config.label
            ])
          ])
        ]),
        React.createElement('div', { key: 'points', className: 'text-right' }, [
          React.createElement('div', { className: 'px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200' }, 
            `+${activityData.diem_rl || activityData.diem || 0} điểm`)
        ])
      ]),

      // Activity details
      React.createElement('div', { key: 'details', className: 'space-y-3 mb-4' }, [
        React.createElement('div', { key: 'type', className: 'flex items-center text-sm text-gray-600' }, [
          React.createElement(Calendar, { className: 'h-4 w-4 mr-2 text-gray-400' }),
          React.createElement('span', {}, activityData.loai || 'Chưa phân loại')
        ]),
        
        startDate && React.createElement('div', { key: 'time', className: 'flex items-center text-sm text-gray-600' }, [
          React.createElement(Clock, { className: 'h-4 w-4 mr-2 text-gray-400' }),
          React.createElement('div', {}, [
            React.createElement('span', {}, startDate.toLocaleDateString('vi-VN')),
            React.createElement('span', { className: 'mx-2 text-gray-400' }, '•'),
            React.createElement('span', {}, startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
          ])
        ]),
        
        activityData.dia_diem && React.createElement('div', { key: 'location', className: 'flex items-center text-sm text-gray-600' }, [
          React.createElement(MapPin, { className: 'h-4 w-4 mr-2 text-gray-400' }),
          React.createElement('span', {}, activityData.dia_diem)
        ]),
        
        activityData.don_vi_to_chuc && React.createElement('div', { key: 'organizer', className: 'flex items-center text-sm text-gray-600' }, [
          React.createElement(Users, { className: 'h-4 w-4 mr-2 text-gray-400' }),
          React.createElement('span', {}, activityData.don_vi_to_chuc)
        ]),

        registrationDate && React.createElement('div', { key: 'reg-date', className: 'flex items-center text-sm text-gray-500' }, [
          React.createElement(FileText, { className: 'h-4 w-4 mr-2 text-gray-400' }),
          React.createElement('span', {}, `Đăng ký ngày: ${registrationDate.toLocaleDateString('vi-VN')}`)
        ]),

        // Show approval date for approved/joined activities
        (status === 'approved' || status === 'joined') && approvalDate && React.createElement('div', { key: 'approval-date', className: 'flex items-center text-sm text-green-600' }, [
          React.createElement(CheckCircle, { className: 'h-4 w-4 mr-2' }),
          React.createElement('span', {}, `Duyệt ngày: ${approvalDate.toLocaleDateString('vi-VN')}`)
        ]),

        // Show rejection reason for rejected activities
        status === 'rejected' && activity.ly_do_tu_choi && React.createElement('div', { key: 'reject-reason', className: 'flex items-start text-sm text-red-600 mt-2 p-2 bg-red-50 rounded' }, [
          React.createElement(AlertCircle, { className: 'h-4 w-4 mr-2 mt-0.5 flex-shrink-0' }),
          React.createElement('span', {}, `Lý do từ chối: ${activity.ly_do_tu_choi}`)
        ])
      ]),

      // Actions
      React.createElement('div', { key: 'actions', className: 'flex gap-2 pt-4 border-t' }, [
        React.createElement('button', { 
          key: 'detail',
          onClick: () => window.location.href = `/activities/${activityData.id || activity.hd_id}`,
          className: 'flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
        }, [
          React.createElement(Eye, { className: 'h-4 w-4' }),
          'Xem chi tiết'
        ]),
        
        // QR Code button for approved activities
        (status === 'approved' || status === 'joined') && React.createElement('button', { 
          key: 'qr',
          onClick: () => window.location.href = `/qr-scan/${activityData.id || activity.hd_id}`,
          className: 'flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium'
        }, [
          React.createElement(QrCode, { className: 'h-4 w-4' }),
          'QR'
        ]),
        
        // Cancel button for pending activities
        status === 'pending' && React.createElement('button', { 
          key: 'cancel',
          onClick: () => cancelRegistration(activity.hd_id || activityData.id, activityData.ten_hd || activityData.name),
          className: 'flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium'
        }, [
          React.createElement(UserX, { className: 'h-4 w-4' }),
          'Hủy'
        ])
      ])
    ]);
  }

  function TabButton({ title, value, current, count, icon: Icon }) {
    const active = current === value;
    return React.createElement('button', { 
      key: value,
      type: 'button', 
      onClick: function(){ setTab(value); }, 
      className: `flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border'
      }`
    }, [
      React.createElement(Icon, { className: 'h-4 w-4' }),
      React.createElement('span', {}, title),
      React.createElement('span', { 
        className: `ml-1 px-2 py-0.5 rounded-full text-xs ${
          active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
        }`
      }, count || 0)
    ]);
  }

  const tabsConfig = [
    { key: 'pending', title: 'Chờ phê duyệt', icon: Clock, count: data.pending.length },
    { key: 'approved', title: 'Đã duyệt', icon: CheckCircle, count: data.approved.length },
    { key: 'joined', title: 'Đã tham gia', icon: Trophy, count: data.joined.length },
    { key: 'rejected', title: 'Bị từ chối', icon: XCircle, count: data.rejected.length }
  ];

  const currentItems = data[tab] || [];

  return React.createElement('div', { className: 'space-y-6' }, [
    // Header
    React.createElement('div', { 
      key: 'header',
      className: 'bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white'
    }, [
      React.createElement('h1', { key: 'title', className: 'text-2xl font-bold mb-2' }, 'Hoạt động của tôi'),
      React.createElement('p', { key: 'subtitle', className: 'text-purple-100' }, 'Theo dõi và quản lý các hoạt động bạn đã đăng ký')
    ]),

    // Stats Overview
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-2 md:grid-cols-4 gap-4' }, 
      tabsConfig.map(config => 
        React.createElement('div', { 
          key: config.key,
          className: `bg-white border rounded-xl p-4 ${tab === config.key ? 'ring-2 ring-blue-500 border-blue-500' : ''}`
        }, [
          React.createElement('div', { key: 'icon-container', className: 'flex items-center justify-between mb-2' }, [
            React.createElement('div', { className: `p-2 rounded-lg ${
              config.key === 'pending' ? 'bg-yellow-100 text-yellow-600' :
              config.key === 'approved' ? 'bg-green-100 text-green-600' :
              config.key === 'joined' ? 'bg-blue-100 text-blue-600' :
              'bg-red-100 text-red-600'
            }` }, React.createElement(config.icon, { className: 'h-5 w-5' })),
            React.createElement('span', { className: 'text-2xl font-bold text-gray-900' }, config.count)
          ]),
          React.createElement('p', { key: 'label', className: 'text-sm font-medium text-gray-700' }, config.title)
        ])
      )
    ),

    // Tabs
    React.createElement('div', { key: 'tabs', className: 'flex flex-wrap gap-2' }, 
      tabsConfig.map(config => 
        React.createElement(TabButton, {
          key: config.key,
          title: config.title,
          value: config.key,
          current: tab,
          count: config.count,
          icon: config.icon
        })
      )
    ),

    // Loading state
    loading && React.createElement('div', { 
      key: 'loading', 
      className: 'flex items-center justify-center py-12' 
    }, [
      React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' }),
      React.createElement('span', { className: 'ml-3 text-gray-600' }, 'Đang tải...')
    ]),

    // Error state
    error && React.createElement('div', { 
      key: 'error', 
      className: 'bg-red-50 border border-red-200 rounded-lg p-4' 
    }, [
      React.createElement('div', { className: 'flex items-center' }, [
        React.createElement(AlertCircle, { className: 'h-5 w-5 text-red-500 mr-3' }),
        React.createElement('span', { className: 'text-red-700' }, error)
      ])
    ]),

    // Empty state
    (!loading && !error && currentItems.length === 0) && React.createElement('div', { 
      key: 'empty', 
      className: 'text-center py-16' 
    }, [
      React.createElement('div', { key: 'icon', className: 'mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit' }, 
        React.createElement(tabsConfig.find(t => t.key === tab)?.icon || Calendar, { className: 'h-8 w-8 text-gray-400' })),
      React.createElement('h3', { key: 'title', className: 'text-lg font-medium text-gray-900 mb-2' }, 
        `Chưa có hoạt động nào ${tabsConfig.find(t => t.key === tab)?.title.toLowerCase()}`),
      React.createElement('p', { key: 'subtitle', className: 'text-gray-500 mb-4' }, 
        tab === 'pending' ? 'Hãy đăng ký tham gia các hoạt động mới' :
        tab === 'approved' ? 'Các hoạt động đã được duyệt sẽ hiển thị ở đây' :
        tab === 'joined' ? 'Lịch sử tham gia hoạt động của bạn' :
        'Các hoạt động bị từ chối sẽ hiển thị ở đây'),
      React.createElement('button', { 
        key: 'browse',
        onClick: () => window.location.href = '/activities',
        className: 'inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
      }, [
        'Khám phá hoạt động mới',
        React.createElement(ChevronRight, { className: 'h-4 w-4' })
      ])
    ]),

    // Activities grid
    (!loading && !error && currentItems.length > 0) && React.createElement('div', { key: 'activities' }, [
      React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-6' }, [
        React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900' }, 
          `${tabsConfig.find(t => t.key === tab)?.title} (${currentItems.length})`),
        React.createElement('button', { 
          key: 'refresh',
          onClick: () => window.location.reload(),
          className: 'text-blue-600 hover:text-blue-700 text-sm font-medium'
        }, 'Làm mới')
      ]),
      React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 md:grid-cols-2 gap-6' }, 
        currentItems.map(function(activity, idx){
          return React.createElement(ActivityCard, { 
            key: activity.id || activity.hd_id || idx, 
            activity: activity, 
            status: tab 
          });
        })
      )
    ])
  ]);
}


