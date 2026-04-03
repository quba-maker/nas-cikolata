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
  
  // Urgent Deliveries (Bugün veya Yarına Teslim Edilecekler)
  const urgentDeliveries = orders.filter(o => o.status !== 'teslim' && daysUntil(o.deliveryDate) <= 2)
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

  return (
    <div style={{ padding: 'var(--space-md)', paddingBottom: '100px' }}>
      
      {/* 1. Header & Quick Add */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--nas-black)', letterSpacing: '-0.04em' }}>
            {greeting} 👋
          </h1>
        </div>
      </div>

      {/* Insight Balloon */}
      {activeOrders > 0 && (
        <div style={{
          background: urgentDeliveries.length > 0 ? 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)' : 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          border: `1px solid ${urgentDeliveries.length > 0 ? '#FECDD3' : '#BBF7D0'}`,
          borderRadius: 'var(--radius-xl)', padding: '16px 20px', marginBottom: 'var(--space-md)',
          display: 'flex', alignItems: 'flex-start', gap: 12
        }}>
          <span style={{ fontSize: 24 }}>{urgentDeliveries.length > 0 ? '🚨' : '✨'}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: urgentDeliveries.length > 0 ? '#9F1239' : '#166534', marginBottom: 4 }}>
              {urgentDeliveries.length > 0 ? 'Acil Teslimatlar Var!' : 'Her şey yolunda!'}
            </div>
            <div style={{ fontSize: 13, color: urgentDeliveries.length > 0 ? '#BE123C' : '#15803D', lineHeight: 1.4, fontWeight: 500 }}>
              Şu an sistemde bekleyen {activeOrders} siparişiniz var. 
              {urgentDeliveries.length > 0 ? ` Bunlardan ${urgentDeliveries.length} tanesinin teslimat tarihi çok yaklaştı.` : ' Sistemi harika yönetiyorsunuz, acil bir durum görünmüyor.'}
            </div>
          </div>
        </div>
      )}

      {/* 2. Urgent Deliveries List */}
      {urgentDeliveries.length > 0 && (
        <div className="dashboard-panel-card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-xl)', background: '#FFF', border: '1px solid #FECDD3', boxShadow: '0 8px 24px rgba(225, 29, 72, 0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#9F1239', letterSpacing: '0.05em', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>YAKLAŞAN TESLİMATLAR</span>
            <span style={{ background: '#E11D48', color: '#FFF', padding: '2px 8px', borderRadius: 10 }}>{urgentDeliveries.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {urgentDeliveries.slice(0, 3).map(o => (
              <div key={o.id} onClick={() => navigate(`/admin/siparisler/${o.id}`)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#FFF1F2', borderRadius: 'var(--radius-md)', cursor: 'pointer'
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: '#FDA4AF', color: '#881337', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                  {o.bride.charAt(0)}{o.groom.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#881337' }}>{o.bride} & {o.groom}</div>
                  <div style={{ fontSize: 12, color: '#E11D48', fontWeight: 500 }}>{daysUntil(o.deliveryDate) <= 0 ? 'Bugün Teslim!' : `Yarın Teslim (${formatDateShort(o.deliveryDate)})`}</div>
                </div>
                <div style={{ fontSize: 18 }}>👉</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. True Bento Grid for Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 'var(--space-xl)' }}>
        {/* Active Orders Widget */}
        <div className="dashboard-inner-card" style={{ margin: 0, padding: 20, background: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aktif Sipariş</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--orange-500)', marginTop: 8, letterSpacing: '-0.04em' }}>{activeOrders}</div>
        </div>
        
        {/* Total Orders Widget */}
        <div className="dashboard-inner-card" style={{ margin: 0, padding: 20, background: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toplam Sipariş</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--gray-900)', marginTop: 8, letterSpacing: '-0.04em' }}>{orders.length}</div>
        </div>

        {/* Total Revenue Wide Widget */}
        <div className="dashboard-inner-card" style={{ margin: 0, padding: '24px 20px', background: 'linear-gradient(135deg, #f8f9fa 0%, #FFF 100%)', gridColumn: 'span 2', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Toplam Ciro</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--nas-bordeaux)', letterSpacing: '-0.04em' }}>{formatCurrency(totalRevenue)}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-600)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>📈</span> İşler harika gidiyor
            </div>
          </div>
          {/* Decorative background chart overlay */}
          <div style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.05, fontSize: 120, pointerEvents: 'none' }}>₺</div>
        </div>
      </div>

      {/* 4. Quick Action Circles */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-800)', letterSpacing: '-0.02em', marginBottom: 16 }}>Hızlı İşlemler</div>
        <div className="h-scroll" style={{ margin: '0 -var(--space-md)', padding: '0 var(--space-md)', gap: 16 }}>
          {[
            { icon: '➕', label: 'Yeni Sipariş', bg: '#DCFCE7', color: '#166534', path: '/siparis' },
            { icon: '💸', label: 'Masraf Ekle', bg: '#FEF3C7', color: '#B45309', path: '/admin/yonetim/muhasebe' },
            { icon: '📦', label: 'Ürün Ekle', bg: '#E0E7FF', color: '#3730A3', path: '/admin/yonetim/urunler' },
            { icon: '⚙️', label: 'Ayarlar', bg: '#F3F4F6', color: '#374151', path: '/admin/yonetim/ayarlar' },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer', minWidth: 76
              }}
            >
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: action.bg, color: action.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                {action.icon}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', textAlign: 'center' }}>
                {action.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Recent orders */}
      <div className="dashboard-panel-card" style={{ padding: 'var(--space-xl)' }}>
        <div className="dashboard-inner-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>SON HAREKETLER</span>
          <button className="btn btn-ghost btn-sm" style={{ fontWeight: 700, color: 'var(--nas-black)' }} onClick={() => navigate('/admin/siparisler')}>Tümü →</button>
        </div>
        
        {recentOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {recentOrders.map(o => (
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
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Henüz sipariş yok</div>
          </div>
        )}
      </div>

    </div>
  );
}
