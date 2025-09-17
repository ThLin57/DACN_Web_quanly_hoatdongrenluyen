import React from 'react';
import { http } from '../../services/http';

export default function MyActivities(){
  const [tab, setTab] = React.useState('pending');
  const [data, setData] = React.useState({ pending: [], approved: [], joined: [], rejected: [] });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(function(){
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      setLoading(true);
      setError(null);
      
      const res = await http.get('/auth/my-activities');
      const activitiesData = res.data?.data || {};
      const activities = Array.isArray(activitiesData.activities) ? activitiesData.activities : [];
      
      // Group activities by status
      const grouped = {
        pending: [],
        approved: [],
        joined: [],
        rejected: []
      };
      
      activities.forEach(activity => {
        const status = activity.status || '';
        if (status === 'cho_duyet') {
          grouped.pending.push(activity);
        } else if (status === 'da_duyet') {
          grouped.approved.push(activity);
        } else if (status === 'da_tham_gia') {
          grouped.joined.push(activity);
        } else if (status === 'tu_choi') {
          grouped.rejected.push(activity);
        }
      });
      
      setData(grouped);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Không thể tải danh sách hoạt động');
      // Fallback to empty data
      setData({ pending: [], approved: [], joined: [], rejected: [] });
    } finally {
      setLoading(false);
    }
  }

  function getStatusInfo(status) {
    const statusMap = {
      'cho_duyet': { text: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-800' },
      'da_duyet': { text: 'Đã duyệt', cls: 'bg-green-100 text-green-700' },
      'da_tham_gia': { text: 'Đã tham gia', cls: 'bg-blue-100 text-blue-700' },
      'tu_choi': { text: 'Từ chối', cls: 'bg-red-100 text-red-700' }
    };
    return statusMap[status] || { text: status || 'Không xác định', cls: 'bg-gray-100 text-gray-700' };
  }

  function table(items){
    if (loading) {
      return React.createElement('div', { className: 'text-center py-8' }, [
        React.createElement('div', { key: 'spinner', className: 'inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' }),
        React.createElement('div', { key: 'text', className: 'text-sm text-gray-500 mt-2' }, 'Đang tải...')
      ]);
    }

    if (error) {
      return React.createElement('div', { className: 'text-center py-8' }, [
        React.createElement('div', { key: 'error', className: 'text-red-600 mb-2' }, error),
        React.createElement('button', { 
          key: 'retry', 
          onClick: loadActivities,
          className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        }, 'Thử lại')
      ]);
    }

    if (items.length === 0) {
      return React.createElement('div', { className: 'text-center py-8 text-gray-500' }, 'Chưa có hoạt động nào');
    }

    return React.createElement('div', { className: 'space-y-3' }, items.map(function(activity, idx){
      const statusInfo = getStatusInfo(activity.status);
      const registrationDate = activity.registrationDate ? new Date(activity.registrationDate).toLocaleDateString('vi-VN') : '';
      const startDate = activity.startDate ? new Date(activity.startDate).toLocaleDateString('vi-VN') : '';
      
      return React.createElement('div', { key: String(activity.id || idx), className: 'p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors' }, [
        React.createElement('div', { key: 'header', className: 'flex items-start justify-between gap-3 mb-3' }, [
          React.createElement('div', { key: 'info', className: 'flex-1' }, [
            React.createElement('div', { key: 'name', className: 'font-medium text-gray-800 mb-1' }, activity.name || 'Hoạt động'),
            React.createElement('div', { key: 'details', className: 'text-sm text-gray-500' }, 
              activity.type + ' • ' + 
              (startDate || '') + ' • ' +
              activity.semester + ' • ' + activity.year
            )
          ]),
          React.createElement('span', { 
            key: 'status', 
            className: 'px-3 py-1 rounded-full text-xs font-medium ' + statusInfo.cls
          }, statusInfo.text)
        ]),
        React.createElement('div', { key: 'footer', className: 'flex items-center justify-between text-sm' }, [
          React.createElement('div', { key: 'points', className: 'font-semibold text-green-600' }, 
            '+' + activity.points + ' điểm'
          ),
          React.createElement('div', { key: 'date', className: 'text-gray-500' }, 
            'Đăng ký: ' + registrationDate
          )
        ]),
        activity.rejectionReason ? React.createElement('div', { 
          key: 'rejection', 
          className: 'mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700' 
        }, 'Lý do từ chối: ' + activity.rejectionReason) : null
      ]);
    }));
  }

  const totalActivities = data.pending.length + data.approved.length + data.joined.length + data.rejected.length;
  const currentTabData = data[tab] || [];

  return React.createElement('div', { className: 'space-y-6' }, [
    // Header with stats
    React.createElement('div', { key: 'header', className: 'bg-white rounded-xl border p-6' }, [
      React.createElement('h1', { key: 'title', className: 'text-2xl font-bold text-gray-900 mb-4' }, 'Hoạt động của tôi'),
      React.createElement('div', { key: 'stats', className: 'grid grid-cols-2 md:grid-cols-4 gap-4' }, [
        React.createElement('div', { key: 'total', className: 'text-center p-3 bg-blue-50 rounded-lg' }, [
          React.createElement('div', { key: 'number', className: 'text-2xl font-bold text-blue-600' }, totalActivities),
          React.createElement('div', { key: 'label', className: 'text-sm text-gray-600' }, 'Tổng cộng')
        ]),
        React.createElement('div', { key: 'pending', className: 'text-center p-3 bg-yellow-50 rounded-lg' }, [
          React.createElement('div', { key: 'number', className: 'text-2xl font-bold text-yellow-600' }, data.pending.length),
          React.createElement('div', { key: 'label', className: 'text-sm text-gray-600' }, 'Chờ duyệt')
        ]),
        React.createElement('div', { key: 'approved', className: 'text-center p-3 bg-green-50 rounded-lg' }, [
          React.createElement('div', { key: 'number', className: 'text-2xl font-bold text-green-600' }, data.approved.length),
          React.createElement('div', { key: 'label', className: 'text-sm text-gray-600' }, 'Đã duyệt')
        ]),
        React.createElement('div', { key: 'joined', className: 'text-center p-3 bg-blue-50 rounded-lg' }, [
          React.createElement('div', { key: 'number', className: 'text-2xl font-bold text-blue-600' }, data.joined.length),
          React.createElement('div', { key: 'label', className: 'text-sm text-gray-600' }, 'Đã tham gia')
        ])
      ])
    ]),
    
    // Tabs
    React.createElement('div', { key: 'tabs', className: 'flex items-center gap-2' }, [
      tabBtn('Chờ phê duyệt', 'pending', tab, setTab, data.pending.length),
      tabBtn('Đã duyệt', 'approved', tab, setTab, data.approved.length),
      tabBtn('Đã tham gia', 'joined', tab, setTab, data.joined.length),
      tabBtn('Bị từ chối', 'rejected', tab, setTab, data.rejected.length)
    ]),
    
    // Content
    React.createElement('div', { key: 'content', className: 'bg-white border rounded-xl p-6' }, [
      React.createElement('div', { key: 'tab-header', className: 'flex items-center justify-between mb-4' }, [
        React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900' }, 
          getTabTitle(tab) + (currentTabData.length > 0 ? ` (${currentTabData.length})` : '')
        ),
        React.createElement('button', { 
          key: 'refresh', 
          onClick: loadActivities,
          disabled: loading,
          className: 'px-3 py-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50'
        }, 'Làm mới')
      ]),
      table(currentTabData)
    ])
  ]);
}

function getTabTitle(tab) {
  const titles = {
    'pending': 'Chờ phê duyệt',
    'approved': 'Đã duyệt', 
    'joined': 'Đã tham gia',
    'rejected': 'Bị từ chối'
  };
  return titles[tab] || 'Hoạt động';
}

function tabBtn(title, value, current, setCurrent, count = 0){
  var active = current === value;
  return React.createElement('button', { 
    key: value, 
    type: 'button', 
    onClick: function(){ setCurrent(value); }, 
    className: 'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
  }, [
    title,
    count > 0 ? React.createElement('span', { 
      key: 'badge', 
      className: 'ml-2 px-2 py-0.5 rounded-full text-xs ' + (active ? 'bg-blue-500' : 'bg-gray-300 text-gray-600')
    }, count) : null
  ]);
}


