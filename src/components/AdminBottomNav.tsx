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
    <div style={{ position: 'fixed', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 100, pointerEvents: 'none' }}>
      <nav className="floating-dock" style={{ display: 'flex', padding: '12px 24px', gap: 32, pointerEvents: 'auto' }}>
        {items.map(item => {
          const active = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                opacity: active ? 1 : 0.5,
                transform: active ? 'scale(1.1)' : 'scale(1)',
                transition: 'all var(--transition-spring)'
              }}
            >
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--nas-bordeaux)' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
