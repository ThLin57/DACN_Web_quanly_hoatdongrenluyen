import React from 'react';
import { Calendar, Award, TrendingUp, Bell, Clock, MapPin, Users, ChevronRight, Star, BookOpen, Target, Activity, BarChart3, Medal, Trophy } from 'lucide-react';
import http from '../../services/http';

export default function DashboardStudent(){
  const [summary, setSummary] = React.useState({ totalPoints: 0, progress: 0, targetPoints: 100, activitiesJoined: 0 });
  const [upcoming, setUpcoming] = React.useState([]);
  const [recentActivities, setRecentActivities] = React.useState([]);
  const [criteriaProgress, setCriteriaProgress] = React.useState([]);
  const [classComparison, setClassComparison] = React.useState({});
  const [myActivities, setMyActivities] = React.useState([]);
  const [userProfile, setUserProfile] = React.useState(null);

  React.useEffect(function load(){
    let mounted = true;
    
    // Load real data from API
    async function loadDashboardData() {
      try {
        console.log('🔄 Loading dashboard data from API...');
        
        const response = await http.get('/dashboard/student');
        console.log('✅ Dashboard API Response:', response.data);
        
        if(!mounted) return;
        
        const apiData = response.data.data;
        
        // Set real data from API - map correct field names
        if (apiData.tong_quan) {
          console.log('📊 Setting summary data from tong_quan:', apiData.tong_quan);
          setSummary({
            totalPoints: apiData.tong_quan.tong_diem || 0,
            progress: apiData.tong_quan.ti_le_hoan_thanh || 0,
            targetPoints: 100,
            activitiesJoined: apiData.tong_quan.tong_hoat_dong || 0
          });
        }
        
        if (apiData.hoat_dong_sap_toi) {
          console.log('📅 Setting upcoming activities:', apiData.hoat_dong_sap_toi);
          setUpcoming(apiData.hoat_dong_sap_toi);
        }
        
        if (apiData.hoat_dong_gan_day) {
          console.log('🎯 Setting recent activities:', apiData.hoat_dong_gan_day);
          setRecentActivities(apiData.hoat_dong_gan_day);
        }

        // Load "My Activities" from real API
        try {
          const myRes = await http.get('/dashboard/activities/me');
          const myData = myRes.data?.success && Array.isArray(myRes.data.data)
            ? myRes.data.data
            : Array.isArray(myRes.data)
              ? myRes.data
              : [];
          setMyActivities(myData);
        } catch (e) {
          console.warn('Cannot load my activities:', e?.message || e);
          setMyActivities([]);
        }

        // Load user profile for personalized welcome message
        try {
          let profileRes;
          try {
            profileRes = await http.get('/users/profile');
          } catch (_) {
            profileRes = await http.get('/auth/profile');
          }
          const profileData = profileRes.data?.data || profileRes.data || {};
          setUserProfile(profileData);
        } catch (e) {
          console.warn('Cannot load user profile:', e?.message || e);
          setUserProfile(null);
        }

        // Bỏ tải dữ liệu xếp hạng để ẩn khỏi trang sinh viên
        
        // Use real criteria progress from API or fallback to calculated values
        const totalPoints = apiData.tong_quan?.tong_diem || 0;
        const criteriaProgress = apiData.tien_do_tieu_chi || [
          {
            id: 1,
            ten_tieu_chi: 'Ý thức và kết quả học tập',
            diem_hien_tai: totalPoints ? Math.floor(totalPoints * 0.4) : 4,
            diem_toi_da: 25,
            mau_sac: '#3B82F6',
            icon: '📚'
          },
          {
            id: 2,
            ten_tieu_chi: 'Ý thức và kết quả chấp hành nội quy',
            diem_hien_tai: totalPoints ? Math.floor(totalPoints * 0.3) : 3,
            diem_toi_da: 25,
            mau_sac: '#10B981',
            icon: '⚖️'
          },
          {
            id: 3,
            ten_tieu_chi: 'Hoạt động phong trào, tình nguyện',
            diem_hien_tai: totalPoints || 0,
            diem_toi_da: 25,
            mau_sac: '#F59E0B',
            icon: '🤝'
          },
          {
            id: 4,
            ten_tieu_chi: 'Phẩm chất công dân và quan hệ xã hội',
            diem_hien_tai: totalPoints ? Math.floor(totalPoints * 0.2) : 2,
            diem_toi_da: 20,
            mau_sac: '#8B5CF6',
            icon: '🌟'
          },
          {
            id: 5,
            ten_tieu_chi: 'Hoạt động khen thưởng, kỷ luật',
            diem_hien_tai: totalPoints ? Math.floor(totalPoints * 0.1) : 1,
            diem_toi_da: 5,
            mau_sac: '#EF4444',
            icon: '🏆'
          }
        ];

        const classComparison = apiData.so_sanh_lop || {
          my_total: totalPoints,
          class_average: 8,
          department_average: 7,
          my_rank_in_class: 15,
          total_students_in_class: 35,
          my_rank_in_department: 120,
          total_students_in_department: 280,
          class_name: 'CNTT2021-01',
          department_name: 'Công nghệ thông tin'
        };
        
        setCriteriaProgress(criteriaProgress);
        // Ẩn hoàn toàn xếp hạng trên trang sinh viên (không dùng mock)
        setClassComparison(prev => (prev && prev.my_rank_in_class ? prev : {}));
        
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        
        if(!mounted) return;
        
        // Fallback data in case of API error
        setSummary({ 
          totalPoints: 0, 
          progress: 0, 
          targetPoints: 100,
          activitiesJoined: 0
        });
        setUpcoming([]);
        setRecentActivities([]);
        setCriteriaProgress([]);
        setClassComparison({});
      }
    }
    
    loadDashboardData();
    
    return function(){ mounted = false; };
  }, []);

  // Improved Stats Card Component
  function statsCard(title, value, icon, color = 'blue', subtitle, trend) {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200'
    };

    return React.createElement('div', { 
      className: `rounded-xl border p-6 ${colorClasses[color]} hover:shadow-lg transition-all duration-200` 
    }, [
      React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-4' }, [
        React.createElement('div', { key: 'icon', className: 'h-12 w-12 rounded-lg bg-white bg-opacity-50 flex items-center justify-center' }, icon),
        trend && React.createElement('div', { key: 'trend', className: 'text-sm font-medium text-green-600' }, trend)
      ]),
      React.createElement('div', { key: 'content' }, [
        React.createElement('p', { key: 'title', className: 'text-sm font-medium text-gray-600 mb-1' }, title),
        React.createElement('p', { key: 'value', className: 'text-3xl font-bold mb-1' }, value),
        subtitle && React.createElement('p', { key: 'subtitle', className: 'text-sm text-gray-500' }, subtitle)
      ])
    ]);
  }

  // Progress Circle Component
  const progressPercent = Math.round((summary.progress || 0) * 100);
  const progressCircle = React.createElement('div', { className: 'relative w-32 h-32' }, [
    React.createElement('svg', { key: 'svg', className: 'w-32 h-32 transform -rotate-90' }, [
      React.createElement('circle', { 
        key: 'bg',
        cx: '64', cy: '64', r: '56', 
        stroke: 'currentColor', 
        strokeWidth: '8',
        fill: 'transparent',
        className: 'text-gray-200'
      }),
      React.createElement('circle', { 
        key: 'progress',
        cx: '64', cy: '64', r: '56', 
        stroke: 'currentColor', 
        strokeWidth: '8',
        fill: 'transparent',
        strokeDasharray: Math.PI * 2 * 56,
        strokeDashoffset: Math.PI * 2 * 56 * (1 - (summary.progress || 0)),
        className: 'text-blue-600',
        strokeLinecap: 'round'
      })
    ]),
    React.createElement('div', { key: 'text', className: 'absolute inset-0 flex items-center justify-center' }, [
      React.createElement('div', { key: 'content', className: 'text-center' }, [
        React.createElement('div', { key: 'percent', className: 'text-2xl font-bold text-gray-900' }, `${progressPercent}%`),
        React.createElement('div', { key: 'label', className: 'text-xs text-gray-500' }, 'Hoàn thành')
      ])
    ])
  ]);

  // Criteria Progress Bar Component
  function criteriaProgressBar(criteria) {
    const percentage = Math.round((criteria.diem_hien_tai / criteria.diem_toi_da) * 100);
    
    return React.createElement('div', {
      key: criteria.id,
      className: 'bg-white rounded-lg border p-4 hover:shadow-md transition-shadow'
    }, [
      React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-3' }, [
        React.createElement('div', { key: 'title', className: 'flex items-center gap-2' }, [
          React.createElement('span', { key: 'icon', className: 'text-lg' }, criteria.icon),
          React.createElement('h3', { key: 'name', className: 'font-medium text-gray-900 text-sm' }, criteria.ten_tieu_chi)
        ]),
        React.createElement('span', { key: 'score', className: 'text-sm font-semibold text-gray-700' }, 
          `${criteria.diem_hien_tai}/${criteria.diem_toi_da}`)
      ]),
      React.createElement('div', { key: 'progress', className: 'mb-2' }, [
        React.createElement('div', { key: 'bg', className: 'w-full bg-gray-200 rounded-full h-2.5' }, [
          React.createElement('div', { 
            key: 'fill',
            className: 'h-2.5 rounded-full transition-all duration-300',
            style: { 
              width: `${percentage}%`,
              backgroundColor: criteria.mau_sac
            }
          })
        ])
      ]),
      React.createElement('div', { key: 'footer', className: 'flex justify-between items-center' }, [
        React.createElement('span', { key: 'percent', className: 'text-xs text-gray-500' }, `${percentage}%`),
        React.createElement('span', { 
          key: 'status',
          className: `text-xs px-2 py-1 rounded-full ${
            percentage >= 80 ? 'bg-green-100 text-green-800' :
            percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`
        }, percentage >= 80 ? 'Tốt' : percentage >= 60 ? 'Khá' : 'Cần cải thiện')
      ])
    ]);
  }

  // Class Comparison Component – đã loại bỏ để ẩn khỏi trang sinh viên
  function comparisonCard() { return null; }

  // My Activities Card Component
  function statusBadge(status) {
    const map = {
      cho_duyet: ['Chờ duyệt', 'bg-yellow-100 text-yellow-800'],
      da_duyet: ['Đã duyệt', 'bg-blue-100 text-blue-800'],
      da_tham_gia: ['Đã tham gia', 'bg-green-100 text-green-800'],
      tu_choi: ['Từ chối', 'bg-red-100 text-red-800']
    };
    const key = (status || '').toLowerCase();
    const [label, cls] = map[key] || [status || 'Không rõ', 'bg-gray-100 text-gray-800'];
    return React.createElement('span', { className: `text-xs font-medium px-2 py-1 rounded-full ${cls}` }, label);
  }

  function myActivitiesSection() {
    return React.createElement('div', { className: 'bg-white rounded-xl border p-6' }, [
      React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-4' }, [
        React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900' }, 'Hoạt động của tôi'),
        React.createElement('button', { key: 'view', className: 'text-blue-600 hover:text-blue-700 text-sm font-medium', onClick: function(){ window.location.href = '/my-activities'; } }, 'Xem tất cả')
      ]),
      React.createElement('div', { key: 'list', className: 'space-y-4' }, [
        ...(myActivities && myActivities.length > 0
          ? myActivities.slice(0, 5).map(function(item){
              const hd = item.hoat_dong || {};
              return React.createElement('div', { key: item.id, className: 'rounded-lg border p-4 bg-white hover:shadow-sm transition-shadow' }, [
                React.createElement('div', { key: 'row1', className: 'flex items-start justify-between mb-1' }, [
                  React.createElement('h3', { key: 'name', className: 'font-medium text-gray-900 line-clamp-2' }, hd.ten_hd || 'Hoạt động'),
                  statusBadge(item.trang_thai_dk)
                ]),
                React.createElement('div', { key: 'meta', className: 'text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1' }, [
                  React.createElement('span', { key: 'date', className: 'flex items-center' }, [
                    React.createElement(Clock, { key: 'i', className: 'h-4 w-4 mr-1' }),
                    (hd.ngay_bd ? new Date(hd.ngay_bd).toLocaleDateString('vi-VN') : '')
                  ]),
                  React.createElement('span', { key: 'loc', className: 'flex items-center' }, [
                    React.createElement(MapPin, { key: 'i', className: 'h-4 w-4 mr-1' }),
                    hd.dia_diem || '—'
                  ]),
                  React.createElement('span', { key: 'pts', className: 'bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full' }, `+${Number(hd.diem_rl || 0)} điểm`)
                ]),
                item.trang_thai_dk === 'tu_choi' && item.ly_do_tu_choi
                  ? React.createElement('div', { key: 'reason', className: 'mt-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded p-2' }, `Lý do từ chối: ${item.ly_do_tu_choi}`)
                  : null
              ]);
            })
          : [React.createElement('div', { key: 'empty', className: 'text-sm text-gray-500' }, 'Chưa có hoạt động nào')])
      ])
    ]);
  }

  return React.createElement('div', { className: 'space-y-6' }, [
    // Welcome Header
    React.createElement('div', { 
      key: 'welcome',
      className: 'bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white'
    }, [
      React.createElement('h1', { key: 'title', className: 'text-2xl font-bold mb-2' }, 
        `Xin chào ${userProfile?.ho_ten || userProfile?.name || 'bạn'}! 👋`),
      React.createElement('p', { key: 'subtitle', className: 'text-blue-100' }, 'Hãy cùng tham gia các hoạt động để tích lũy điểm rèn luyện nhé!')
    ]),

    // Stats Cards with Progress Circle
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' }, [
      statsCard(
        'Điểm rèn luyện',
        `${summary.totalPoints}/${summary.targetPoints}`,
        React.createElement(Award, { className: 'h-6 w-6' }),
        'green',
        'Học kỳ này',
        '+5 điểm'
      ),
      statsCard(
        'Hoạt động tham gia',
        summary.activitiesJoined,
        React.createElement(Calendar, { className: 'h-6 w-6' }),
        'blue',
        'Tổng cộng',
        '+2 hoạt động'
      ),
      statsCard(
        'Tiến độ hoàn thành',
        `${progressPercent}%`,
        React.createElement(Target, { className: 'h-6 w-6' }),
        'purple',
        'Mục tiêu học kỳ'
      ),
      // Progress Circle Card
      React.createElement('div', { 
        key: 'progress-circle',
        className: 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 flex flex-col items-center justify-center'
      }, [
        progressCircle,
        React.createElement('p', { key: 'label', className: 'text-sm text-gray-600 mt-2' }, 'Tiến độ tổng thể')
      ])
    ]),

    // Criteria Progress Bars
    React.createElement('div', { key: 'criteria-progress', className: 'space-y-4' }, [
      React.createElement('div', { key: 'header', className: 'flex items-center gap-2' }, [
        React.createElement(BarChart3, { key: 'icon', className: 'h-5 w-5 text-blue-600' }),
        React.createElement('h2', { key: 'title', className: 'text-xl font-semibold text-gray-900' }, 'Tiến độ theo tiêu chí'),
        React.createElement('span', { key: 'badge', className: 'bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full' }, 
          `${criteriaProgress.length} tiêu chí`)
      ]),
      React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' }, 
        criteriaProgress.map((criteria, index) => 
          React.createElement('div', { key: criteria.id || index }, criteriaProgressBar(criteria))
        )
      )
    ]),

    // Hành động nhanh (đã loại bỏ phần so sánh/xếp hạng)
    React.createElement('div', { key: 'quick-actions', className: 'bg-white rounded-lg border p-6' }, [
      React.createElement('div', { key: 'header', className: 'flex items-center gap-2 mb-4' }, [
        React.createElement(Star, { key: 'icon', className: 'h-5 w-5 text-yellow-500' }),
        React.createElement('h3', { key: 'title', className: 'font-semibold text-gray-900' }, 'Hành động nhanh')
      ]),
      React.createElement('div', { key: 'actions', className: 'space-y-3' }, [
        React.createElement('button', { 
          key: 'view-activities',
          className: 'w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors'
        }, [
          React.createElement('div', { key: 'content', className: 'flex items-center justify-between' }, [
            React.createElement('div', { key: 'info' }, [
              React.createElement('p', { key: 'title', className: 'font-medium text-gray-900' }, 'Xem hoạt động mới'),
              React.createElement('p', { key: 'desc', className: 'text-sm text-gray-500' }, 'Khám phá các hoạt động sắp diễn ra')
            ]),
            React.createElement(ChevronRight, { key: 'icon', className: 'h-5 w-5 text-gray-400' })
          ])
        ]),
        React.createElement('button', { 
          key: 'qr-scan',
          className: 'w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors'
        }, [
          React.createElement('div', { key: 'content', className: 'flex items-center justify-between' }, [
            React.createElement('div', { key: 'info' }, [
              React.createElement('p', { key: 'title', className: 'font-medium text-gray-900' }, 'Điểm danh QR'),
              React.createElement('p', { key: 'desc', className: 'text-sm text-gray-500' }, 'Quét mã QR để điểm danh hoạt động')
            ]),
            React.createElement(ChevronRight, { key: 'icon', className: 'h-5 w-5 text-gray-400' })
          ])
        ])
      ])
    ]),

    // Upcoming Activities
    React.createElement('div', { key: 'upcoming', className: 'bg-white rounded-xl border p-6' }, [
      React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-6' }, [
        React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900' }, 'Hoạt động sắp diễn ra'),
        React.createElement('button', { key: 'view-all', className: 'text-blue-600 hover:text-blue-700 text-sm font-medium' }, 'Xem tất cả')
      ]),
      React.createElement('div', { key: 'content', className: 'space-y-4' },
        upcoming.length > 0 
          ? upcoming.slice(0, 3).map(function(activity) {
              return React.createElement('div', {
                key: activity.id,
                className: 'border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white'
              }, [
                React.createElement('div', { key: 'header', className: 'flex justify-between items-start mb-3' }, [
                  React.createElement('h3', { key: 'title', className: 'font-semibold text-gray-900 line-clamp-2' }, activity.ten_hd),
                  React.createElement('span', { key: 'points', className: 'bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full' }, 
                    `+${activity.diem_rl} điểm`)
                ]),
                React.createElement('div', { key: 'details', className: 'space-y-2 text-sm text-gray-600' }, [
                  React.createElement('div', { key: 'time', className: 'flex items-center' }, [
                    React.createElement(Clock, { key: 'icon', className: 'h-4 w-4 mr-2' }),
                    React.createElement('span', { key: 'text' }, new Date(activity.ngay_bd).toLocaleDateString('vi-VN'))
                  ]),
                  React.createElement('div', { key: 'location', className: 'flex items-center' }, [
                    React.createElement(MapPin, { key: 'icon', className: 'h-4 w-4 mr-2' }),
                    React.createElement('span', { key: 'text' }, activity.dia_diem)
                  ])
                ])
              ]);
            })
          : [React.createElement('div', { 
              key: 'empty', 
              className: 'text-center py-8 text-gray-500' 
            }, [
              React.createElement(Calendar, { key: 'icon', className: 'h-12 w-12 mx-auto mb-4 text-gray-300' }),
              React.createElement('p', { key: 'text' }, 'Chưa có hoạt động sắp diễn ra')
            ])]
      )
    ]),

    // My Activities section under Upcoming
    myActivitiesSection()
  ]);
}