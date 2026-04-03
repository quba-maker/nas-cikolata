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
      
      {/* 1. Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--nas-black)', letterSpacing: '-0.04em' }}>
            {greeting}
          </h1>
        </div>
      </div>

      {/* Insight Balloon - Glassmorphism */}
      {activeOrders > 0 && (
        <div style={{
          background: urgentDeliveries.length > 0 ? 'rgba(255, 59, 48, 0.04)' : 'rgba(52, 199, 89, 0.04)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${urgentDeliveries.length > 0 ? 'rgba(255, 59, 48, 0.15)' : 'rgba(52, 199, 89, 0.15)'}`,
          borderRadius: 20, padding: '16px 20px', marginBottom: 'var(--space-md)',
          display: 'flex', alignItems: 'flex-start', gap: 12
        }}>
          <div style={{ marginTop: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: urgentDeliveries.length > 0 ? '#FF3B30' : '#34C759', color: '#FFF' }}>
             {urgentDeliveries.length > 0 ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: urgentDeliveries.length > 0 ? '#C92A2A' : '#2B8A3E', marginBottom: 4 }}>
              {urgentDeliveries.length > 0 ? 'Dikkat Gerektiren Teslimatlar' : 'Sistem Sorunsuz Çalışıyor'}
            </div>
            <div style={{ fontSize: 13, color: urgentDeliveries.length > 0 ? '#E03131' : '#2F9E44', lineHeight: 1.4, fontWeight: 500 }}>
              Şu an {activeOrders} aktif siparişiniz var. 
              {urgentDeliveries.length > 0 ? ` Bunlardan ${urgentDeliveries.length} tanesinin teslimat zamanı çok yakın.` : ' Tüm süreçler tıkırında, harika yönetiyorsunuz.'}
            </div>
          </div>
        </div>
      )}

      {/* 2. Urgent Deliveries List - Clean Vector Style */}
      {urgentDeliveries.length > 0 && (
        <div style={{ padding: 20, marginBottom: 'var(--space-xl)', background: '#FFF', borderRadius: 24, border: '1px solid rgba(255, 59, 48, 0.1)', boxShadow: '0 8px 32px rgba(255, 59, 48, 0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#C92A2A', letterSpacing: '0.05em', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>YAKLAŞAN TESLİMATLAR</span>
            <span style={{ background: '#FF3B30', color: '#FFF', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>{urgentDeliveries.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {urgentDeliveries.slice(0, 3).map(o => (
              <div key={o.id} className="hover-scale" onClick={() => navigate(`/admin/siparisler/${o.id}`)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255, 59, 48, 0.04)', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.2,0.8,0.2,1)'
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                  {o.bride.charAt(0)}{o.groom.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#343A40' }}>{o.bride} & {o.groom}</div>
                  <div style={{ fontSize: 12, color: '#FF3B30', fontWeight: 600, marginTop: 2 }}>{daysUntil(o.deliveryDate) <= 0 ? 'Bugün Teslim Et' : `Yarın Teslim (${formatDateShort(o.deliveryDate)})`}</div>
                </div>
                <div style={{ color: '#FF3B30', opacity: 0.5 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. True Bento Grid for Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 'var(--space-xl)' }}>
        {/* Active Orders Widget */}
        <div className="hover-scale" style={{ padding: 20, background: '#FFF', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aktif Sipariş</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#FF9500', marginTop: 12, letterSpacing: '-0.04em', lineHeight: 1 }}>{activeOrders}</div>
        </div>
        
        {/* Total Orders Widget */}
        <div className="hover-scale" style={{ padding: 20, background: '#FFF', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toplam Sipariş</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#1C1C1E', marginTop: 12, letterSpacing: '-0.04em', lineHeight: 1 }}>{orders.length}</div>
        </div>

        {/* Atölye Durumu (Workload Kanban Widget - Status Dots) */}
        <div style={{ padding: '24px 16px', background: '#FFF', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', gridColumn: 'span 2' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20, paddingLeft: 8 }}>Atölye Durumu</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#8E8E93', boxShadow: '0 0 0 4px rgba(142, 142, 147, 0.15)', marginBottom: 12 }} />
              <div style={{ fontSize: 26, fontWeight: 900, color: '#1C1C1E', letterSpacing: '-0.04em', lineHeight: 1 }}>{counts['onay'] + counts['kapora']}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', marginTop: 8 }}>YENİ</div>
            </div>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid rgba(0,0,0,0.05)', borderRight: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#007AFF', boxShadow: '0 0 0 4px rgba(0, 122, 255, 0.15)', marginBottom: 12 }} />
              <div style={{ fontSize: 26, fontWeight: 900, color: '#1C1C1E', letterSpacing: '-0.04em', lineHeight: 1 }}>{counts['hazirlaniyor']}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', marginTop: 8 }}>YAPIMDA</div>
            </div>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34C759', boxShadow: '0 0 0 4px rgba(52, 199, 89, 0.15)', marginBottom: 12 }} />
              <div style={{ fontSize: 26, fontWeight: 900, color: '#1C1C1E', letterSpacing: '-0.04em', lineHeight: 1 }}>{counts['hazir']}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray-500)', marginTop: 8 }}>HAZIR</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Action Circles (Apple Settings Style) */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1C1C1E', letterSpacing: '-0.02em', marginBottom: 16 }}>Hızlı İşlemler</div>
        <div className="h-scroll" style={{ margin: '0 -var(--space-md)', padding: '0 var(--space-md)', gap: 16 }}>
          {[
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>, label: 'Yeni Sipariş', bg: '#007AFF', color: '#FFF', path: '/siparis' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>, label: 'Masrafa Dön', bg: '#FF9500', color: '#FFF', path: '/admin/yonetim/muhasebe' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>, label: 'Ürün Ekle', bg: '#AF52DE', color: '#FFF', path: '/admin/yonetim/urunler' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>, label: 'Ayarlar', bg: '#8E8E93', color: '#FFF', path: '/admin/yonetim/ayarlar' },
          ].map(action => (
            <button
              key={action.label}
              className="hover-scale"
              onClick={() => navigate(action.path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer', minWidth: 72, transition: 'transform 0.2s'
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: action.bg, color: action.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 16px ${action.bg}40`
              }}>
                {action.icon}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8E8E93', textAlign: 'center' }}>
                {action.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Minimalist Recent Orders List */}
      <div style={{ padding: '24px 20px', background: '#FFF', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#1C1C1E', letterSpacing: '-0.02em' }}>SON HAREKETLER</span>
          <button className="btn btn-ghost btn-sm" style={{ fontWeight: 700, color: '#007AFF', padding: 0 }} onClick={() => navigate('/admin/siparisler')}>Tümü</button>
        </div>
        
        {recentOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentOrders.map(o => (
              <div
                key={o.id}
                className="hover-scale"
                onClick={() => navigate(`/admin/siparisler/${o.id}`)}
                style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', background: 'transparent', transition: 'all 0.2s', paddingBottom: 12, borderBottom: '1px solid rgba(0,0,0,0.05)' }}
              >
                <div style={{ background: '#F2F2F7', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#8E8E93', fontSize: 14 }}>
                  {o.bride.charAt(0)}{o.groom.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.01em' }}>{o.bride} & {o.groom}</div>
                  <div style={{ fontSize: 12, color: '#8E8E93', fontWeight: 600 }}>{o.categoryName || 'Özel Set'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: STATUS_COLORS[o.status] || '#8E8E93', marginBottom: 2, textTransform: 'uppercase' }}>
                    {STATUS_LABELS[o.status]}
                  </div>
                </div>
                <div style={{ color: '#D1D1D6' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Henüz hareket yok</div>
          </div>
        )}
      </div>

    </div>
  );
}
