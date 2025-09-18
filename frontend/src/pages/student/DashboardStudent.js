import React from 'react';
import { Calendar, Award, TrendingUp, Bell, Clock, MapPin, Users, ChevronRight, Star, BookOpen, Target, Activity } from 'lucide-react';
import http from '../../services/http';

export default function DashboardStudent(){
  const [summary, setSummary] = React.useState({ totalPoints: 0, progress: 0, targetPoints: 100, activitiesJoined: 0 });
  const [upcoming, setUpcoming] = React.useState([]);
  const [recentActivities, setRecentActivities] = React.useState([]);

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
        
        // Set real data from API
        if (apiData.summary) {
          console.log('📊 Setting summary data:', apiData.summary);
          setSummary(apiData.summary);
        }
        
        if (apiData.upcomingActivities) {
          console.log('📅 Setting upcoming activities:', apiData.upcomingActivities);
          setUpcoming(apiData.upcomingActivities);
        }
        
        if (apiData.recentActivities) {
          console.log('🎯 Setting recent activities:', apiData.recentActivities);
          setRecentActivities(apiData.recentActivities);
        }
        
        // Notifications hiển thị ở Header, không dùng mock tại đây
        
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
  // No notifications here; header component handles real data
      }
    }
    
    loadDashboardData();
    
    return function(){ mounted = false; };
  }, []);

  // Debug function to manually test API
  async function debugApiCall() {
    try {
      console.log('🔄 MANUAL: Testing API call...');
      const response = await http.get('/dashboard/student');
      console.log('✅ MANUAL: Full Response:', response);
      console.log('📊 MANUAL: Response Data:', response.data);
      console.log('🎯 MANUAL: Summary Data:', response.data?.data?.summary);
      alert(`API Response: totalPoints = ${response.data?.data?.summary?.totalPoints || 'undefined'}`);
    } catch (error) {
      console.error('❌ MANUAL: API Error:', error);
      alert(`API Error: ${error.message}`);
    }
  }

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

  // Activity Card Component
  function activityCard(activity) {
    const date = new Date(activity.ngay_bd);
    const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

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
          React.createElement('span', { key: 'text' }, `${dateStr} • ${timeStr}`)
        ]),
        React.createElement('div', { key: 'location', className: 'flex items-center' }, [
          React.createElement(MapPin, { key: 'icon', className: 'h-4 w-4 mr-2' }),
          React.createElement('span', { key: 'text' }, activity.dia_diem)
        ])
      ]),
      React.createElement('div', { key: 'footer', className: 'mt-3 pt-3 border-t flex justify-between items-center' }, [
        React.createElement('span', { key: 'status', className: 'text-xs text-blue-600 font-medium' }, 'Sắp diễn ra'),
        React.createElement(ChevronRight, { key: 'arrow', className: 'h-4 w-4 text-gray-400' })
      ])
    ]);
  }

  // Notification Card Component
  function notificationCard(notification) {
    const typeColors = {
      info: 'border-l-blue-500 bg-blue-50',
      warning: 'border-l-yellow-500 bg-yellow-50', 
      success: 'border-l-green-500 bg-green-50'
    };

    const typeIcons = {
      info: React.createElement(Bell, { className: 'h-4 w-4 text-blue-500' }),
      warning: React.createElement(Clock, { className: 'h-4 w-4 text-yellow-500' }),
      success: React.createElement(Award, { className: 'h-4 w-4 text-green-500' })
    };

    return React.createElement('div', {
      key: notification.id,
      className: `border-l-4 p-4 ${typeColors[notification.type]} hover:shadow-sm transition-shadow`
    }, [
      React.createElement('div', { key: 'header', className: 'flex items-start justify-between mb-2' }, [
        React.createElement('div', { key: 'icon', className: 'mr-3 mt-0.5' }, typeIcons[notification.type]),
        React.createElement('div', { key: 'content', className: 'flex-1' }, [
          React.createElement('h4', { key: 'title', className: 'font-medium text-gray-900 mb-1' }, notification.title),
          React.createElement('p', { key: 'message', className: 'text-sm text-gray-600' }, notification.message)
        ]),
        React.createElement('span', { key: 'time', className: 'text-xs text-gray-500' }, notification.time)
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

  return React.createElement('div', { className: 'space-y-6' }, [
    // Welcome Header
    React.createElement('div', { 
      key: 'welcome',
      className: 'bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white'
    }, [
      React.createElement('h1', { key: 'title', className: 'text-2xl font-bold mb-2' }, 'Chào mừng trở lại! 👋'),
      React.createElement('p', { key: 'subtitle', className: 'text-blue-100' }, 'Hãy cùng tham gia các hoạt động để tích lũy điểm rèn luyện nhé!')
    ]),

    // Debug Button
    React.createElement('div', { key: 'debug', className: 'text-center' }, [
      React.createElement('button', {
        key: 'debugBtn',
        onClick: debugApiCall,
        className: 'bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium'
      }, '🐛 Test API Call (Debug)')
    ]),

    // Stats Cards
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' }, [
      statsCard(
        'Điểm rèn luyện',
        `${summary.totalPoints}/${summary.targetPoints}`,
        React.createElement(Award, { className: 'h-6 w-6' }),
        'green',
        'Học kỳ này',
        '+15 điểm'
      ),
      statsCard(
        'Hoạt động tham gia',
        summary.activitiesJoined,
        React.createElement(Activity, { className: 'h-6 w-6' }),
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
      statsCard(
        'Xếp hạng lớp',
        '12/45',
        React.createElement(TrendingUp, { className: 'h-6 w-6' }),
        'orange',
        'Top 27%',
        '↑3 bậc'
      )
    ]),

    // Progress Visualization 
    React.createElement('div', { key: 'progress-section', className: 'bg-white rounded-xl border p-6' }, [
      React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900 mb-6' }, 'Tiến độ điểm rèn luyện'),
      React.createElement('div', { key: 'content', className: 'flex items-center justify-between' }, [
        React.createElement('div', { key: 'info', className: 'space-y-4' }, [
          React.createElement('div', { key: 'current' }, [
            React.createElement('p', { className: 'text-sm text-gray-600' }, 'Điểm hiện tại'),
            React.createElement('p', { className: 'text-2xl font-bold text-blue-600' }, `${summary.totalPoints} điểm`)
          ]),
          React.createElement('div', { key: 'target' }, [
            React.createElement('p', { className: 'text-sm text-gray-600' }, 'Mục tiêu học kỳ'),
            React.createElement('p', { className: 'text-lg font-semibold text-gray-900' }, `${summary.targetPoints} điểm`)
          ]),
          React.createElement('div', { key: 'remaining' }, [
            React.createElement('p', { className: 'text-sm text-gray-600' }, 'Còn cần'),
            React.createElement('p', { className: 'text-lg font-semibold text-orange-600' }, `${summary.targetPoints - summary.totalPoints} điểm`)
          ])
        ]),
        React.createElement('div', { key: 'circle', className: 'flex-shrink-0' }, progressCircle)
      ])
    ]),

    // Main Content Grid
    React.createElement('div', { key: 'main-content', className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' }, [
      // Upcoming Activities (2/3 width)
      React.createElement('div', { key: 'upcoming', className: 'lg:col-span-2' }, [
        React.createElement('div', { className: 'bg-white rounded-xl border p-6' }, [
          React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-6' }, [
            React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900' }, 'Hoạt động sắp diễn ra'),
            React.createElement('button', { 
              key: 'view-all',
              className: 'text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center',
              onClick: () => window.location.href = '/activities'
            }, [
              'Xem tất cả',
              React.createElement(ChevronRight, { className: 'h-4 w-4 ml-1' })
            ])
          ]),
          React.createElement('div', { key: 'content', className: 'space-y-4' }, 
            upcoming.length > 0 
              ? upcoming.map(activityCard)
              : [React.createElement('div', { 
                  key: 'empty', 
                  className: 'text-center py-8 text-gray-500' 
                }, [
                  React.createElement(Calendar, { key: 'icon', className: 'h-12 w-12 mx-auto mb-4 text-gray-300' }),
                  React.createElement('p', { key: 'text' }, 'Chưa có hoạt động nào sắp diễn ra')
                ])]
          )
        ])
      ]),

      // Notifications removed - now in header
      null,
    ]),

    // Recent Activities
    React.createElement('div', { key: 'recent', className: 'bg-white rounded-xl border p-6' }, [
      React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900 mb-6' }, 'Hoạt động gần đây'),
      React.createElement('div', { key: 'content', className: 'space-y-4' }, 
        recentActivities.length > 0 
          ? recentActivities.map(activity => React.createElement('div', {
              key: activity.id,
              className: 'flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
            }, [
              React.createElement('div', { key: 'info', className: 'flex items-center' }, [
                React.createElement('div', { key: 'icon', className: 'h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-4' }, 
                  React.createElement(BookOpen, { className: 'h-5 w-5 text-green-600' })),
                React.createElement('div', { key: 'details' }, [
                  React.createElement('h3', { key: 'name', className: 'font-medium text-gray-900' }, activity.ten_hd),
                  React.createElement('p', { key: 'date', className: 'text-sm text-gray-500' }, 
                    new Date(activity.ngay_tham_gia).toLocaleDateString('vi-VN'))
                ])
              ]),
              React.createElement('div', { key: 'points', className: 'text-right' }, [
                React.createElement('span', { key: 'value', className: 'bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full' }, 
                  `+${activity.diem_rl} điểm`),
                React.createElement('p', { key: 'status', className: 'text-xs text-gray-500 mt-1' }, 'Hoàn thành')
              ])
            ]))
          : [React.createElement('div', { 
              key: 'empty', 
              className: 'text-center py-8 text-gray-500' 
            }, [
              React.createElement(Activity, { key: 'icon', className: 'h-12 w-12 mx-auto mb-4 text-gray-300' }),
              React.createElement('p', { key: 'text' }, 'Chưa có hoạt động nào')
            ])]
      )
    ])
  ]);
}


