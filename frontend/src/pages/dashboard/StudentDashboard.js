// Integrated from attached design: Dashboard/DashboardStudent.js
import React from 'react';
import { Calendar, Award, TrendingUp, Clock, MapPin, ChevronRight, Target, Activity as ActivityIcon, BookOpen } from 'lucide-react';
import { http } from '../../services/http';

export default function StudentDashboard(){
  const [summary, setSummary] = React.useState({ totalPoints: 0, progress: 0, targetPoints: 100, activitiesJoined: 0 });
  const [upcoming, setUpcoming] = React.useState([]);
  const [recentActivities, setRecentActivities] = React.useState([]);
  const [ranking, setRanking] = React.useState({ ranking: [], currentUserRank: null });
  const [detail, setDetail] = React.useState(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [regStatus, setRegStatus] = React.useState({ status: null, loading: false });
  const [regMessage, setRegMessage] = React.useState(null);
  const [regError, setRegError] = React.useState(null);
  const [regReason, setRegReason] = React.useState('');

  React.useEffect(function load(){
    let mounted = true;

    async function fetchData(){
      try {
        // 1) Fetch points summary
        const ptsRes = await http.get('/auth/points');
        const pts = ptsRes.data?.data || {};
        // 2) Fetch class ranking
        const rankRes = await http.get('/auth/class-ranking');
        const rankData = rankRes.data?.data || { ranking: [], currentUserRank: null };
        // 3) Fetch activities from DB (backend already filters by same-class monitor for students)
        const actRes = await http.get('/activities');
        const actData = Array.isArray(actRes.data?.data) ? actRes.data.data : [];

        // 3) Recent activities from the same points breakdown if available
        const recent = Array.isArray(pts.activityDetails) ? pts.activityDetails.slice(0, 5).map(a => ({
          id: a.id,
          ten_hd: a.name,
          ngay_tham_gia: new Date().toISOString(),
          diem_rl: a.points
        })) : [];

        if (!mounted) return;
        setSummary({
          totalPoints: Number(pts.total || 0),
          progress: Math.max(0, Math.min(1, Number(pts.total || 0) / 100)),
          targetPoints: 100,
          activitiesJoined: Number(pts.activitiesCount || 0)
        });
        setRanking(rankData);
        setRecentActivities(recent);
        setUpcoming(actData);
      } catch (e) {
        // Fallback UI stays minimal; do not throw
      }
    }

    fetchData();
    return function(){ mounted = false; };
  }, []);

  function statsCard(title, value, icon, color = 'blue', subtitle, trend) {
    const colorClasses = { blue: 'bg-blue-50 text-blue-700 border-blue-200', green: 'bg-green-50 text-green-700 border-green-200', purple: 'bg-purple-50 text-purple-700 border-purple-200', orange: 'bg-orange-50 text-orange-700 border-orange-200' };
    return React.createElement('div', { className: `rounded-xl border p-6 ${colorClasses[color]} hover:shadow-lg transition-all duration-200` }, [
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

  function openDetail(id){
    if (!id) return;
    setLoadingDetail(true);
    setDetailOpen(true);
    setDetail(null);
    setRegMessage(null);
    setRegError(null);
    http.get('/activities/' + id)
      .then(function(res){ setDetail(res.data?.data || null); })
      .catch(function(){ setDetail(null); })
      .finally(function(){ setLoadingDetail(false); });

    // fetch registration status
    setRegStatus({ status: null, loading: true });
    http.get('/activities/' + id + '/registration')
      .then(function(res){ setRegStatus({ status: res.data?.data?.status || null, loading: false }); })
      .catch(function(){ setRegStatus({ status: null, loading: false }); });
  }

  function registerForActivity(){
    if (!detail?.id || regStatus.loading) return;
    setRegMessage(null);
    setRegError(null);
    setRegStatus(function(prev){ return { status: prev.status, loading: true }; });
    http.post('/activities/' + detail.id + '/register', { reason: regReason || undefined })
      .then(function(res){
        var status = res.data?.data?.status || regStatus.status;
        var msg = res.data?.message || 'Đăng ký thành công';
        setRegStatus({ status: status, loading: false });
        setRegMessage(msg);
      })
      .catch(function(err){ 
        setRegStatus(function(prev){ return { status: prev.status, loading: false }; }); 
        setRegError(err?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.');
      });
  }

  function renderRegistrationChip(){
    var status = regStatus.status;
    if (!status) return null;
    var map = {
      'cho_duyet': { text: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-800' },
      'da_duyet': { text: 'Đã duyệt', cls: 'bg-green-100 text-green-700' },
      'tu_choi': { text: 'Từ chối', cls: 'bg-red-100 text-red-700' },
      'da_tham_gia': { text: 'Đã tham gia', cls: 'bg-blue-100 text-blue-700' }
    };
    var info = map[String(status)] || { text: String(status), cls: 'bg-gray-100 text-gray-700' };
    return React.createElement('span', { className: `px-3 py-1 rounded-md text-sm ${info.cls}` }, info.text);
  }

  function activityCard(activity) {
    const date = new Date(activity.ngay_bd);
    const dateStr = isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const timeStr = isNaN(date.getTime()) ? '' : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return React.createElement('div', { key: activity.id, className: 'border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white' }, [
      React.createElement('div', { key: 'header', className: 'flex justify-between items-start mb-3' }, [
        React.createElement('h3', { key: 'title', className: 'font-semibold text-gray-900 line-clamp-2' }, activity.ten_hd),
        React.createElement('span', { key: 'points', className: 'bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full' }, `+${activity.diem_rl} điểm`)
      ]),
      React.createElement('div', { key: 'details', className: 'space-y-2 text-sm text-gray-600' }, [
        React.createElement('div', { key: 'time', className: 'flex items-center' }, [React.createElement(Clock, { key: 'icon', className: 'h-4 w-4 mr-2' }), React.createElement('span', { key: 'text' }, dateStr && timeStr ? `${dateStr} • ${timeStr}` : '—')]),
        React.createElement('div', { key: 'location', className: 'flex items-center' }, [React.createElement(MapPin, { key: 'icon', className: 'h-4 w-4 mr-2' }), React.createElement('span', { key: 'text' }, activity.dia_diem || '—')])
      ]),
      React.createElement('div', { key: 'footer', className: 'mt-3 pt-3 border-t flex justify-between items-center' }, [
        React.createElement('span', { key: 'status', className: 'text-xs text-blue-600 font-medium' }, 'Sắp diễn ra'),
        React.createElement('button', { key: 'detail', type: 'button', onClick: function(){ openDetail(activity.id); }, className: 'inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium' }, [
          'Xem chi tiết',
          React.createElement(ChevronRight, { key: 'arrow', className: 'h-4 w-4 ml-1 text-current' })
        ])
      ])
    ]);
  }

  const progressPercent = Math.round((summary.progress || 0) * 100);
  const progressCircle = React.createElement('div', { className: 'relative w-32 h-32' }, [
    React.createElement('svg', { key: 'svg', className: 'w-32 h-32 transform -rotate-90' }, [
      React.createElement('circle', { key: 'bg', cx: '64', cy: '64', r: '56', stroke: 'currentColor', strokeWidth: '8', fill: 'transparent', className: 'text-gray-200' }),
      React.createElement('circle', { key: 'progress', cx: '64', cy: '64', r: '56', stroke: 'currentColor', strokeWidth: '8', fill: 'transparent', strokeDasharray: Math.PI * 2 * 56, strokeDashoffset: Math.PI * 2 * 56 * (1 - (summary.progress || 0)), className: 'text-blue-600', strokeLinecap: 'round' })
    ]),
    React.createElement('div', { key: 'text', className: 'absolute inset-0 flex items-center justify-center' }, [
      React.createElement('div', { key: 'content', className: 'text-center' }, [
        React.createElement('div', { key: 'percent', className: 'text-2xl font-bold text-gray-900' }, `${progressPercent}%`),
        React.createElement('div', { key: 'label', className: 'text-xs text-gray-500' }, 'Hoàn thành')
      ])
    ])
  ]);

  // Ranking card
  const rankingCard = React.createElement('div', { className: 'bg-white rounded-xl border p-6' }, [
    React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900 mb-6' }, 'Xếp hạng trong lớp'),
    Array.isArray(ranking.ranking) && ranking.ranking.length > 0 ?
      React.createElement('div', { key: 'list', className: 'space-y-3' }, ranking.ranking.slice(0, 10).map((r, idx) => {
        const baseRow = 'flex items-center justify-between p-3 border rounded-lg';
        const stylesByRank = [
          // Top 1 - gold
          'bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-200 shadow-sm',
          // Top 2 - silver
          'bg-gradient-to-r from-gray-50 to-slate-50 border-slate-200',
          // Top 3 - bronze
          'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
        ];
        const rankClass = idx < 3 ? stylesByRank[idx] : 'bg-white';
        const rankBadgeBase = 'w-8 h-8 rounded-full flex items-center justify-center font-semibold';
        const badgeByRank = [
          'bg-yellow-400 text-white',
          'bg-gray-300 text-gray-800',
          'bg-orange-400 text-white'
        ];
        const badgeClass = idx < 3 ? badgeByRank[idx] : 'bg-gray-100 text-gray-900';
        const medal = idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
        return (
          React.createElement('div', { key: r.userId || idx, className: `${baseRow} ${rankClass}` }, [
            React.createElement('div', { key: 'l', className: 'flex items-center gap-3' }, [
              React.createElement('div', { key: 'rank', className: `${rankBadgeBase} ${badgeClass}` }, medal ? medal : (idx + 1)),
              React.createElement('div', { key: 'info' }, [
                React.createElement('div', { key: 'name', className: 'font-medium text-gray-900' }, r.name || r.mssv || '—'),
                React.createElement('div', { key: 'm', className: 'text-xs text-gray-500' }, r.mssv || '')
              ])
            ]),
            React.createElement('div', { key: 'pts', className: 'text-sm font-semibold text-blue-600' }, `${r.total || 0} điểm`)
          ])
        );
      })) :
      React.createElement('div', { key: 'empty', className: 'text-center py-8 text-gray-500' }, 'Chưa có dữ liệu xếp hạng')
  ]);

  return React.createElement('div', { className: 'space-y-6' }, [
    React.createElement('div', { key: 'welcome', className: 'bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white' }, [
      React.createElement('h1', { key: 'title', className: 'text-2xl font-bold mb-2' }, 'Chào mừng trở lại! 👋'),
      React.createElement('p', { key: 'subtitle', className: 'text-blue-100' }, 'Hãy cùng tham gia các hoạt động để tích lũy điểm rèn luyện nhé!')
    ]),
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' }, [
      statsCard('Điểm rèn luyện', `${summary.totalPoints}/${summary.targetPoints}`, React.createElement(Award, { className: 'h-6 w-6' }), 'green', 'Học kỳ này'),
      statsCard('Hoạt động tham gia', summary.activitiesJoined, React.createElement(ActivityIcon, { className: 'h-6 w-6' }), 'blue', 'Tổng cộng'),
      statsCard('Tiến độ hoàn thành', `${progressPercent}%`, React.createElement(Target, { className: 'h-6 w-6' }), 'purple', 'Mục tiêu học kỳ'),
      statsCard('Xếp hạng lớp', ranking.currentUserRank ? String(ranking.currentUserRank) : '—', React.createElement(TrendingUp, { className: 'h-6 w-6' }), 'orange', 'Vị trí hiện tại')
    ]),
    React.createElement('div', { key: 'progress-section', className: 'bg-white rounded-xl border p-6' }, [
      React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900 mb-6' }, 'Tiến độ điểm rèn luyện'),
      React.createElement('div', { key: 'content', className: 'flex items-center justify-between' }, [
        React.createElement('div', { key: 'info', className: 'space-y-4' }, [
          React.createElement('div', { key: 'current' }, [React.createElement('p', { className: 'text-sm text-gray-600' }, 'Điểm hiện tại'), React.createElement('p', { className: 'text-2xl font-bold text-blue-600' }, `${summary.totalPoints} điểm`)]),
          React.createElement('div', { key: 'target' }, [React.createElement('p', { className: 'text-sm text-gray-600' }, 'Mục tiêu học kỳ'), React.createElement('p', { className: 'text-lg font-semibold text-gray-900' }, `${summary.targetPoints} điểm`)]),
          React.createElement('div', { key: 'remaining' }, [React.createElement('p', { className: 'text-sm text-gray-600' }, 'Còn cần'), React.createElement('p', { className: 'text-lg font-semibold text-orange-600' }, `${Math.max(0, summary.targetPoints - summary.totalPoints)} điểm`)])
        ]),
        React.createElement('div', { key: 'circle', className: 'flex-shrink-0' }, progressCircle)
      ])
    ]),
    React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' }, [
      React.createElement('div', { key: 'upcoming', className: 'bg-white rounded-xl border p-6' }, [
        React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-6' }, [
          React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900' }, 'Hoạt động sắp diễn ra'),
          React.createElement('button', { key: 'view-all', className: 'text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center', onClick: () => window.location.href = '/activities' }, ['Xem tất cả', React.createElement(ChevronRight, { key: 'arrow', className: 'h-4 w-4 ml-1' })])
        ]),
        React.createElement('div', { key: 'content', className: 'space-y-4' }, upcoming.length > 0 ? upcoming.map(activityCard) : [
          React.createElement('div', { key: 'empty', className: 'text-center py-8 text-gray-500' }, [React.createElement(Calendar, { key: 'icon', className: 'h-12 w-12 mx-auto mb-4 text-gray-300' }), React.createElement('p', { key: 'text' }, 'Chưa có hoạt động nào sắp diễn ra')])
        ])
      ]),
      rankingCard
    ]),
    React.createElement('div', { key: 'recent', className: 'bg-white rounded-xl border p-6' }, [
      React.createElement('h2', { key: 'title', className: 'text-lg font-semibold text-gray-900 mb-6' }, 'Hoạt động gần đây'),
      React.createElement('div', { key: 'content', className: 'space-y-4' }, recentActivities.length > 0 ? recentActivities.map(activity => React.createElement('div', { key: activity.id, className: 'flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50' }, [
        React.createElement('div', { key: 'info', className: 'flex items-center' }, [React.createElement('div', { key: 'icon', className: 'h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-4' }, React.createElement(BookOpen, { className: 'h-5 w-5 text-green-600' })), React.createElement('div', { key: 'details' }, [React.createElement('h3', { key: 'name', className: 'font-medium text-gray-900' }, activity.ten_hd), React.createElement('p', { key: 'date', className: 'text-sm text-gray-500' }, new Date(activity.ngay_tham_gia).toLocaleDateString('vi-VN'))])]),
        React.createElement('div', { key: 'points', className: 'text-right' }, [React.createElement('span', { key: 'value', className: 'bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full' }, `+${activity.diem_rl} điểm`), React.createElement('p', { key: 'status', className: 'text-xs text-gray-500 mt-1' }, 'Hoàn thành')])
      ])) : [React.createElement('div', { key: 'empty', className: 'text-center py-8 text-gray-500' }, [React.createElement(ActivityIcon, { key: 'icon', className: 'h-12 w-12 mx-auto mb-4 text-gray-300' }), React.createElement('p', { key: 'text' }, 'Chưa có hoạt động nào')])])
    ]),

    // Detail Drawer/Modal
    detailOpen ? React.createElement('div', { key: 'drawer', className: 'fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center' }, [
      React.createElement('div', { key: 'backdrop', className: 'fixed inset-0 bg-black/30', onClick: function(){ setDetailOpen(false); } }),
      React.createElement('div', { key: 'panel', className: 'relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-lg p-0 mx-auto overflow-hidden' }, [
        // Header
        React.createElement('div', { key: 'hero', className: 'bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 text-white' }, [
          React.createElement('div', { key: 'heroRow', className: 'flex items-start justify-between' }, [
            React.createElement('div', { key: 'heroText' }, [
              React.createElement('h3', { key: 'h', className: 'text-lg font-semibold' }, 'Chi tiết hoạt động'),
              detail ? React.createElement('p', { key: 'p', className: 'text-blue-100 text-sm mt-1 line-clamp-1' }, detail.ten_hd || '—') : null
            ]),
            React.createElement('button', { key: 'x', type: 'button', onClick: function(){ setDetailOpen(false); }, className: 'text-white/80 hover:text-white text-sm' }, 'Đóng')
          ])
        ]),
        // Body
        React.createElement('div', { key: 'bodyWrap', className: 'p-6' }, [
        React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-4' }, [
          React.createElement('div', { key: 'left', className: 'flex items-center gap-2' }, [
            React.createElement('span', { key: 'badge', className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800' }, detail?.loai || 'Hoạt động')
          ]),
          React.createElement('div', { key: 'right', className: 'flex items-center gap-2' }, [
            regStatus.loading ? React.createElement('button', { key: 'loading', type: 'button', className: 'px-4 py-2 rounded-md bg-blue-400 text-white cursor-wait' }, 'Đang xử lý...') : (
              regStatus.status ? React.createElement(React.Fragment, { key: 'status' }, renderRegistrationChip()) :
              React.createElement('button', { key: 'reg', type: 'button', onClick: registerForActivity, disabled: (function(){
                if (!detail) return false;
                var now = new Date();
                var deadline = detail.han_dk ? new Date(detail.han_dk) : null;
                var open = (detail.trang_thai === 'da_duyet' || detail.trang_thai === 'cho_duyet');
                var notExpired = !deadline || now <= deadline;
                return !(open && notExpired);
              })(), className: 'px-4 py-2 rounded-md text-white text-sm font-medium ' + ((function(){
                if (!detail) return 'bg-blue-600 hover:bg-blue-700';
                var now = new Date();
                var deadline = detail.han_dk ? new Date(detail.han_dk) : null;
                var open = (detail.trang_thai === 'da_duyet' || detail.trang_thai === 'cho_duyet');
                var notExpired = !deadline || now <= deadline;
                return (open && notExpired) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed';
              })()) }, 'Đăng ký hoạt động')
            )
          ])
        ]),
        // Reason input (only when can register and not yet registered)
        (!regStatus.status) ? React.createElement('div', { key: 'reason', className: 'mb-3' }, [
          React.createElement('label', { key: 'l', className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Lý do đăng ký (tuỳ chọn)'),
          React.createElement('textarea', { key: 't', value: regReason, onChange: function(e){ setRegReason(e.target.value || ''); }, rows: 3, className: 'w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500', placeholder: 'Nhập lý do tham gia hoạt động...' })
        ]) : null,
        regMessage ? React.createElement('div', { key: 'msg', className: 'mb-3 rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm' }, regMessage) : null,
        regError ? React.createElement('div', { key: 'err', className: 'mb-3 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm' }, regError) : null,
        loadingDetail ? React.createElement('div', { key: 'loading', className: 'py-12 text-center text-gray-500' }, 'Đang tải...') :
        (detail ? React.createElement('div', { key: 'body', className: 'space-y-3 text-sm' }, [
          React.createElement('div', { key: 'name', className: 'text-base font-semibold text-gray-900' }, detail.ten_hd || '—'),
          React.createElement('div', { key: 'desc', className: 'text-gray-700 whitespace-pre-line' }, detail.mo_ta || 'Không có mô tả'),
          React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' }, [
            React.createElement('div', { key: 'diem' }, [React.createElement('div', { className: 'text-gray-500' }, 'Điểm rèn luyện'), React.createElement('div', { className: 'font-medium' }, String(detail.diem_rl || 0))]),
            React.createElement('div', { key: 'loai' }, [React.createElement('div', { className: 'text-gray-500' }, 'Loại hoạt động'), React.createElement('div', { className: 'font-medium' }, detail.loai || '—')]),
            React.createElement('div', { key: 'time' }, [React.createElement('div', { className: 'text-gray-500' }, 'Thời gian'), React.createElement('div', { className: 'font-medium' }, (detail.ngay_bd ? new Date(detail.ngay_bd).toLocaleString('vi-VN') : '—') + (detail.ngay_kt ? ' - ' + new Date(detail.ngay_kt).toLocaleString('vi-VN') : ''))]),
            React.createElement('div', { key: 'place' }, [React.createElement('div', { className: 'text-gray-500' }, 'Địa điểm'), React.createElement('div', { className: 'font-medium' }, detail.dia_diem || '—')])
          ]),
          React.createElement('div', { key: 'creator' }, [
            React.createElement('div', { className: 'text-gray-500' }, 'Người tạo'),
            React.createElement('div', { className: 'font-medium' }, (detail.nguoi_tao?.name || '—') + (detail.nguoi_tao?.email ? ' • ' + detail.nguoi_tao.email : ''))
          ])
        ]) : React.createElement('div', { key: 'empty', className: 'py-12 text-center text-gray-500' }, 'Không tìm thấy chi tiết hoạt động'))
        ])
      ])
    ]) : null
  ]);
}


