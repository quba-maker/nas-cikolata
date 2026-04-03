import { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { formatCurrency } from '../../data/seedData';
import type { PaymentRecord, PartnerId } from '../../types';

type Period = 'weekly' | 'monthly' | 'yearly';

function getPeriodRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);
  if (period === 'weekly') { start.setDate(start.getDate() - 7); }
  else if (period === 'monthly') { start.setMonth(start.getMonth() - 1); }
  else { start.setFullYear(start.getFullYear() - 1); }
  return { start, end };
}

export default function AdminAccounting() {
  const { state, dispatch } = useApp();
  const [period, setPeriod] = useState<Period>('monthly');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payForm, setPayForm] = useState({ partnerId: 'ortak2' as PartnerId, amount: '', type: 'kar-payi' as PaymentRecord['type'], description: '' });
  const [costDetail, setCostDetail] = useState<string | null>(null);

  const { start, end } = getPeriodRange(period);

  const periodOrders = state.orders.filter(o => {
    const d = new Date(o.createdAt);
    return d >= start && d <= end;
  });

  const totalRevenue = periodOrders.reduce((s, o) => s + o.totalPrice, 0);
  const totalCost = periodOrders.reduce((s, o) => s + o.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;
  const avgOrder = periodOrders.length > 0 ? totalRevenue / periodOrders.length : 0;

  const partner1Share = Math.round(totalProfit * state.settings.partner1Share);
  const partner2Share = Math.round(totalProfit * state.settings.partner2Share);

  const partner2Payments = state.payments.filter(p => p.partnerId === 'ortak2');
  const partner2Paid = partner2Payments.reduce((s, p) => s + p.amount, 0);
  const partner2Remaining = partner2Share - partner2Paid;

  const addPayment = () => {
    const payment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      partnerId: payForm.partnerId,
      amount: +payForm.amount,
      type: payForm.type,
      description: payForm.description,
      date: new Date().toISOString(),
      isAuto: false,
    };
    dispatch({ type: 'ADD_PAYMENT', payment });
    setShowAddPayment(false);
    setPayForm({ partnerId: 'ortak2', amount: '', type: 'kar-payi', description: '' });
  };

  return (
    <div style={{ padding: 'var(--space-md)', paddingBottom: 100 }}>
      {/* Period selector */}
      <div className="tab-bar" style={{ marginBottom: 'var(--space-md)' }}>
        {(['weekly', 'monthly', 'yearly'] as Period[]).map(p => (
          <button key={p} className={`tab-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
            {p === 'weekly' ? 'Haftalık' : p === 'monthly' ? 'Aylık' : 'Yıllık'}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <div className="stat-card">
          <div className="stat-card__label">Toplam Satış</div>
          <div className="stat-card__value" style={{ fontSize: 18, color: 'var(--nas-bordeaux)' }}>{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Toplam Maliyet</div>
          <div className="stat-card__value" style={{ fontSize: 18, color: 'var(--red-500)' }}>{formatCurrency(totalCost)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Net Kar</div>
          <div className="stat-card__value" style={{ fontSize: 18, color: 'var(--green-600)' }}>{formatCurrency(totalProfit)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Ortalama Sipariş</div>
          <div className="stat-card__value" style={{ fontSize: 18 }}>{formatCurrency(avgOrder)}</div>
          <div className="stat-card__sub">{periodOrders.length} sipariş</div>
        </div>
      </div>

      {/* Partners */}
      <div className="dashboard-panel-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-md)', background: '#fff' }}>
        <div className="dashboard-inner-header" style={{ marginBottom: 'var(--space-md)' }}>ORTAKLAR SİSTEMİ</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          {/* Ortak 1 */}
          <div style={{ padding: 'var(--space-md)', background: 'var(--nas-rose-light)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nas-bordeaux)', marginBottom: 4 }}>
              {state.settings.partner1Name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 8 }}>Kasa / Maliyetler</div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>Kar Payı:</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--nas-bordeaux)' }}>{formatCurrency(partner1Share)}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Maliyet: {formatCurrency(totalCost)}</div>
          </div>
          {/* Ortak 2 */}
          <div style={{ padding: 'var(--space-md)', background: 'var(--gold-light, var(--nas-gold-light))', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92632B', marginBottom: 4 }}>
              {state.settings.partner2Name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 8 }}>Kar Ortağı</div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>Kar Payı:</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#92632B' }}>{formatCurrency(partner2Share)}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Ödenen: {formatCurrency(partner2Paid)}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: partner2Remaining > 0 ? 'var(--orange-500)' : 'var(--green-600)', marginTop: 4 }}>
              {partner2Remaining > 0 ? `Bekleyen: ${formatCurrency(partner2Remaining)}` : '✅ Ödenmiş'}
            </div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAddPayment(true)}>
          + Manuel Ödeme Ekle
        </button>

        {/* Payment history */}
        {state.payments.length > 0 && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 8 }}>Ödeme Geçmişi</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {state.payments.slice().reverse().map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: 13 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.description || p.type}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(p.date).toLocaleDateString('tr-TR')} · {p.partnerId === 'ortak1' ? state.settings.partner1Name : state.settings.partner2Name}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--green-600)' }}>{formatCurrency(p.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order cost table */}
      <div className="dashboard-panel-card" style={{ padding: 'var(--space-xl)', background: '#fff' }}>
        <div className="dashboard-inner-header" style={{ marginBottom: 'var(--space-md)' }}>SİPARİŞ MALİYET DETAYLARI</div>
        {periodOrders.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 'var(--space-xl)', fontSize: 14 }}>Bu dönemde sipariş yok</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {periodOrders.map(o => {
              const profit = o.totalPrice - o.totalCost;
              return (
                <div key={o.id}>
                  <div
                    style={{ padding: '12px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}
                    onClick={() => setCostDetail(costDetail === o.id ? null : o.id)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{o.bride} & {o.groom}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>#{o.id} · {o.selectedSet?.name ?? 'Özel'}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nas-bordeaux)' }}>{formatCurrency(o.totalPrice)}</div>
                      <div style={{ fontSize: 11, color: 'var(--red-500)' }}>-{formatCurrency(o.totalCost)}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green-600)' }}>={formatCurrency(profit)}</div>
                    </div>
                    <span style={{ fontSize: 16, color: 'var(--gray-400)' }}>{costDetail === o.id ? '▲' : '▼'}</span>
                  </div>
                  {costDetail === o.id && (
                    <div style={{ padding: '10px 14px', background: '#fff', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', border: '1px solid var(--gray-100)', borderTop: 'none' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 6 }}>Maliyet Detayı</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Baz Maliyet ({o.selectedSet?.name ?? 'Set'})</span>
                          <span>{formatCurrency(o.selectedSet?.cost ?? 0)}</span>
                        </div>
                        {o.extras.map((e, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{e.label} ×{e.qty}</span>
                            <span>{formatCurrency(e.totalCost)}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--gray-100)', paddingTop: 4 }}>
                          <span>Toplam Maliyet</span>
                          <span style={{ color: 'var(--red-500)' }}>{formatCurrency(o.totalCost)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add payment modal */}
      {showAddPayment && (
        <div className="modal-overlay center animate-fade-in" onClick={() => setShowAddPayment(false)}>
          <div className="modal-dialog animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Manuel Ödeme Ekle</span>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowAddPayment(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Ortak</label>
                <select className="input-field" value={payForm.partnerId} onChange={e => setPayForm(p => ({ ...p, partnerId: e.target.value as PartnerId }))}>
                  <option value="ortak1">{state.settings.partner1Name}</option>
                  <option value="ortak2">{state.settings.partner2Name}</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Tür</label>
                <select className="input-field" value={payForm.type} onChange={e => setPayForm(p => ({ ...p, type: e.target.value as PaymentRecord['type'] }))}>
                  <option value="kar-payi">Kar Payı</option>
                  <option value="kapora">Kapora</option>
                  <option value="kalan">Kalan Ödeme</option>
                  <option value="maliyet">Maliyet</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Tutar (₺)</label>
                <input type="number" className="input-field" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" />
              </div>
              <div className="input-group">
                <label className="input-label">Açıklama</label>
                <input className="input-field" value={payForm.description} onChange={e => setPayForm(p => ({ ...p, description: e.target.value }))} placeholder="Açıklama..." />
              </div>
            </div>
            <div className="modal-footer">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setShowAddPayment(false)}>İptal</button>
                <button className="btn btn-primary" onClick={addPayment} disabled={!payForm.amount}>Ekle</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
