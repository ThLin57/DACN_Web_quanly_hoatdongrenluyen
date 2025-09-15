import { Link } from 'react-router-dom';
import React from 'react';
import { http } from '../services/http';

export default function Header() {
	const [profile, setProfile] = React.useState(null);
	const [open, setOpen] = React.useState(false);

	React.useEffect(function loadProfile(){
		let mounted = true;
		http.get('/auth/profile')
			.then(function(res){ if(!mounted) return; setProfile(res.data?.data || null); })
			.catch(function(){ setProfile(null); });
		return function(){ mounted = false; };
	}, []);

	function signOut(){
		try { window.localStorage.removeItem('token'); } catch(_){}
		window.location.href = '/login';
	}

	const userAvatar = profile ? (profile.name || profile.email || profile.maso || 'U').slice(0,1).toUpperCase() : null;

	return React.createElement(
		'header',
		{ className: 'bg-white border-b' },
		React.createElement(
			'div',
			{ className: 'max-w-6xl mx-auto px-4 py-3 flex items-center justify-between' },
			[
				React.createElement(
					Link,
					{ key: 'home-link', to: '/', className: 'text-lg font-bold' },
					'App'
				),
				profile ? React.createElement(
					'div',
					{ key: 'user', className: 'flex items-center gap-4 relative' },
					[
						React.createElement('button', { key: 'notif', type: 'button', className: 'p-2 rounded-full hover:bg-gray-100' }, 
							React.createElement('span', { className: 'sr-only' }, 'Notifications')
						),
						React.createElement('div', { key: 'divider', className: 'w-px h-6 bg-gray-200' }),
						React.createElement(
							'button',
							{ key: 'menu', type: 'button', onClick: function onClick(){ setOpen(!open); }, className: 'flex items-center gap-3' },
							[
								React.createElement('div', { key: 'name', className: 'text-right hidden sm:block' }, [
									React.createElement('div', { key: 'n', className: 'text-sm font-semibold text-gray-900' }, profile?.name || 'Người dùng'),
									React.createElement('div', { key: 'e', className: 'text-xs text-gray-500' }, profile?.email || '')
								]),
								React.createElement('div', { key: 'avatar', className: 'w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-700' }, userAvatar)
							]
						),
						open ? React.createElement(
							'div',
							{ key: 'dropdown', className: 'absolute right-0 top-12 w-72 bg-white shadow-lg rounded-xl border p-3' },
							[
								React.createElement('div', { key: 'head', className: 'px-3 py-2' }, [
									React.createElement('div', { key: 'n', className: 'text-sm font-semibold text-gray-900' }, profile?.name || 'Người dùng'),
									React.createElement('div', { key: 'm', className: 'text-xs text-gray-500' }, profile?.email || '')
								]),
								React.createElement('div', { key: 'items', className: 'py-2' }, [
									React.createElement(Link, { key: 'profile', to: '/profile', className: 'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700' }, 'Thông tin cá nhân'),
									React.createElement('a', { key: 'settings', href: '#/settings', className: 'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700' }, 'Cài đặt tài khoản'),
									React.createElement('a', { key: 'support', href: '#/support', className: 'flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700' }, 'Hỗ trợ'),
								]),
								React.createElement('div', { key: 'divider2', className: 'h-px bg-gray-200 my-2' }),
								React.createElement('button', { key: 'logout', type: 'button', onClick: signOut, className: 'w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700' }, 'Sign out')
							]
						) : null
					]
				) : React.createElement(
					'nav',
					{ key: 'nav', className: 'flex items-center gap-4 text-sm text-gray-600' },
					[
						React.createElement(Link, { key: 'home', to: '/' }, 'Home'),
						React.createElement(Link, { key: 'login', to: '/login' }, 'Login'),
						React.createElement(Link, { key: 'register', to: '/register' }, 'Register'),
					]
				)
			]
		)
	);
}


