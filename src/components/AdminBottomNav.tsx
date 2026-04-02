import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { label: 'Ana Sayfa', icon: '🏠', path: '/admin' },
    { label: 'Siparişler', icon: '📦', path: '/admin/siparisler' },
    { label: 'Yönetim', icon: '⚙️', path: '/admin/yonetim' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(item => {
        const active = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
        return (
          <button
            key={item.path}
            className={`bottom-nav__item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="bottom-nav__icon">{item.icon}</span>
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
