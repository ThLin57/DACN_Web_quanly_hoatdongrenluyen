import React from 'react';
import { Search, Filter, Calendar, MapPin, Users, Clock, Award, Eye, UserPlus, ChevronRight, Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import http from '../../services/http';

export default function ActivitiesList(){
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ type: '', status: '', from: '', to: '' });
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(function(){
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadActivities() {
    setLoading(true); 
    setError('');
    http.get('/activities', { 
      params: { 
        q: query, 
        type: filters.type, 
        status: filters.status, 
        from: filters.from, 
        to: filters.to 
      } 
    })
      .then(function(res){
        var d = res.data?.data;
        var arr = Array.isArray(d) ? d : (d && Array.isArray(d.items) ? d.items : []);
        setItems(arr);
      })
      .catch(function(err){ 
        setItems([]); 
        setError(err?.message || 'Lỗi tải dữ liệu'); 
      })
      .finally(function(){ 
        setLoading(false); 
      });
  }

  function onSearch(e){
    e.preventDefault();
    loadActivities();
  }

  function handleRegister(activityId, activityName) {
    if (!window.confirm(`Bạn có chắc muốn đăng ký tham gia "${activityName}"?`)) return;
    
    http.post(`/activities/${activityId}/register`)
      .then(function(){
        alert('Đã gửi đăng ký thành công! Vui lòng chờ phê duyệt.');
        loadActivities(); // Reload to update registration status
      })
      .catch(function(err){ 
        alert(err?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'); 
      });
  }

  function ActivityCard({ activity, mode = 'grid' }) {
    const startDate = new Date(activity.ngay_bd);
    const endDate = new Date(activity.ngay_kt);
    const isUpcoming = startDate > new Date();
    const isOngoing = startDate <= new Date() && endDate >= new Date();
    const isPast = endDate < new Date();

    const statusConfig = {
      'cho_duyet': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400', label: 'Chờ duyệt' },
      'da_duyet': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-400', label: 'Đã duyệt' },
      'tu_choi': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-400', label: 'Từ chối' },
      'ket_thuc': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', dot: 'bg-gray-400', label: 'Kết thúc' }
    };

    const status = statusConfig[activity.trang_thai] || statusConfig['da_duyet'];
    
    const timeStatus = isPast ? 'Đã kết thúc' : 
                     isOngoing ? 'Đang diễn ra' : 
                     isUpcoming ? 'Sắp diễn ra' : 'Chưa xác định';

    const timeStatusColor = isPast ? 'text-gray-500' : 
                          isOngoing ? 'text-green-600' : 
                          isUpcoming ? 'text-blue-600' : 'text-gray-500';

    if (mode === 'list') {
      return React.createElement('div', {
        className: 'bg-white border rounded-lg p-6 hover:shadow-md transition-all duration-200'
      }, [
        React.createElement('div', { key: 'content', className: 'flex items-start justify-between' }, [
          React.createElement('div', { key: 'main', className: 'flex-1' }, [
            React.createElement('div', { key: 'header', className: 'flex items-start justify-between mb-3' }, [
              React.createElement('div', { key: 'title-section' }, [
                React.createElement('h3', { key: 'title', className: 'text-lg font-semibold text-gray-900 mb-1' }, 
                  activity.ten_hd || 'Hoạt động'),
                React.createElement('div', { key: 'meta', className: 'flex items-center gap-3 text-sm text-gray-600' }, [
                  React.createElement('span', { key: 'type', className: 'flex items-center' }, [
                    React.createElement('div', { className: `w-2 h-2 rounded-full ${status.dot} mr-2` }),
                    activity.loai || activity.loai_hd?.ten_loai_hd || 'Chưa phân loại'
                  ]),
                  React.createElement('span', { key: 'time-status', className: timeStatusColor }, timeStatus)
                ])
              ]),
              React.createElement('div', { key: 'badges', className: 'flex flex-col items-end gap-2' }, [
                React.createElement('span', { 
                  className: `px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} ${status.border} border`
                }, status.label),
                React.createElement('span', { 
                  className: 'px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'
                }, `+${activity.diem_rl || 0} điểm`)
              ])
            ]),
            React.createElement('div', { key: 'details', className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-4' }, [
              React.createElement('div', { key: 'time', className: 'flex items-center text-sm text-gray-600' }, [
                React.createElement(Clock, { className: 'h-4 w-4 mr-2 text-gray-400' }),
                React.createElement('div', {}, [
                  React.createElement('div', {}, startDate.toLocaleDateString('vi-VN')),
                  React.createElement('div', { className: 'text-xs text-gray-500' }, 
                    startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
                ])
              ]),
              React.createElement('div', { key: 'location', className: 'flex items-center text-sm text-gray-600' }, [
                React.createElement(MapPin, { className: 'h-4 w-4 mr-2 text-gray-400' }),
                React.createElement('span', {}, activity.dia_diem || 'Chưa xác định')
              ]),
              React.createElement('div', { key: 'organizer', className: 'flex items-center text-sm text-gray-600' }, [
                React.createElement(Users, { className: 'h-4 w-4 mr-2 text-gray-400' }),
                React.createElement('span', {}, activity.don_vi_to_chuc || 'Nhà trường')
              ])
            ])
          ]),
          React.createElement('div', { key: 'actions', className: 'flex flex-col gap-2 ml-6' }, [
            React.createElement('button', { 
              key: 'register',
              onClick: () => handleRegister(activity.id, activity.ten_hd),
              className: 'flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium',
              disabled: isPast || activity.trang_thai === 'tu_choi'
            }, [
              React.createElement(UserPlus, { className: 'h-4 w-4' }),
              'Đăng ký'
            ]),
            React.createElement('button', { 
              key: 'detail',
              onClick: () => window.location.href = `/activities/${activity.id}`,
              className: 'flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
            }, [
              React.createElement(Eye, { className: 'h-4 w-4' }),
              'Chi tiết'
            ])
          ])
        ])
      ]);
    }

    // Grid mode (default)
    return React.createElement('div', {
      className: 'bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-200 flex flex-col h-full'
    }, [
      React.createElement('div', { key: 'header', className: 'flex justify-between items-start mb-4' }, [
        React.createElement('div', { key: 'status-badge' }, [
          React.createElement('span', { 
            className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} ${status.border} border`
          }, [
            React.createElement('div', { className: `w-2 h-2 rounded-full ${status.dot} mr-2` }),
            status.label
          ])
        ]),
        React.createElement('span', { 
          className: 'px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'
        }, `+${activity.diem_rl || 0} điểm`)
      ]),
      
      React.createElement('div', { key: 'content', className: 'flex-1' }, [
        React.createElement('h3', { key: 'title', className: 'text-lg font-semibold text-gray-900 mb-2 line-clamp-2' }, 
          activity.ten_hd || 'Hoạt động'),
        
        React.createElement('p', { key: 'description', className: 'text-sm text-gray-600 mb-4 line-clamp-2' }, 
          activity.mo_ta || 'Chưa có mô tả'),
          
        React.createElement('div', { key: 'meta', className: 'space-y-2 mb-4' }, [
          React.createElement('div', { key: 'type', className: 'flex items-center text-sm text-gray-600' }, [
            React.createElement(Calendar, { className: 'h-4 w-4 mr-2 text-gray-400' }),
            React.createElement('span', {}, activity.loai || activity.loai_hd?.ten_loai_hd || 'Chưa phân loại')
          ]),
          React.createElement('div', { key: 'time', className: 'flex items-center text-sm text-gray-600' }, [
            React.createElement(Clock, { className: 'h-4 w-4 mr-2 text-gray-400' }),
            React.createElement('span', {}, startDate.toLocaleDateString('vi-VN') + ' • ' + 
              startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
          ]),
          React.createElement('div', { key: 'location', className: 'flex items-center text-sm text-gray-600' }, [
            React.createElement(MapPin, { className: 'h-4 w-4 mr-2 text-gray-400' }),
            React.createElement('span', {}, activity.dia_diem || 'Chưa xác định')
          ])
        ]),
        
        React.createElement('div', { key: 'time-status', className: 'mb-4' }, [
          React.createElement('span', { className: `text-sm font-medium ${timeStatusColor}` }, timeStatus)
        ])
      ]),
      
      React.createElement('div', { key: 'actions', className: 'flex gap-2 pt-4 border-t' }, [
        React.createElement('button', { 
          key: 'register',
          onClick: () => handleRegister(activity.id, activity.ten_hd),
          className: 'flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium',
          disabled: isPast || activity.trang_thai === 'tu_choi'
        }, [
          React.createElement(UserPlus, { className: 'h-4 w-4' }),
          'Đăng ký'
        ]),
        React.createElement('button', { 
          key: 'detail',
          onClick: () => window.location.href = `/activities/${activity.id}`,
          className: 'flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
        }, [
          React.createElement(Eye, { className: 'h-4 w-4' })
        ])
      ])
    ]);
  }

  const searchAndFilters = React.createElement('div', { className: 'bg-white rounded-xl border p-6 mb-6' }, [
    // Search bar
    React.createElement('form', { key: 'search-form', onSubmit: onSearch, className: 'mb-4' }, [
      React.createElement('div', { key: 'search-container', className: 'relative' }, [
        React.createElement('div', { key: 'search-icon', className: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none' }, 
          React.createElement(Search, { className: 'h-5 w-5 text-gray-400' })),
        React.createElement('input', { 
          key: 'search-input',
          type: 'text', 
          value: query, 
          onChange: function(e){ setQuery(e.target.value); },
          onKeyPress: function(e){ if (e.key === 'Enter') onSearch(e); },
          className: 'block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500', 
          placeholder: 'Tìm kiếm hoạt động...' 
        }),
        React.createElement('button', {
          key: 'search-button',
          type: 'submit',
          className: 'absolute inset-y-0 right-0 pr-3 flex items-center'
        }, React.createElement(ChevronRight, { className: 'h-5 w-5 text-gray-400 hover:text-gray-600' }))
      ])
    ]),

    // Filter toggle
    React.createElement('div', { key: 'filter-toggle', className: 'flex items-center justify-between mb-4' }, [
      React.createElement('button', {
        key: 'toggle-filters',
        onClick: () => setShowFilters(!showFilters),
        className: 'flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors'
      }, [
        React.createElement(SlidersHorizontal, { className: 'h-5 w-5' }),
        React.createElement('span', {}, 'Lọc nâng cao'),
        React.createElement('span', { className: `transform transition-transform ${showFilters ? 'rotate-180' : ''}` }, '▼')
      ]),
      React.createElement('div', { key: 'view-mode', className: 'flex items-center gap-2' }, [
        React.createElement('span', { className: 'text-sm text-gray-600' }, 'Hiển thị:'),
        React.createElement('button', {
          onClick: () => setViewMode('grid'),
          className: `p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`
        }, React.createElement(Grid3X3, { className: 'h-4 w-4' })),
        React.createElement('button', {
          onClick: () => setViewMode('list'),
          className: `p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`
        }, React.createElement(List, { className: 'h-4 w-4' }))
      ])
    ]),

    // Advanced filters (collapsible)
    showFilters && React.createElement('div', { key: 'filters', className: 'grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg' }, [
      React.createElement('div', { key: 'type-filter' }, [
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Loại hoạt động'),
        React.createElement('select', { 
          value: filters.type, 
          onChange: function(e){ setFilters({...filters, type: e.target.value}); },
          className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
        }, [
          React.createElement('option', { key: 'all', value: '' }, 'Tất cả'),
          React.createElement('option', { key: 'academic', value: 'academic' }, 'Học thuật'),
          React.createElement('option', { key: 'volunteer', value: 'volunteer' }, 'Tình nguyện'),
          React.createElement('option', { key: 'cultural', value: 'cultural' }, 'Văn hóa'),
          React.createElement('option', { key: 'sports', value: 'sports' }, 'Thể thao')
        ])
      ]),
      React.createElement('div', { key: 'status-filter' }, [
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Trạng thái'),
        React.createElement('select', { 
          value: filters.status, 
          onChange: function(e){ setFilters({...filters, status: e.target.value}); },
          className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
        }, [
          React.createElement('option', { key: 'all', value: '' }, 'Tất cả'),
          React.createElement('option', { key: 'upcoming', value: 'upcoming' }, 'Sắp diễn ra'),
          React.createElement('option', { key: 'ongoing', value: 'ongoing' }, 'Đang diễn ra'),
          React.createElement('option', { key: 'past', value: 'past' }, 'Đã kết thúc')
        ])
      ]),
      React.createElement('div', { key: 'from-filter' }, [
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Từ ngày'),
        React.createElement('input', { 
          type: 'date', 
          value: filters.from, 
          onChange: function(e){ setFilters({...filters, from: e.target.value}); },
          className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
        })
      ]),
      React.createElement('div', { key: 'to-filter' }, [
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Đến ngày'),
        React.createElement('input', { 
          type: 'date', 
          value: filters.to, 
          onChange: function(e){ setFilters({...filters, to: e.target.value}); },
          className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
        })
      ])
    ])
  ]);

  const activitiesGrid = React.createElement('div', { 
    className: viewMode === 'grid' 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
      : 'space-y-4'
  }, items.map(function(activity, idx){
    return React.createElement(ActivityCard, { 
      key: activity.id || idx, 
      activity: activity, 
      mode: viewMode 
    });
  }));

  return React.createElement('div', { className: 'space-y-6' }, [
    // Header
    React.createElement('div', { 
      key: 'header',
      className: 'bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white'
    }, [
      React.createElement('h1', { key: 'title', className: 'text-2xl font-bold mb-2' }, 'Danh sách Hoạt động'),
      React.createElement('p', { key: 'subtitle', className: 'text-green-100' }, 'Khám phá và tham gia các hoạt động rèn luyện bổ ích')
    ]),

    searchAndFilters,

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
        React.createElement('div', { className: 'text-red-500 mr-3' }, '⚠️'),
        React.createElement('span', { className: 'text-red-700' }, error)
      ])
    ]),

    // Empty state
    (!loading && !error && items.length === 0) && React.createElement('div', { 
      key: 'empty', 
      className: 'text-center py-16' 
    }, [
      React.createElement(Calendar, { key: 'icon', className: 'h-16 w-16 mx-auto mb-4 text-gray-300' }),
      React.createElement('h3', { key: 'title', className: 'text-lg font-medium text-gray-900 mb-2' }, 'Không tìm thấy hoạt động nào'),
      React.createElement('p', { key: 'subtitle', className: 'text-gray-500' }, 'Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác'),
      React.createElement('button', { 
        key: 'clear-filters',
        onClick: function() {
          setQuery('');
          setFilters({ type: '', status: '', from: '', to: '' });
          loadActivities();
        },
        className: 'mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
      }, 'Xóa bộ lọc')
    ]),

    // Activities grid/list
    (!loading && !error && items.length > 0) && React.createElement('div', { key: 'activities' }, [
      React.createElement('div', { key: 'results-info', className: 'flex items-center justify-between mb-6' }, [
        React.createElement('span', { key: 'count', className: 'text-gray-600' }, 
          `Tìm thấy ${items.length} hoạt động`),
        React.createElement('button', { 
          key: 'refresh',
          onClick: loadActivities,
          className: 'text-blue-600 hover:text-blue-700 text-sm font-medium'
        }, 'Làm mới')
      ]),
      activitiesGrid
    ])
  ]);
}


