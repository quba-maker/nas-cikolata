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
    <div style={{ padding: 'var(--space-md)', paddingBottom: '100px' }}>
      {/* Greeting Widget */}
      <div className="dashboard-panel-card" style={{
        padding: 'var(--space-xl)', marginBottom: 'var(--space-md)',
        background: '#FFF',
      }}>
        <div className="dashboard-inner-header" style={{ marginBottom: 12 }}>
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--nas-black)', letterSpacing: '-0.04em', marginBottom: 20 }}>
          {greeting}! 👋
        </h1>
        <button
          className="btn btn-green btn-sm"
          style={{ width: 'auto', padding: '10px 20px', borderRadius: '999px', fontWeight: 700 }}
          onClick={() => navigate('/siparis')}
        >
          <span style={{ fontSize: 18 }}>+</span> Yeni Sipariş Oluştur
        </button>
      </div>

      {/* Bento Grid Stats */}
      <div className="bento-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="bento-item bento-small" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toplam Sipariş</div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--gray-900)' }}>{orders.length}</div>
        </div>
        <div className="bento-item bento-small" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aktif Sipariş</div>
          <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--orange-500)' }}>{activeOrders}</div>
        </div>
        <div className="bento-item bento-small" style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 4' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toplam Ciro</div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--nas-bordeaux)' }}>{formatCurrency(totalRevenue)}</div>
        </div>
      </div>

      {/* Status pills - Modernized */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-800)', letterSpacing: '-0.02em', marginBottom: 16 }}>Sipariş Durumları</div>
        <div className="h-scroll" style={{ margin: '0 -var(--space-md)', padding: '0 var(--space-md)' }}>
          {STATUS_ORDER.map(s => (
            <button
              key={s}
              onClick={() => navigate('/admin/siparisler')}
              className="bento-item"
              style={{
                background: '#fff', border: 'none', padding: '16px', minWidth: 100,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8, background: 'var(--gray-50)', width: 44, height: 44, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{STATUS_ICONS[s]}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: STATUS_COLORS[s], letterSpacing: '-0.02em' }}>{counts[s]}</div>
              <div style={{ fontSize: 10, color: 'var(--gray-500)', fontWeight: 700, marginTop: 4 }}>{STATUS_LABELS[s]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick access Bento */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="dashboard-inner-header" style={{ marginBottom: 16 }}>HIZLI ERİŞİM</div>
        <div className="bento-grid">
          {[
            { icon: '📦', label: 'Tüm Siparişler', path: '/admin/siparisler' },
            { icon: '🛍️', label: 'Ürün Yönetimi', path: '/admin/yonetim/urunler' },
            { icon: '💰', label: 'Muhasebe Özeti', path: '/admin/yonetim/muhasebe' },
            { icon: '⚙️', label: 'Sistem Ayarları', path: '/admin/yonetim/ayarlar' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="dashboard-inner-card"
              style={{ margin: 0, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, border: '1px solid #E5E7EB', cursor: 'pointer', textAlign: 'left', background: '#FFF' }}
            >
              <div style={{ fontSize: 28, background: 'var(--gray-50)', padding: 12, borderRadius: 'var(--radius-xl)' }}>{item.icon}</div>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="dashboard-panel-card" style={{ padding: 'var(--space-xl)' }}>
          <div className="dashboard-inner-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>SON SİPARİŞLER</span>
            <button className="btn btn-ghost btn-sm" style={{ fontWeight: 700, color: 'var(--nas-black)' }} onClick={() => navigate('/admin/siparisler')}>Tümü →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {recentOrders.map(o => {
              const days = daysUntil(o.deliveryDate);
              return (
                <div
                  key={o.id}
                  className="dashboard-inner-card"
                  onClick={() => navigate(`/admin/siparisler/${o.id}`)}
                  style={{ margin: 0, display: 'flex', alignItems: 'center', padding: '16px', gap: 16, cursor: 'pointer', background: '#FFF', border: '1px solid #E5E7EB' }}
                >
                  <div style={{ background: 'var(--gray-100)', width: 44, height: 44, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--gray-600)', fontSize: 14 }}>
                    {o.bride.charAt(0)}{o.groom.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>{o.bride} & {o.groom}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 500 }}>{o.categoryName || 'Özel Set'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="badge" style={{ background: 'var(--gray-100)', color: STATUS_COLORS[o.status], marginBottom: 4 }}>
                      {STATUS_LABELS[o.status]}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>
                      {formatCurrency(o.totalPrice)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="glass-block" style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>Henüz sipariş yok</div>
          <div style={{ fontSize: 14, marginTop: 8, fontWeight: 500 }}>Sipariş oluşturma ekranından ilk siparişi ekleyin</div>
          <button className="btn btn-primary btn-pulse" style={{ marginTop: 24, borderRadius: 'var(--radius-pill)' }} onClick={() => navigate('/siparis')}>
            Sipariş Oluştur
          </button>
        </div>
      )}
    </div>
  );
}
