import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import type { OrderStatus } from '../../types';
import { formatCurrency } from '../../data/seedData';
import { formatDateShort, daysUntil, STATUS_LABELS } from '../../utils/helpers';

const STATUS_ORDER: OrderStatus[] = ['onay', 'kapora', 'hazirlaniyor', 'hazir', 'teslim'];
const STATUS_ICONS: Record<OrderStatus, string> = {
  onay: '⏳',
  kapora: '💳',
  hazirlaniyor: '🔧',
  hazir: '✅',
  teslim: '🚀',
};
const STATUS_COLORS: Record<OrderStatus, string> = {
  onay: 'var(--gray-400)',
  kapora: 'var(--orange-500)',
  hazirlaniyor: 'var(--blue-500)',
  hazir: 'var(--green-500)',
  teslim: '#8B5CF6',
};

export default function AdminHome() {
  const { state } = useApp();
  const navigate = useNavigate();
  const orders = state.orders;

  const counts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const totalRevenue = orders.filter(o => o.status === 'teslim').reduce((s, o) => s + o.totalPrice, 0);
  const activeOrders = orders.filter(o => o.status !== 'teslim').length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi öğleden sonralar' : 'İyi akşamlar';

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      {/* Greeting */}
      <div style={{
        background: 'linear-gradient(135deg, var(--nas-bordeaux), var(--nas-bordeaux-2))',
        borderRadius: 'var(--radius-2xl)', padding: 'var(--space-xl)', marginBottom: 'var(--space-md)',
        boxShadow: 'var(--shadow-bordeaux)',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16 }}>
          {greeting}! 👋
        </h1>
        <button
          className="btn btn-white btn-sm"
          onClick={() => navigate('/siparis')}
        >
          + Yeni Sipariş Oluştur
        </button>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <div className="stat-card">
          <div className="stat-card__label">Toplam Sipariş</div>
          <div className="stat-card__value">{orders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Aktif Sipariş</div>
          <div className="stat-card__value" style={{ color: 'var(--orange-500)' }}>{activeOrders}</div>
        </div>
        <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
          <div className="stat-card__label">Toplam Ciro</div>
          <div className="stat-card__value" style={{ color: 'var(--nas-bordeaux)', fontSize: 22 }}>{formatCurrency(totalRevenue)}</div>
        </div>
      </div>

      {/* Status pills */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 8 }}>Sipariş Durumları</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {STATUS_ORDER.map(s => (
            <button
              key={s}
              onClick={() => navigate('/admin/siparisler')}
              style={{
                background: '#fff', border: '1.5px solid var(--gray-100)',
                borderRadius: 'var(--radius-lg)', padding: '10px 6px',
                cursor: 'pointer', textAlign: 'center', transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 2 }}>{STATUS_ICONS[s]}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: STATUS_COLORS[s] }}>{counts[s]}</div>
              <div style={{ fontSize: 9, color: 'var(--gray-500)', fontWeight: 600, lineHeight: 1.2 }}>{STATUS_LABELS[s]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick access */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 8 }}>Hızlı Erişim</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
          {[
            { icon: '📦', label: 'Siparişler', path: '/admin/siparisler' },
            { icon: '🛍️', label: 'Ürün Yönetimi', path: '/admin/yonetim/urunler' },
            { icon: '💰', label: 'Muhasebe', path: '/admin/yonetim/muhasebe' },
            { icon: '⚙️', label: 'Ayarlar', path: '/admin/yonetim/ayarlar' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="card card-interactive"
              style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Son Siparişler</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/siparisler')}>Tümünü Gör →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {recentOrders.map(o => {
              const days = daysUntil(o.deliveryDate);
              return (
                <div
                  key={o.id}
                  className="order-card"
                  onClick={() => navigate(`/admin/siparisler/${o.id}`)}
                >
                  <div className="order-card__avatar">
                    {o.bride.charAt(0).toUpperCase()}{o.groom.charAt(0).toUpperCase()}
                  </div>
                  <div className="order-card__main">
                    <div className="order-card__names">{o.bride} & {o.groom}</div>
                    <div className="order-card__category">{o.categoryName || 'Özel Set'}</div>
                    <div className="order-card__progress">
                      <div className="order-card__bar">
                        <div className="order-card__bar-fill" style={{ width: `${(['onay','kapora','hazirlaniyor','hazir','teslim'].indexOf(o.status)+1)*20}%` }} />
                      </div>
                      <span className="order-card__status-label" style={{ color: STATUS_COLORS[o.status] }}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </div>
                  </div>
                  <div className="order-card__right">
                    <div className="order-card__date">{formatDateShort(o.deliveryDate)}</div>
                    <div className="order-card__days" style={{ color: days <= 2 ? 'var(--red-500)' : days <= 5 ? 'var(--orange-500)' : 'var(--gray-400)' }}>
                      {days > 0 ? `${days} gün` : days === 0 ? 'Bugün' : 'Geçti'}
                    </div>
                    <div className="order-card__price">{formatCurrency(o.totalPrice)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Henüz sipariş yok</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Sipariş oluşturma ekranından ilk siparişi ekleyin</div>
          <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/siparis')}>
            Sipariş Oluştur
          </button>
        </div>
      )}
    </div>
  );
}
