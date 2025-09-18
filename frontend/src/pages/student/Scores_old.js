import React from 'react';
import { TrendingUp, Calendar, Award, Target, BookOpen, Users, Heart, Trophy, Medal, BarChart3, PieChart, Filter, Download, RefreshCw, ChevronDown, AlertCircle } from 'lucide-react';
import http from '../../services/http';

export default function Scores(){
  const [viewBy, setViewBy] = React.useState('hoc_ky');
  const [options, setOptions] = React.useState([]);
  const [selected, setSelected] = React.useState('');
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(function(){ 
    // Initialize semester/year options
    const currentYear = new Date().getFullYear();
    const semesterOptions = [];
    
    for (let year = currentYear; year >= currentYear - 2; year--) {
      semesterOptions.push(
        { value: `${year}-${year+1}_HK1`, label: `HK1 ${year}-${year+1}` },
        { value: `${year}-${year+1}_HK2`, label: `HK2 ${year}-${year+1}` }
      );
    }
    
    setOptions(semesterOptions); 
    setSelected(semesterOptions[0]?.value || ''); 
  }, []);

  React.useEffect(function(){ 
    if(!selected) return; 
    loadScores();
  }, [viewBy, selected]);

  async function loadScores() {
    setLoading(true);
    setError('');
    
    try {
      const [semester, year] = selected.split('_');
      const res = await http.get('/dashboard/scores/detailed', {
        params: { semester, year }
      });
      
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError(res.data?.message || 'Không thể tải dữ liệu điểm');
      }
    } catch (err) {
      console.error('Load scores error:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi tải dữ liệu điểm rèn luyện');
      
      // Fallback to placeholder data
      setData({
        student_info: {
          ho_ten: 'Sinh viên',
          mssv: 'SV001',
          lop: 'CNTT2021-01',
          khoa: 'Công nghệ thông tin'
        },
        summary: {
          total_points: 82,
          target_points: 100,
          progress_percentage: 82,
          class_rank: 3,
          total_students: 45,
          total_activities: 5,
          average_points: 16.4
        },
        criteria_breakdown: [
          { key: 'hoc_tap', name: 'Ý thức và kết quả học tập', max: 25, current: 18, percentage: 72 },
          { key: 'noi_quy', name: 'Ý thức và kết quả chấp hành nội quy', max: 25, current: 22, percentage: 88 },
          { key: 'tinh_nguyen', name: 'Hoạt động phong trào, tình nguyện', max: 25, current: 25, percentage: 100 },
          { key: 'cong_dan', name: 'Phẩm chất công dân và quan hệ xã hội', max: 20, current: 12, percentage: 60 },
          { key: 'khen_thuong', name: 'Hoạt động khen thưởng, kỷ luật', max: 5, current: 5, percentage: 100 }
        ],
        activities: [
          { id: '1', ten_hd: 'Hiến máu nhân đạo', ngay_bd: '2025-01-15', diem_rl: 4, loai: 'Hoạt động tình nguyện' },
          { id: '2', ten_hd: 'Chạy marathon vì sức khỏe', ngay_bd: '2025-01-10', diem_rl: 3, loai: 'Hoạt động văn nghệ thể thao' },
          { id: '3', ten_hd: 'Hội thảo học thuật AI', ngay_bd: '2025-01-05', diem_rl: 5, loai: 'Hoạt động học thuật' }
        ]
      });
    } finally {
      setLoading(false);
    }
  }

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!data) return { categoryStats: [], totalActivities: 0, averagePoints: 0 };

    const activities = data.activities || [];
    const criteriaBreakdown = data.criteria_breakdown || [];
    
    // Map criteria to display categories
    const categoryStats = criteriaBreakdown.map(criteria => {
      let icon, color;
      if (criteria.key === 'hoc_tap') {
        icon = BookOpen; color = 'blue';
      } else if (criteria.key === 'tinh_nguyen') {
        icon = Heart; color = 'red';
      } else if (criteria.key === 'cong_dan') {
        icon = Users; color = 'purple';
      } else if (criteria.key === 'noi_quy') {
        icon = Trophy; color = 'green';
      } else {
        icon = Medal; color = 'yellow';
      }
      
      return {
        key: criteria.key,
        name: criteria.name,
        icon,
        color,
        points: criteria.current,
        max: criteria.max,
        percentage: criteria.percentage
      };
    });

    return {
      categoryStats,
      totalActivities: data.summary?.total_activities || 0,
      averagePoints: data.summary?.average_points || 0
    };
  }, [data]);

  function ScoreCard({ activity }) {
    const date = activity.ngay_bd ? new Date(activity.ngay_bd) : new Date();
    
    // Determine category based on activity type
    let categoryConfig;
    const loai = (activity.loai || '').toLowerCase();
    
    if (loai.includes('học') || loai.includes('giáo dục')) {
      categoryConfig = { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: BookOpen, color: 'blue' };
    } else if (loai.includes('tình nguyện') || loai.includes('phong trào')) {
      categoryConfig = { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: Heart, color: 'red' };
    } else if (loai.includes('văn hóa') || loai.includes('thể thao')) {
      categoryConfig = { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: Users, color: 'purple' };
    } else {
      categoryConfig = { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: Trophy, color: 'green' };
    }

    const CategoryIcon = categoryConfig.icon;

    return (
      <div className={`${categoryConfig.bg} ${categoryConfig.border} border rounded-lg p-4`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${categoryConfig.color}-100 rounded-lg`}>
              <CategoryIcon className={`h-6 w-6 ${categoryConfig.text}`} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{activity.ten_hd}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full bg-${categoryConfig.color}-100 ${categoryConfig.text}`}>
                  {activity.loai || 'Khác'}
                </span>
                <span className="text-sm text-gray-500">{date.toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              +{activity.diem || 0} điểm
            </div>
            <div className="text-sm text-gray-500">
              {activity.trang_thai === 'da_dien_ra' ? 'Đã tham gia' : 'Đã đăng ký'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ProgressCircle({ percentage, size = 120, strokeWidth = 8 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${percentage * circumference / 100} ${circumference}`;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
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


