import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { formatDateShort, daysUntil } from '../../utils/helpers';

export default function AdminHome() {
  const { state } = useApp();
  const navigate = useNavigate();
  const orders = state.orders;

  const counts = {
    yeni: orders.filter(o => o.status === 'onay' || o.status === 'kapora').length,
    yapimda: orders.filter(o => o.status === 'hazirlaniyor').length,
    hazir: orders.filter(o => o.status === 'hazir').length,
  };

  const activeOrders = counts.yeni + counts.yapimda + counts.hazir;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
  
  const urgentDeliveries = orders.filter(o => o.status !== 'teslim' && daysUntil(o.deliveryDate) <= 2)
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ padding: 'var(--space-md)', paddingBottom: '120px' }}>
      
      {/* 1. Karsilama - Welcome Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1C1C1E', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
          {greeting}, Nas.
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: '#8E8E93', marginTop: 8, lineHeight: 1.5 }}>
          {today}. Sistemde {activeOrders} siparişiniz aktif olarak yürütülüyor. Atölyeniz tıkırında işliyor.
        </p>
      </div>

      {/* 2. Pipeline Bar (Uretim Bandi) */}
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: 13, fontWeight: 800, color: '#8E8E93', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Atölye Durumu</h2>
        
        <div style={{ background: '#FFF', borderRadius: 24, padding: '24px 20px', boxShadow: '0 4px 24px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Progress Visual */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* The Background Line */}
            <div style={{ position: 'absolute', top: '24px', left: 20, right: 20, height: 2, background: '#F2F2F7', zIndex: 0 }} />
            
            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: '#FFF', padding: '0 8px' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: counts.yeni > 0 ? '#FF9500' : '#E5E5EA', boxShadow: counts.yeni > 0 ? '0 0 0 4px rgba(255,149,0,0.15)' : 'none' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#1C1C1E', lineHeight: 1 }}>{counts.yeni}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', marginTop: 4 }}>Yeni</span>
              </div>
            </div>

            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: '#FFF', padding: '0 8px' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: counts.yapimda > 0 ? '#007AFF' : '#E5E5EA', boxShadow: counts.yapimda > 0 ? '0 0 0 4px rgba(0,122,255,0.15)' : 'none' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#1C1C1E', lineHeight: 1 }}>{counts.yapimda}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', marginTop: 4 }}>Yapımda</span>
              </div>
            </div>

            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: '#FFF', padding: '0 8px' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: counts.hazir > 0 ? '#34C759' : '#E5E5EA', boxShadow: counts.hazir > 0 ? '0 0 0 4px rgba(52,199,89,0.15)' : 'none' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#1C1C1E', lineHeight: 1 }}>{counts.hazir}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', marginTop: 4 }}>Hazır</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Urgent Action Center (Only displayed if needed) */}
      {urgentDeliveries.length > 0 && (
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: '#FF3B30', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF3B30', display: 'inline-block' }} /> Bugüne / Yarına Yetişecekler
          </h2>
          <div style={{ background: '#FFF1F2', borderRadius: 24, padding: 20, border: '1px solid rgba(255, 59, 48, 0.1)', boxShadow: '0 8px 32px rgba(255,59,48,0.06)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {urgentDeliveries.map(o => (
                <div key={o.id} className="hover-scale" onClick={() => navigate(`/admin/siparisler/${o.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FFF', padding: 12, borderRadius: 16, cursor: 'pointer' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                    {o.bride.charAt(0)}{o.groom.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1E' }}>{o.bride} & {o.groom}</div>
                    <div style={{ fontSize: 12, color: '#FF3B30', fontWeight: 600, marginTop: 2 }}>
                      {daysUntil(o.deliveryDate) <= 0 ? 'Hemen Çıkış Yapılmalı' : `Yarın Çıkacak (${formatDateShort(o.deliveryDate)})`}
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Bento Action Grid */}
      <div>
        <h2 style={{ fontSize: 13, fontWeight: 800, color: '#8E8E93', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Yönetim Merkezi</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          
          {/* Primary Action - Creates a New Order */}
          <button className="hover-scale" onClick={() => navigate('/siparis')} style={{ gridColumn: 'span 2', background: '#1C1C1E', borderRadius: 24, padding: 24, border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            <div>
              <div style={{ color: '#FFF', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Yeni Sipariş</div>
              <div style={{ color: '#8E8E93', fontSize: 13, fontWeight: 500 }}>Sisteme yeni bir sipariş ekle</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </button>

          {/* Secondary Actions */}
          <button className="hover-scale" onClick={() => navigate('/admin/yonetim/muhasebe')} style={{ background: '#FFF', borderRadius: 24, padding: 20, border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: 140 }}>
            <div style={{ width: 44, height: 44, borderRadius: 16, background: 'rgba(255, 149, 0, 0.1)', color: '#FF9500', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1C1C1E' }}>Finans</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', marginTop: 2 }}>Gelir & Gider</div>
            </div>
          </button>

          <button className="hover-scale" onClick={() => navigate('/admin/yonetim/urunler')} style={{ background: '#FFF', borderRadius: 24, padding: 20, border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: 140 }}>
             <div style={{ width: 44, height: 44, borderRadius: 16, background: 'rgba(175, 82, 222, 0.1)', color: '#AF52DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1C1C1E' }}>Ürünler</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', marginTop: 2 }}>Ürün Kataloğu</div>
            </div>
          </button>
          
          <button className="hover-scale" onClick={() => navigate('/admin/yonetim/ayarlar')} style={{ gridColumn: 'span 2', background: '#FFF', borderRadius: 24, padding: 20, border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 16, background: '#F2F2F7', color: '#8E8E93', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1C1C1E' }}>Sistem Ayarları</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', marginTop: 2 }}>Zamanlama, İletişim ve Diğer Ayarlar</div>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
}
