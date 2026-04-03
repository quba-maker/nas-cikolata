import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import type { OrderStatus } from '../../types';
import { formatDateShort, daysUntil, STATUS_LABELS } from '../../utils/helpers';

const STATUS_ORDER: OrderStatus[] = ['onay', 'kapora', 'hazirlaniyor', 'hazir', 'teslim'];
const STATUS_COLORS: Record<OrderStatus, string> = {
  onay: '#8E8E93',
  kapora: '#FF9500',
  hazirlaniyor: '#007AFF',
  hazir: '#34C759',
  teslim: '#8B5CF6',
};

function isSameDay(d1: Date, d2: Date) {
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
}

export default function AdminHome() {
  const { state } = useApp();
  const navigate = useNavigate();
  const orders = state.orders;

  const counts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const activeOrders = orders.filter(o => o.status !== 'teslim').length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
  
  const urgentDeliveries = orders.filter(o => o.status !== 'teslim' && daysUntil(o.deliveryDate) <= 2)
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

  // Siri Style Summary
  const pending = counts['onay'] + counts['kapora'];
  const p_text = pending > 0 ? `yeni onay bekleyen ${pending} siparişin` : `mutfakta devam eden ${counts['hazirlaniyor']} siparişin`;
  const end_text = urgentDeliveries.length > 0 ? `Yarına yetiştirmen gereken ${urgentDeliveries.length} acil teslimat bulunuyor.` : `Tüm takvim rahat ilerliyor.`;
  
  const [activeTab, setActiveTab] = useState<'urgent' | 'recent'>(urgentDeliveries.length > 0 ? 'urgent' : 'recent');

  // Mini Calendar Generation (Next 7 Days)
  const today = new Date();
  const miniCalendar = Array.from({length: 7}, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // Find active orders for this date
    const hasDelivery = orders.some(o => o.status !== 'teslim' && isSameDay(new Date(o.deliveryDate), d));
    return {
      date: d,
      hasDelivery,
      dayName: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
      dayNum: d.getDate()
    };
  });

  return (
    <div style={{ padding: 'var(--space-md)', paddingBottom: '120px' }}>
      
      {/* 1. Header & Pill Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1C1C1E', letterSpacing: '-0.04em' }}>
            {greeting}
          </h1>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8E8E93', marginTop: 2 }}>
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
           <button className="hover-scale" onClick={() => navigate('/siparis')} style={{ width: 44, height: 44, borderRadius: '50%', background: '#007AFF', color: '#FFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,122,255,0.3)', cursor: 'pointer' }}>
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           </button>
           <button className="hover-scale" onClick={() => navigate('/admin/yonetim')} style={{ width: 44, height: 44, borderRadius: '50%', background: '#F2F2F7', color: '#1C1C1E', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
           </button>
        </div>
      </div>

      {/* 2. Siri Style Summary */}
      <div style={{ marginBottom: 'var(--space-lg)', lineHeight: 1.5 }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.02em', margin: 0 }}>
          Bugün aktif {activeOrders} siparişin var, {p_text} ve {counts['hazir']} iş çıkışa hazır. {end_text}
        </p>
      </div>

      {/* 3. Mini Calendar Ribbon */}
      <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {miniCalendar.map((day, ix) => (
          <div key={ix} style={{ flexShrink: 0, width: 46, padding: '10px 0', borderRadius: 16, background: ix === 0 ? '#1C1C1E' : '#F2F2F7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: ix === 0 ? '#8E8E93' : '#8E8E93', textTransform: 'uppercase', marginBottom: 6 }}>{day.dayName}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: ix === 0 ? '#FFF' : '#1C1C1E', marginBottom: 4 }}>{day.dayNum}</span>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: day.hasDelivery ? '#FF3B30' : 'transparent' }} />
          </div>
        ))}
      </div>

      {/* 4. Tabbed Lists (Urgent vs Recent) */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, borderBottom: '1px solid #E5E5EA' }}>
        <button 
          onClick={() => setActiveTab('urgent')}
          style={{ flex: 1, padding: '0 0 12px 0', background: 'none', border: 'none', borderBottom: activeTab === 'urgent' ? '2px solid #1C1C1E' : '2px solid transparent', fontSize: 13, fontWeight: 800, color: activeTab === 'urgent' ? '#1C1C1E' : '#8E8E93', letterSpacing: '0.02em', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          ACİLLER {urgentDeliveries.length > 0 && <span style={{ background: '#FF3B30', color: '#FFF', padding: '2px 6px', borderRadius: 10, fontSize: 10 }}>{urgentDeliveries.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('recent')}
          style={{ flex: 1, padding: '0 0 12px 0', background: 'none', border: 'none', borderBottom: activeTab === 'recent' ? '2px solid #1C1C1E' : '2px solid transparent', fontSize: 13, fontWeight: 800, color: activeTab === 'recent' ? '#1C1C1E' : '#8E8E93', letterSpacing: '0.02em', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          TÜM SİPARİŞLER
        </button>
      </div>

      <div style={{ minHeight: 200 }}>
        {activeTab === 'urgent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {urgentDeliveries.length > 0 ? urgentDeliveries.map(o => (
              <div key={o.id} className="hover-scale" onClick={() => navigate(`/admin/siparisler/${o.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255, 59, 48, 0.04)', borderRadius: 16, cursor: 'pointer', border: '1px solid rgba(255,59,48,0.1)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                  {o.bride.charAt(0)}{o.groom.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#343A40' }}>{o.bride} & {o.groom}</div>
                  <div style={{ fontSize: 12, color: '#FF3B30', fontWeight: 600, marginTop: 2 }}>{daysUntil(o.deliveryDate) <= 0 ? 'Bugün Teslim Et' : `Yarın Teslim (${formatDateShort(o.deliveryDate)})`}</div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#8E8E93', fontSize: 14, fontWeight: 600 }}>
                Yaklaşan acil teslimat yok. 🎉
              </div>
            )}
          </div>
        )}

        {activeTab === 'recent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentOrders.length > 0 ? recentOrders.map(o => (
              <div key={o.id} className="hover-scale" onClick={() => navigate(`/admin/siparisler/${o.id}`)} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', background: 'transparent', transition: 'all 0.2s', padding: '6px 0' }}>
                <div style={{ background: '#F2F2F7', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#8E8E93', fontSize: 13 }}>
                  {o.bride.charAt(0)}{o.groom.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.01em' }}>{o.bride} & {o.groom}</div>
                  <div style={{ fontSize: 12, color: '#8E8E93', fontWeight: 600 }}>{formatDateShort(o.createdAt)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: STATUS_COLORS[o.status] || '#8E8E93', marginBottom: 2, textTransform: 'uppercase', padding: '4px 8px', background: `${STATUS_COLORS[o.status]}15`, borderRadius: 10 }}>
                    {STATUS_LABELS[o.status]}
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#8E8E93', fontSize: 14, fontWeight: 600 }}>
                Henüz hareket yok
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
