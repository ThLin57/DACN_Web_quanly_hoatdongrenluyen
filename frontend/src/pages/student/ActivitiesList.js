import React from 'react';
import { Search, Filter, Calendar, MapPin, Users, Clock, Award, Eye, UserPlus, ChevronRight, Grid3X3, List, SlidersHorizontal, ChevronLeft } from 'lucide-react';
import http from '../../services/http';

export default function ActivitiesList(){
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ type: '', status: '', from: '', to: '' });
  const [items, setItems] = React.useState([]);
  const [activityTypes, setActivityTypes] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [viewMode, setViewMode] = React.useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = React.useState(false);
  const [pagination, setPagination] = React.useState({ page: 1, limit: 12, total: 0 });
  const [role, setRole] = React.useState('');

  React.useEffect(function(){
    loadActivities();
    loadActivityTypes();
    // load role for conditional UI (student vs. lop_truong)
    http.get('/auth/profile')
      .then(function(res){
        const p = res.data?.data || res.data || {};
        const r = String(p?.role || p?.vai_tro?.ten_vt || '').toLowerCase();
        setRole(r);
      })
      .catch(function(){ setRole(''); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(function(){
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  function loadActivityTypes() {
    http.get('/activities/types/list')
      .then(function(res){
        if (res.data?.success && res.data?.data) {
          setActivityTypes(res.data.data);
        }
      })
      .catch(function(err){
        console.warn('Could not load activity types:', err);
      });
  }

  function loadActivities() {
    setLoading(true); 
    setError('');
    
    const params = { 
      q: query || undefined, 
      type: filters.type || undefined, 
      status: filters.status || undefined, 
      from: filters.from || undefined, 
      to: filters.to || undefined,
      page: pagination.page,
      limit: pagination.limit,
      sort: 'ngay_bd',
      order: 'asc'
    };

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    console.log('Loading activities with params:', params); // Debug log

    http.get('/activities', { params })
      .then(function(res){
        console.log('Activities API response:', res.data); // Debug log
        const responseData = res.data?.data;
        if (responseData && Array.isArray(responseData.items)) {
          console.log('Found activities:', responseData.items.length); // Debug log
          setItems(responseData.items);
          setPagination(prev => ({
            ...prev,
            total: responseData.total || 0
          }));
        } else {
          // Fallback for different response structure
          const items = Array.isArray(responseData) ? responseData : [];
          console.log('Using fallback, found activities:', items.length); // Debug log
          setItems(items);
          setPagination(prev => ({ ...prev, total: items.length }));
        }
      })
      .catch(function(err){ 
        console.error('Load activities error:', err);
        setItems([]); 
        setError(err?.response?.data?.message || err?.message || 'Lỗi tải dữ liệu hoạt động'); 
      })
      .finally(function(){ 
        setLoading(false); 
      });
  }

  function onSearch(e){
    if (e && e.preventDefault) e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when searching
    loadActivities();
  }

  function onFilterChange(newFilters) {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  }

  function handleRegister(activityId, activityName) {
    if (!window.confirm(`Bạn có chắc muốn đăng ký tham gia "${activityName}"?`)) return;
    
    http.post(`/activities/${activityId}/register`)
      .then(function(res){
        if (res.data?.success) {
          alert('Đã gửi đăng ký thành công! Vui lòng chờ phê duyệt.');
          loadActivities(); // Reload to update registration status
        } else {
          alert(res.data?.message || 'Đăng ký thành công nhưng chưa rõ trạng thái.');
        }
      })
      .catch(function(err){ 
        const firstValidation = err?.response?.data?.errors?.[0]?.message;
        const errorMsg = firstValidation || err?.response?.data?.message || err?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        alert(errorMsg); 
      });
  }

  function handlePageChange(newPage) {
    setPagination(prev => ({ ...prev, page: newPage }));
  }

  function parseDateSafe(d) {
    try { return d ? new Date(d) : null; } catch(_) { return null; }
  }

  function ActivityCard({ activity, mode = 'grid' }) {
    const startDate = parseDateSafe(activity.ngay_bd) || new Date();
    const endDate = parseDateSafe(activity.ngay_kt) || startDate;
    const now = new Date();
    const isUpcoming = startDate > now;
    const isOngoing = startDate <= now && endDate >= now;
    const isPast = endDate < now;
  const deadline = activity.han_dk ? parseDateSafe(activity.han_dk) : startDate;
  const isDeadlinePast = !!(deadline && deadline.getTime && deadline.getTime() < now.getTime());
  const isAfterStart = now.getTime() >= startDate.getTime(); // Nếu không có hạn đăng ký, coi thời điểm bắt đầu là hạn cuối

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

  // Chỉ cho đăng ký khi: đã duyệt, chưa bắt đầu, chưa quá hạn, chưa đăng ký
  const canRegister = activity.trang_thai === 'da_duyet' && !isPast && !isDeadlinePast && !isAfterStart && !activity.is_registered;
    const activityType = activity.loai || activity.loai_hd?.ten_loai_hd || 'Chưa phân loại';

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
                    activityType
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
            React.createElement('div', { key: 'details', className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-2' }, [
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
            ]),
            (isDeadlinePast || isAfterStart) && React.createElement('div', { key: 'deadline-badge', className: 'mt-2' }, [
              React.createElement('span', { 
                className: 'px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200'
              }, 'Đã quá hạn đăng ký')
            ])
            ])
          ]),
          React.createElement('div', { key: 'actions', className: 'flex flex-col gap-2 ml-6' }, [
            React.createElement('button', { 
              key: 'register',
              onClick: () => handleRegister(activity.id, activity.ten_hd),
              className: `flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                canRegister ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`,
              disabled: !canRegister
            }, [
              React.createElement(UserPlus, { className: 'h-4 w-4' }),
              activity.is_registered ? 'Đã đăng ký' : 'Đăng ký'
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
            React.createElement('span', {}, activityType)
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
        
        React.createElement('div', { key: 'time-status', className: 'mb-4 flex items-center gap-2 flex-wrap' }, [
          React.createElement('span', { className: `text-sm font-medium ${timeStatusColor}` }, timeStatus),
          isDeadlinePast && React.createElement('span', { 
            className: 'px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200'
          }, 'Đã quá hạn đăng ký')
        ])
      ]),
      
      React.createElement('div', { key: 'actions', className: 'flex gap-2 pt-4 border-t' }, [
        canRegister && React.createElement('button', { 
          key: 'register',
          onClick: () => handleRegister(activity.id, activity.ten_hd),
          className: 'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium bg-green-600 text-white hover:bg-green-700'
        }, [
          React.createElement(UserPlus, { className: 'h-4 w-4' }),
          'Đăng ký'
        ]),
        React.createElement('button', { 
          key: 'detail',
          onClick: () => window.location.href = `/activities/${activity.id}`,
          className: `flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${canRegister ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700 flex-1'}`
        }, [
          React.createElement(Eye, { className: 'h-4 w-4' }),
          'Chi tiết'
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
          className: 'block w-full pl-10 pr-36 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500', 
          placeholder: 'Tìm kiếm hoạt động...' 
        }),
        React.createElement('div', { key: 'search-actions', className: 'absolute inset-y-0 right-0 pr-2 flex items-center gap-2' }, [
          React.createElement('button', {
            key: 'do-search',
            type: 'submit',
            className: 'inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700'
          }, 'Tìm kiếm')
        ])
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
          onChange: function(e){ 
            const newFilters = {...filters, type: e.target.value};
            setFilters(newFilters);
            onFilterChange(newFilters);
          },
          className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
        }, [
          React.createElement('option', { key: 'all', value: '' }, 'Tất cả'),
          ...activityTypes.map(type => 
            React.createElement('option', { key: type.id, value: type.name }, type.name)
          )
        ])
      ]),
      React.createElement('div', { key: 'status-filter' }, [
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Trạng thái'),
        React.createElement('select', { 
          value: filters.status, 
          onChange: function(e){ 
            const newFilters = {...filters, status: e.target.value};
            setFilters(newFilters);
            onFilterChange(newFilters);
          },
          className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
        }, [
          React.createElement('option', { key: 'all', value: '' }, 'Tất cả'),
          React.createElement('option', { key: 'soon', value: 'soon' }, 'Sắp diễn ra'),
          React.createElement('option', { key: 'open', value: 'open' }, 'Đang mở đăng ký'),
          React.createElement('option', { key: 'closed', value: 'closed' }, 'Đã kết thúc')
        ])
      ]),
      React.createElement('div', { key: 'from-filter' }, [
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Từ ngày'),
        React.createElement('input', { 
          type: 'date', 
          value: filters.from, 
          onChange: function(e){ 
            const newFilters = {...filters, from: e.target.value};
            setFilters(newFilters);
            onFilterChange(newFilters);
          },
          className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
        })
      ]),
      React.createElement('div', { key: 'to-filter' }, [
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Đến ngày'),
        React.createElement('input', { 
          type: 'date', 
          value: filters.to, 
          onChange: function(e){ 
            const newFilters = {...filters, to: e.target.value};
            setFilters(newFilters);
            onFilterChange(newFilters);
          },
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
          setPagination(prev => ({ ...prev, page: 1 }));
          loadActivities();
        },
        className: 'mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
      }, 'Xóa bộ lọc')
    ]),

    // Activities grid/list
    (!loading && !error && items.length > 0) && React.createElement('div', { key: 'activities' }, [
      React.createElement('div', { key: 'results-info', className: 'flex items-center justify-between mb-6' }, [
        React.createElement('span', { key: 'count', className: 'text-gray-600' }, 
          `Tìm thấy ${pagination.total} hoạt động`),
        React.createElement('button', { 
          key: 'refresh',
          onClick: loadActivities,
          className: 'text-blue-600 hover:text-blue-700 text-sm font-medium'
        }, 'Làm mới')
      ]),
      activitiesGrid,
      // Pagination
      pagination.total > pagination.limit && React.createElement('div', { key: 'pagination', className: 'flex items-center justify-center mt-8 gap-2' }, [
        React.createElement('button', {
          key: 'prev',
          onClick: () => handlePageChange(pagination.page - 1),
          disabled: pagination.page <= 1,
          className: `flex items-center gap-2 px-4 py-2 rounded-lg border ${
            pagination.page <= 1 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
          }`
        }, [
          React.createElement(ChevronLeft, { className: 'h-4 w-4' }),
          'Trước'
        ]),
        ...Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
          const pageNum = pagination.page - 2 + i;
          const isValidPage = pageNum > 0 && pageNum <= Math.ceil(pagination.total / pagination.limit);
          if (!isValidPage) return null;
          
          return React.createElement('button', {
            key: `page-${pageNum}`,
            onClick: () => handlePageChange(pageNum),
            className: `px-4 py-2 rounded-lg border ${
              pageNum === pagination.page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
            }`
          }, pageNum);
        }).filter(Boolean),
        React.createElement('button', {
          key: 'next',
          onClick: () => handlePageChange(pagination.page + 1),
          disabled: pagination.page >= Math.ceil(pagination.total / pagination.limit),
          className: `flex items-center gap-2 px-4 py-2 rounded-lg border ${
            pagination.page >= Math.ceil(pagination.total / pagination.limit)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
          }`
        }, [
          'Sau',
          React.createElement(ChevronRight, { className: 'h-4 w-4' })
        ])
      ])
    ])
  ]);
}


