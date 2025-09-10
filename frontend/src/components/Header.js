import { Link } from 'react-router-dom';
import React from 'react';

export default function Header() {
	return React.createElement(
		'header',
		{ className: 'bg-white border-b' },
		React.createElement(
			'div',
			{ className: 'max-w-5xl mx-auto px-4 py-3 flex items-center justify-between' },
			[
				React.createElement(
					Link,
					{ key: 'home-link', to: '/', className: 'text-lg font-bold' },
					'App'
				),
				React.createElement(
					'nav',
					{ key: 'nav', className: 'flex items-center gap-4 text-sm text-gray-600' },
					[
						React.createElement(Link, { key: 'home', to: '/' }, 'Home'),
					]
				),
			]
		)
	);
}


