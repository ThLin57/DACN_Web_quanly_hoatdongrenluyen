import React from 'react';

export default function DashboardStudent(){
  const [summary, setSummary] = React.useState({ totalPoints: 0, progress: 0 });
  const [upcoming, setUpcoming] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(function load(){
    let mounted = true;
    // Temporary placeholder data to avoid 404 until endpoints are ready
    const placeholderUpcoming = [
      { id: 'u1', ten_hd: 'Tình nguyện cuối tuần', ngay_bd: '2025-09-20 08:00' },
      { id: 'u2', ten_hd: 'Giải bóng đá khoa', ngay_bd: '2025-09-22 16:00' },
      { id: 'u3', ten_hd: 'Talkshow kỹ năng mềm', ngay_bd: '2025-09-25 19:00' }
    ];
    const placeholderNotifications = [
      { id: 'n1', title: 'Cập nhật lịch hoạt động tuần này' },
      { id: 'n2', title: 'Nhắc nhở nộp minh chứng điểm RL' }
    ];
    Promise.resolve().then(function(){
      if(!mounted) return;
      setSummary({ totalPoints: 75, progress: 0.6 });
      setUpcoming(placeholderUpcoming);
      setNotifications(placeholderNotifications);
    });
    return function(){ mounted = false; };
  }, []);

  function card(title, children){
    return React.createElement('div', { className: 'bg-white rounded-xl border p-5' }, [
      React.createElement('div', { key: 't', className: 'text-sm font-semibold text-gray-600 mb-3' }, title),
      React.createElement('div', { key: 'c' }, children)
    ]);
  }

  const progressBar = React.createElement('div', { className: 'w-full bg-gray-100 rounded-md h-2 overflow-hidden' },
    React.createElement('div', { className: 'h-2 bg-blue-600', style: { width: Math.round((summary.progress || 0)*100) + '%' } })
  );

  return React.createElement('div', { className: 'space-y-6' }, [
    React.createElement('div', { key: 'cards', className: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, [
      card('Tổng điểm rèn luyện học kỳ này', React.createElement('div', { className: 'text-2xl font-bold' }, String(summary.totalPoints))),
      card('Tiến độ hoàn thành tiêu chí', progressBar),
      card('Tóm tắt', React.createElement('div', null, 'Chào mừng bạn trở lại!'))
    ]),
    React.createElement('div', { key: 'lists', className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
      card('Hoạt động sắp diễn ra', React.createElement('ul', { className: 'divide-y' },
        (upcoming.length ? upcoming : []).map(function(a, idx){
          return React.createElement('li', { key: String(a.id || idx), className: 'py-2 flex items-center justify-between' }, [
            React.createElement('div', { key: 'n', className: 'font-medium' }, a.ten_hd || a.name || 'Hoạt động'),
            React.createElement('div', { key: 't', className: 'text-sm text-gray-500' }, a.ngay_bd || a.time || '')
          ]);
        })
      )),
      card('Thông báo mới', React.createElement('ul', { className: 'divide-y' },
        (notifications.length ? notifications : []).map(function(n, idx){
          return React.createElement('li', { key: String(n.id || idx), className: 'py-2' }, n.title || n.tieu_de || 'Thông báo');
        })
      ))
    ])
  ]);
}


