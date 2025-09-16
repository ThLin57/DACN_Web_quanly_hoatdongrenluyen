import React from 'react';
import { TrendingUp, Calendar, Award, Target, BookOpen, Users, Heart, Trophy, Medal, BarChart3, PieChart, Filter, Download, RefreshCw, ChevronDown } from 'lucide-react';

export default function Scores(){
  const [viewBy, setViewBy] = React.useState('hoc_ky');
  const [options, setOptions] = React.useState([]);
  const [selected, setSelected] = React.useState('');
  const [total, setTotal] = React.useState(0);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(function(){ 
    setOptions([
      { value: '2024-2025_HK1', label: 'HK1 2024-2025' }, 
      { value: '2024-2025_HK2', label: 'HK2 2024-2025' },
      { value: '2023-2024_HK1', label: 'HK1 2023-2024' },
      { value: '2023-2024_HK2', label: 'HK2 2023-2024' }
    ]); 
    setSelected('2024-2025_HK1'); 
  }, []);

  React.useEffect(function(){ 
    if(!selected) return; 
    loadScores();
  }, [viewBy, selected]);

  function loadScores() {
    setLoading(true);
    // Simulate API call with enhanced placeholder data
    setTimeout(() => {
      setTotal(82);
      setRows([
        { 
          id: 's1', 
          ten_hd: 'Hiến máu nhân đạo', 
          ngay: '2025-01-15', 
          diem: 4, 
          loai: 'volunteer',
          don_vi_to_chuc: 'Hội Chữ thập đỏ',
          trang_thai: 'da_tham_gia'
        },
        { 
          id: 's2', 
          ten_hd: 'Chạy marathon vì sức khỏe', 
          ngay: '2025-01-10', 
          diem: 3, 
          loai: 'sports',
          don_vi_to_chuc: 'Khoa CNTT',
          trang_thai: 'da_tham_gia'
        },
        { 
          id: 's3', 
          ten_hd: 'Hội thảo học thuật AI', 
          ngay: '2025-01-05', 
          diem: 5, 
          loai: 'academic',
          don_vi_to_chuc: 'Khoa CNTT',
          trang_thai: 'da_tham_gia'
        },
        { 
          id: 's4', 
          ten_hd: 'Lễ hội văn hóa dân tộc', 
          ngay: '2024-12-20', 
          diem: 3, 
          loai: 'cultural',
          don_vi_to_chuc: 'Đoàn trường',
          trang_thai: 'da_tham_gia'
        },
        { 
          id: 's5', 
          ten_hd: 'Tình nguyện dọn vệ sinh môi trường', 
          ngay: '2024-12-15', 
          diem: 4, 
          loai: 'volunteer',
          don_vi_to_chuc: 'Đoàn khoa',
          trang_thai: 'da_tham_gia'
        }
      ]);
      setLoading(false);
    }, 500);
  }

  // Calculate statistics
  const stats = React.useMemo(() => {
    const byCategory = rows.reduce((acc, row) => {
      const category = row.loai || 'other';
      acc[category] = (acc[category] || 0) + (row.diem || 0);
      return acc;
    }, {});

    const categoryStats = [
      { key: 'academic', name: 'Học thuật', icon: BookOpen, color: 'blue', points: byCategory.academic || 0 },
      { key: 'volunteer', name: 'Tình nguyện', icon: Heart, color: 'red', points: byCategory.volunteer || 0 },
      { key: 'cultural', name: 'Văn hóa', icon: Users, color: 'purple', points: byCategory.cultural || 0 },
      { key: 'sports', name: 'Thể thao', icon: Trophy, color: 'green', points: byCategory.sports || 0 }
    ];

    const totalActivities = rows.length;
    const averagePoints = totalActivities > 0 ? (total / totalActivities).toFixed(1) : 0;

    return { categoryStats, totalActivities, averagePoints };
  }, [rows, total]);

  function ScoreCard({ activity }) {
    const date = new Date(activity.ngay);
    const categoryConfig = {
      'academic': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: BookOpen, color: 'blue' },
      'volunteer': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: Heart, color: 'red' },
      'cultural': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: Users, color: 'purple' },
      'sports': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: Trophy, color: 'green' }
    };

    const config = categoryConfig[activity.loai] || categoryConfig['academic'];
    const CategoryIcon = config.icon;

    return React.createElement('div', {
      className: `bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${config.border}`
    }, [
      React.createElement('div', { key: 'header', className: 'flex items-start justify-between mb-4' }, [
        React.createElement('div', { key: 'main-info', className: 'flex-1' }, [
          React.createElement('h3', { key: 'title', className: 'text-lg font-semibold text-gray-900 mb-2' }, 
            activity.ten_hd || 'Hoạt động'),
          React.createElement('div', { key: 'category', className: 'flex items-center gap-2' }, [
            React.createElement('div', { 
              className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} ${config.border} border`
            }, [
              React.createElement(CategoryIcon, { className: 'h-4 w-4 mr-2' }),
              activity.loai === 'academic' ? 'Học thuật' :
              activity.loai === 'volunteer' ? 'Tình nguyện' :
              activity.loai === 'cultural' ? 'Văn hóa' :
              activity.loai === 'sports' ? 'Thể thao' : 'Khác'
            ])
          ])
        ]),
        React.createElement('div', { key: 'points', className: 'text-right' }, [
          React.createElement('div', { className: 'flex items-center gap-2 mb-2' }, [
            React.createElement(Medal, { className: 'h-5 w-5 text-yellow-500' }),
            React.createElement('span', { className: 'text-2xl font-bold text-gray-900' }, activity.diem || 0),
            React.createElement('span', { className: 'text-sm text-gray-500' }, 'điểm')
          ])
        ])
      ]),

      React.createElement('div', { key: 'details', className: 'space-y-2' }, [
        React.createElement('div', { key: 'date', className: 'flex items-center text-sm text-gray-600' }, [
          React.createElement(Calendar, { className: 'h-4 w-4 mr-2 text-gray-400' }),
          React.createElement('span', {}, date.toLocaleDateString('vi-VN'))
        ]),
        activity.don_vi_to_chuc && React.createElement('div', { key: 'organizer', className: 'flex items-center text-sm text-gray-600' }, [
          React.createElement(Users, { className: 'h-4 w-4 mr-2 text-gray-400' }),
          React.createElement('span', {}, activity.don_vi_to_chuc)
        ])
      ])
    ]);
  }

  function ProgressCircle({ percentage, size = 120, strokeWidth = 8 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${percentage * circumference / 100} ${circumference}`;

    return React.createElement('div', { className: 'relative flex items-center justify-center' }, [
      React.createElement('svg', { 
        key: 'svg',
        width: size, 
        height: size, 
        className: 'transform -rotate-90' 
      }, [
        React.createElement('circle', {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          stroke: '#e5e7eb',
          strokeWidth: strokeWidth,
          fill: 'transparent'
        }),
        React.createElement('circle', {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          stroke: '#3b82f6',
          strokeWidth: strokeWidth,
          fill: 'transparent',
          strokeDasharray: strokeDasharray,
          strokeLinecap: 'round',
          className: 'transition-all duration-1000 ease-out'
        })
      ]),
      React.createElement('div', { 
        key: 'text',
        className: 'absolute inset-0 flex flex-col items-center justify-center' 
      }, [
        React.createElement('span', { key: 'percentage', className: 'text-2xl font-bold text-gray-900' }, `${percentage}%`),
        React.createElement('span', { key: 'label', className: 'text-xs text-gray-500' }, 'mục tiêu')
      ])
    ]);
  }

  const targetScore = 100; // Assumption: target is 100 points per semester
  const progressPercentage = Math.min((total / targetScore) * 100, 100);

  return React.createElement('div', { className: 'space-y-6' }, [
    // Header
    React.createElement('div', { 
      key: 'header',
      className: 'bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-white'
    }, [
      React.createElement('h1', { key: 'title', className: 'text-2xl font-bold mb-2' }, 'Điểm rèn luyện'),
      React.createElement('p', { key: 'subtitle', className: 'text-yellow-100' }, 'Theo dõi và phân tích kết quả rèn luyện của bạn')
    ]),

    // Filters and Controls
    React.createElement('div', { key: 'controls', className: 'bg-white rounded-xl border p-6' }, [
      React.createElement('div', { key: 'main-filters', className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-4' }, [
        React.createElement('div', { key: 'view-by' }, [
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Xem theo'),
          React.createElement('select', { 
            value: viewBy, 
            onChange: function(e){ setViewBy(e.target.value); },
            className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
          }, [
            React.createElement('option', { key: 'hk', value: 'hoc_ky' }, 'Học kỳ'),
            React.createElement('option', { key: 'nh', value: 'nam_hoc' }, 'Năm học')
          ])
        ]),
        React.createElement('div', { key: 'period' }, [
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Chọn kỳ'),
          React.createElement('select', { 
            value: selected, 
            onChange: function(e){ setSelected(e.target.value); },
            className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
          }, options.map(function(o){ 
            return React.createElement('option', { key: o.value, value: o.value }, o.label); 
          }))
        ]),
        React.createElement('div', { key: 'actions', className: 'flex items-end gap-2' }, [
          React.createElement('button', { 
            onClick: loadScores,
            disabled: loading,
            className: 'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
          }, [
            React.createElement(RefreshCw, { className: `h-4 w-4 ${loading ? 'animate-spin' : ''}` }),
            'Làm mới'
          ]),
          React.createElement('button', { 
            className: 'flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
          }, [
            React.createElement(Download, { className: 'h-4 w-4' }),
            'Xuất Excel'
          ])
        ])
      ])
    ]),

    // Statistics Overview
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' }, [
      // Progress Circle
      React.createElement('div', { key: 'progress', className: 'bg-white rounded-xl border p-6' }, [
        React.createElement('h3', { key: 'title', className: 'text-lg font-semibold text-gray-900 mb-4 flex items-center' }, [
          React.createElement(Target, { className: 'h-5 w-5 mr-2 text-blue-600' }),
          'Tiến độ học kỳ'
        ]),
        React.createElement('div', { key: 'progress-content', className: 'flex flex-col items-center' }, [
          React.createElement(ProgressCircle, { percentage: Math.round(progressPercentage) }),
          React.createElement('div', { key: 'details', className: 'mt-4 text-center' }, [
            React.createElement('p', { key: 'current', className: 'text-2xl font-bold text-gray-900' }, `${total}/${targetScore}`),
            React.createElement('p', { key: 'label', className: 'text-sm text-gray-500' }, 'điểm đạt được')
          ])
        ])
      ]),

      // Quick Stats
      React.createElement('div', { key: 'quick-stats', className: 'bg-white rounded-xl border p-6' }, [
        React.createElement('h3', { key: 'title', className: 'text-lg font-semibold text-gray-900 mb-4 flex items-center' }, [
          React.createElement(BarChart3, { className: 'h-5 w-5 mr-2 text-green-600' }),
          'Thống kê tổng quan'
        ]),
        React.createElement('div', { key: 'stats-list', className: 'space-y-4' }, [
          React.createElement('div', { key: 'total-activities', className: 'flex items-center justify-between' }, [
            React.createElement('span', { className: 'text-gray-600' }, 'Số hoạt động'),
            React.createElement('span', { className: 'font-semibold text-gray-900' }, stats.totalActivities)
          ]),
          React.createElement('div', { key: 'avg-points', className: 'flex items-center justify-between' }, [
            React.createElement('span', { className: 'text-gray-600' }, 'Điểm TB/hoạt động'),
            React.createElement('span', { className: 'font-semibold text-gray-900' }, stats.averagePoints)
          ]),
          React.createElement('div', { key: 'ranking', className: 'flex items-center justify-between' }, [
            React.createElement('span', { className: 'text-gray-600' }, 'Xếp hạng lớp'),
            React.createElement('span', { className: 'font-semibold text-green-600' }, '#3/45')
          ])
        ])
      ]),

      // Category Breakdown
      React.createElement('div', { key: 'categories', className: 'bg-white rounded-xl border p-6' }, [
        React.createElement('h3', { key: 'title', className: 'text-lg font-semibold text-gray-900 mb-4 flex items-center' }, [
          React.createElement(PieChart, { className: 'h-5 w-5 mr-2 text-purple-600' }),
          'Phân loại hoạt động'
        ]),
        React.createElement('div', { key: 'category-list', className: 'space-y-3' }, 
          stats.categoryStats.map(category => {
            const IconComponent = category.icon;
            const colorClass = {
              'blue': 'text-blue-600 bg-blue-100',
              'red': 'text-red-600 bg-red-100',
              'purple': 'text-purple-600 bg-purple-100',
              'green': 'text-green-600 bg-green-100'
            }[category.color];

            return React.createElement('div', { 
              key: category.key, 
              className: 'flex items-center justify-between'
            }, [
              React.createElement('div', { key: 'category-info', className: 'flex items-center' }, [
                React.createElement('div', { className: `p-2 rounded-lg ${colorClass} mr-3` }, 
                  React.createElement(IconComponent, { className: 'h-4 w-4' })),
                React.createElement('span', { className: 'text-gray-700' }, category.name)
              ]),
              React.createElement('span', { key: 'points', className: 'font-semibold text-gray-900' }, 
                `${category.points} điểm`)
            ]);
          })
        )
      ])
    ]),

    // Loading state
    loading && React.createElement('div', { 
      key: 'loading', 
      className: 'flex items-center justify-center py-12' 
    }, [
      React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' }),
      React.createElement('span', { className: 'ml-3 text-gray-600' }, 'Đang tải dữ liệu...')
    ]),

    // Activities List
    (!loading && rows.length > 0) && React.createElement('div', { key: 'activities' }, [
      React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-6' }, [
        React.createElement('h2', { key: 'title', className: 'text-xl font-semibold text-gray-900 flex items-center' }, [
          React.createElement(Award, { className: 'h-6 w-6 mr-2 text-yellow-600' }),
          `Chi tiết hoạt động (${rows.length})`
        ]),
        React.createElement('div', { key: 'summary', className: 'text-right' }, [
          React.createElement('div', { className: 'text-2xl font-bold text-gray-900' }, `${total} điểm`),
          React.createElement('div', { className: 'text-sm text-gray-500' }, 'tổng cộng')
        ])
      ]),
      React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' }, 
        rows.map(function(activity, idx){
          return React.createElement(ScoreCard, { 
            key: activity.id || idx, 
            activity: activity
          });
        })
      )
    ]),

    // Empty state
    (!loading && rows.length === 0) && React.createElement('div', { 
      key: 'empty', 
      className: 'text-center py-16' 
    }, [
      React.createElement(Award, { key: 'icon', className: 'h-16 w-16 mx-auto mb-4 text-gray-300' }),
      React.createElement('h3', { key: 'title', className: 'text-lg font-medium text-gray-900 mb-2' }, 'Chưa có điểm rèn luyện'),
      React.createElement('p', { key: 'subtitle', className: 'text-gray-500 mb-4' }, 'Tham gia các hoạt động để tích lũy điểm rèn luyện'),
      React.createElement('button', { 
        key: 'browse',
        onClick: () => window.location.href = '/activities',
        className: 'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
      }, 'Khám phá hoạt động')
    ])
  ]);
}


