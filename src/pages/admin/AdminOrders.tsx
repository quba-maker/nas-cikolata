import { useState } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import type { Order, OrderStatus } from '../../types';
import { formatCurrency, calcDeposit } from '../../data/seedData';
import { compressImage } from '../../utils/helpers';
import { formatDate, formatDateShort, daysUntil, STATUS_LABELS, STATUS_COLORS, STATUS_PROGRESS, getInitials } from '../../utils/helpers';
import { openWhatsApp, fillTemplate } from '../../utils/whatsapp';

// ============================================================
// ORDER LIST
// ============================================================
const ALL_STATUSES: OrderStatus[] = ['onay', 'kapora', 'hazirlaniyor', 'hazir', 'teslim'];

function OrderList() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = state.orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.bride.toLowerCase().includes(q) ||
      o.groom.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = state.orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  return (
    <div style={{ paddingBottom: 'var(--bottom-nav-h)' }}>
      {/* Header */}
      <div style={{ padding: 'var(--space-md)', paddingBottom: 0 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>Siparişler</h1>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/siparis')}>+ Yeni</button>
        </div>
        <div className="apple-search-bar" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 18, color: 'var(--gray-400)' }}>🔍</span>
          <input
            placeholder="İsim, telefon veya sipariş kodu ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Status filter */}
      <div style={{ padding: '0 var(--space-md)' }}>
        <div className="segmented-control">
          <button
            className={`segmented-chip ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Tümü
            <span className="segmented-chip__count">{state.orders.length}</span>
          </button>
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              className={`segmented-chip ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {STATUS_LABELS[s]}
              <span className="segmented-chip__count">{counts[s]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Order cards */}
      <div style={{ padding: '0 var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 16 }}>
        {filtered.length === 0 && (
          <div className="dashboard-panel-card" style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>Sipariş bulunamadı</div>
          </div>
        )}
        <div className="dashboard-panel-card" style={{ padding: 'var(--space-md)' }}>
          {filtered.map((o, idx) => {
            const days = daysUntil(o.deliveryDate);
            return (
              <div
                key={o.id}
                className="dashboard-inner-card"
                onClick={() => navigate(`/admin/siparisler/${o.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '16px', gap: 16, cursor: 'pointer',
                  border: '1px solid #E5E7EB',
                  margin: 0, marginBottom: 'var(--space-sm)', background: '#FFF'
                }}
              >
                <div style={{ background: 'var(--gray-100)', minWidth: 44, height: 44, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--gray-600)', fontSize: 14 }}>
                  {getInitials(o.bride, o.groom)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>{o.bride} & {o.groom}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 500 }}>{o.categoryName || (o.selectedSet?.name ?? 'Özel Sipariş')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="badge" style={{ background: 'var(--gray-100)', color: STATUS_COLORS[o.status], marginBottom: 4 }}>
                    {STATUS_LABELS[o.status]}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>
                    {formatCurrency(o.totalPrice)}
                  </div>
                  <div style={{ fontSize: 11, color: days <= 2 ? 'var(--red-500)' : days <= 5 ? 'var(--orange-500)' : 'var(--gray-400)', fontWeight: 600, marginTop: 2 }}>
                    {days > 0 ? `${days} gün kaldı` : days === 0 ? 'Bugün!' : 'Gecikti'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ORDER DETAIL
// ============================================================
function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const order = state.orders.find(o => o.id === id);
  const [productionPhotos, setProductionPhotos] = useState<string[]>(order?.productionPhotos ?? []);
  const [ibanDialogOpen, setIbanDialogOpen] = useState(false);
  const [selectedIban, setSelectedIban] = useState<string | null>(null);

  if (!order) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
      <div>Sipariş bulunamadı</div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/admin/siparisler')}>
        Geri Dön
      </button>
    </div>
  );

  const currentIdx = ['onay', 'kapora', 'hazirlaniyor', 'hazir', 'teslim'].indexOf(order.status);
  const deposit = calcDeposit(order.totalPrice, state.settings.depositRate);
  const ibans = state.settings.ibans;

  const updateStatus = (s: OrderStatus) => {
    dispatch({ type: 'UPDATE_ORDER', id: order.id, updates: { status: s, lastUpdated: new Date().toISOString() } });
  };

  const getTemplate = (id: string, extra?: Record<string, string>) => {
    const tpl = state.settings.whatsappTemplates.find(t => t.id === id);
    if (!tpl) return '';
    const iban = ibans.find(i => i.id === selectedIban) ?? ibans[0];
    return fillTemplate(tpl.body, {
      gelin_adi: order.bride,
      damat_adi: order.groom,
      siparis_no: order.id,
      toplam_tutar: formatCurrency(order.totalPrice).replace(' ₺', ''),
      kapora_tutar: formatCurrency(deposit).replace(' ₺', ''),
      teslim_tarihi: formatDate(order.deliveryDate),
      banka_adi: iban?.bankName ?? '',
      hesap_adi: iban?.holderName ?? '',
      iban: iban?.iban ?? '',
      takip_linki: `${state.settings.orderTrackingBaseUrl}?code=${order.id}&phone=${order.phone}`,
      google_link: state.settings.googleReviewUrl,
      ...extra,
    });
  };

  const pleksiCount = [order.selectedBouquet ? 1 : 0, order.selectedBox ? 1 : 0, order.selectedSet ? 1 : 0].reduce((a, b) => a + b, 0);

  const addPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const imgs = await Promise.all(
      files.map(f => compressImage(f))
    );
    
    const updated = [...productionPhotos, ...imgs];
    setProductionPhotos(updated);
    dispatch({ type: 'UPDATE_ORDER', id: order.id, updates: { productionPhotos: updated } });
  };

  const STATUS_COLOR_MAP: Record<OrderStatus, string> = {
    onay: 'var(--gray-400)',
    kapora: 'var(--orange-500)',
    hazirlaniyor: 'var(--blue-500)',
    hazir: 'var(--green-500)',
    teslim: '#8B5CF6',
  };

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Header */}
      <div style={{
        background: '#FFF',
        padding: 'var(--space-xl)', paddingBottom: 'var(--space-md)',
        borderBottom: '1px solid var(--gray-200)',
      }}>
        <button className="btn btn-sm" style={{ background: 'var(--gray-100)', color: 'var(--nas-black)', marginBottom: 12, border: 'none', fontWeight: 700 }}
          onClick={() => navigate('/admin/siparisler')}>
          ← Siparişler
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--nas-black)', letterSpacing: '-0.03em' }}>
              {order.bride} & {order.groom}
            </h1>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4, fontWeight: 500 }}>
              #{order.id} · 📅 {formatDate(order.eventDate)} · 🚀 {formatDate(order.deliveryDate)}
            </div>
          </div>
          <span style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            background: 'var(--gray-100)', color: STATUS_COLORS[order.status]
          }}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

        {/* PROCESS TRACKER — Interactive */}
        <div className="dashboard-panel-card" style={{ padding: 'var(--space-xl)', background: '#fff' }}>
          <div className="dashboard-inner-header" style={{ marginBottom: 'var(--space-md)' }}>SİPARİŞ SÜRECİ</div>

          <div className="apple-timeline">
            {/* 1. ONAY */}
            <div className="apple-timeline-item">
              <div className={`timeline-dot ${currentIdx > 0 ? 'done' : currentIdx === 0 ? 'active' : ''}`} />
              <div className="timeline-content">
                <div className={`timeline-title ${currentIdx === 0 ? 'active' : currentIdx > 0 ? 'done' : ''}`}>Onay Bekliyor</div>
                {currentIdx === 0 && (
                  <div style={{ marginTop: 10 }}>
                    <button
                      className="btn btn-primary btn-shimmer"
                      onClick={() => {
                        updateStatus('kapora');
                        dispatch({ type: 'UPDATE_ORDER', id: order.id, updates: { customerNotifiedDeposit: true } });
                      }}
                    >
                      ✅ Siparişi Onayla
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. KAPORA */}
            <div className="apple-timeline-item">
              <div className={`timeline-dot ${currentIdx > 1 ? 'done' : currentIdx === 1 ? 'active' : ''}`} />
              <div className="timeline-content">
                <div className={`tracker-title ${currentIdx === 1 ? 'active' : currentIdx > 1 ? 'done' : ''}`}>
                  {currentIdx > 1 ? 'Kapora Alındı' : 'Kapora'}
                </div>
                {currentIdx === 1 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Customer deposit notification */}
                    {order.customerSentDeposit && (
                      <div style={{ padding: '10px 14px', background: 'var(--orange-bg)', borderRadius: 'var(--radius-lg)', fontSize: 13, color: 'var(--orange-500)', fontWeight: 600 }}>
                        🔔 Müşteri kaporayı gönderdi! Kontrol edin.
                      </div>
                    )}
                    <button
                      className="btn btn-green btn-shimmer"
                      onClick={() => {
                        if (ibans.length > 1) setIbanDialogOpen(true);
                        else {
                          const iban = ibans[0];
                          setSelectedIban(iban?.id ?? null);
                          openWhatsApp(`90${order.phone}`, getTemplate('tpl_kapora'));
                          dispatch({ type: 'UPDATE_ORDER', id: order.id, updates: { depositIban: iban?.id, customerNotifiedDeposit: true } });
                        }
                      }}
                    >
                      💬 Kapora İste (WhatsApp)
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => openWhatsApp(`90${order.phone}`, '')}
                    >
                      📱 Kapora Kontrol Et
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => updateStatus('hazirlaniyor')}
                    >
                      ✅ Kaporayı Onayla — Üretime Başlat
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. HAZIRLANIYOR */}
            <div className="apple-timeline-item">
              <div className={`timeline-dot ${currentIdx > 2 ? 'done' : currentIdx === 2 ? 'active' : ''}`} />
              <div className="timeline-content">
                <div className={`tracker-title ${currentIdx === 2 ? 'active' : currentIdx > 2 ? 'done' : ''}`}>Hazırlanıyor</div>
                {currentIdx === 2 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Pleksi module */}
                    <div style={{ padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🪪 Pleksi Siparişi</div>
                      <div style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 10, lineHeight: 1.5 }}>
                        <strong>{order.bride} & {order.groom}</strong><br />
                        {formatDate(order.eventDate)} · {pleksiCount} adet
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => {
                            openWhatsApp(state.settings.pleksiWhatsapp,
                              `Pleksi Siparişi\nGelin: ${order.bride}\nDamat: ${order.groom}\nTarih: ${formatDate(order.eventDate)}\nAdet: ${pleksiCount}`
                            );
                            dispatch({ type: 'UPDATE_ORDER', id: order.id, updates: { pleksiOrdered: true, pleksiOrderedAt: new Date().toISOString() } });
                          }}
                        >
                          {order.pleksiOrdered ? '✓ Pleksi Sipariş Verildi' : '📤 Pleksi Siparişi Ver'}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openWhatsApp(state.settings.pleksiWhatsapp, '')}
                        >
                          Kontrol Et
                        </button>
                      </div>
                    </div>

                    {/* Production photos */}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>📷 Hazır Ürün Fotoğrafı Ekle</div>
                      {productionPhotos.length > 0 && (
                        <div className="upload-grid" style={{ marginBottom: 8 }}>
                          {productionPhotos.map((img, i) => (
                            <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                          ))}
                        </div>
                      )}
                      <label>
                        <input type="file" accept="image/*" multiple hidden onChange={addPhoto} />
                        <span className="btn btn-outline" style={{ display: 'block', textAlign: 'center', fontSize: 13 }}>+ Fotoğraf Ekle</span>
                      </label>
                    </div>

                    <button className="btn btn-primary" onClick={() => updateStatus('hazir')}>
                      ✅ Hazırlandı — Siparişi Hazır Olarak İşaretle
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 4. HAZIR */}
            <div className="apple-timeline-item">
              <div className={`timeline-dot ${currentIdx > 3 ? 'done' : currentIdx === 3 ? 'active' : ''}`} />
              <div className="timeline-content">
                <div className={`tracker-title ${currentIdx === 3 ? 'active' : currentIdx > 3 ? 'done' : ''}`}>Hazır</div>
                {currentIdx === 3 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      className="btn btn-green btn-shimmer"
                      onClick={() => openWhatsApp(`90${order.phone}`, getTemplate('tpl_hazir'))}
                    >
                      💬 Müşteriye Bilgi Ver (WhatsApp)
                    </button>
                    <button className="btn btn-primary" onClick={() => updateStatus('teslim')}>
                      🚀 Teslim Edildi
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 5. TESLİM */}
            <div className="apple-timeline-item">
              <div className={`timeline-dot ${currentIdx === 4 ? 'done' : ''}`} />
              <div className="timeline-content last">
                <div className={`tracker-title ${currentIdx === 4 ? 'done' : ''}`}>
                  {currentIdx === 4 ? '✅ Teslim Edildi!' : 'Teslim'}
                </div>
                {currentIdx === 4 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button
                      className="btn btn-green btn-sm btn-shimmer"
                      onClick={() => openWhatsApp(`90${order.phone}`, getTemplate('tpl_teslim_fotografi'))}
                    >
                      📸 Program Fotoğrafı İste (WhatsApp)
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openWhatsApp(`90${order.phone}`, getTemplate('tpl_google'))}
                    >
                      ⭐ Google Yorumu İste
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ATÖLYE SECTION */}
        <div className="dashboard-panel-card" style={{ padding: 'var(--space-xl)', background: '#fff' }}>
          <div className="dashboard-inner-header" style={{ marginBottom: 'var(--space-md)' }}>ATÖLYE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            {/* Buket / Set */}
            <div
              style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1.5px solid var(--gray-100)', cursor: 'pointer' }}
            >
              <img
                src={order.selectedBouquet?.imageUrl ?? order.selectedSet?.imageUrl ?? ''}
                alt="Buket"
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
              />
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--nas-bordeaux)' }}>💐 Buket/Set</div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 2 }}>
                  {order.selectedBouquet?.name ?? order.selectedSet?.name ?? 'Seçilmedi'}
                </div>
                {order.roseCount > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>🌹 Anne Gülü: {order.roseCount}</div>
                )}
              </div>
            </div>

            {/* Sandık */}
            <div
              style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1.5px solid var(--gray-100)', cursor: 'pointer' }}
            >
              <img
                src={order.selectedBox?.imageUrl ?? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23f3f4f6" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-size="14">Sandık Yok</text></svg>'}
                alt="Sandık"
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
              />
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--nas-bordeaux)' }}>📦 Sandık</div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 2 }}>
                  {order.selectedBox?.name ?? 'Seçilmedi'}
                </div>
                {order.selectedLabel && (
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>🏷️ {order.selectedLabel.name}</div>
                )}
                {order.chocolateCount > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>🍫 +{order.chocolateCount} çikolata</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ORDER DETAILS */}
        <div className="dashboard-panel-card" style={{ padding: 'var(--space-xl)', background: '#fff' }}>
          <div className="dashboard-inner-header" style={{ marginBottom: 'var(--space-md)' }}>SİPARİŞ DETAYLARI</div>
          <div className="summary-section" style={{ margin: 0 }}>
            {[
              ['Sipariş No', order.id],
              ['Telefon', `+90 ${order.phone}`],
              ['Set', order.selectedSet?.name ?? (order.selectedBouquet?.name ?? 'Kendin Oluştur')],
              ['Program Tarihi', formatDate(order.eventDate)],
              ['Teslim Tarihi', formatDate(order.deliveryDate)],
            ].map(([k, v]) => (
              <div key={k} className="summary-row">
                <span className="summary-row__label">{k}</span>
                <span className="summary-row__value">{v}</span>
              </div>
            ))}
          </div>
          <div className="summary-total" style={{ marginTop: 12 }}>
            <span className="summary-total__label">Toplam / Kapora</span>
            <div>
              <div className="summary-total__amount">{formatCurrency(order.totalPrice)}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Kapora: {formatCurrency(deposit)}</div>
            </div>
          </div>
        </div>

      </div>

      {/* IBAN Select Dialog */}
      {ibanDialogOpen && (
        <div className="ios-modal-overlay" onClick={() => setIbanDialogOpen(false)}>
          <div className="ios-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-header">
              <span className="modal-title">IBAN Seçin</span>
              <button className="btn btn-icon btn-secondary" onClick={() => setIbanDialogOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ibans.map(iban => (
                <button
                  key={iban.id}
                  className={`btn ${selectedIban === iban.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textAlign: 'left', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start', padding: 14 }}
                  onClick={() => {
                    setSelectedIban(iban.id);
                    openWhatsApp(`90${order.phone}`, getTemplate('tpl_kapora'));
                    dispatch({ type: 'UPDATE_ORDER', id: order.id, updates: { depositIban: iban.id, customerNotifiedDeposit: true } });
                    setIbanDialogOpen(false);
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{iban.bankName}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{iban.holderName}</div>
                  <div style={{ fontSize: 11, opacity: 0.65, letterSpacing: '0.04em' }}>{iban.iban}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ROUTES
// ============================================================
export default function AdminOrders() {
  return (
    <Routes>
      <Route path="/" element={<OrderList />} />
      <Route path="/:id" element={<OrderDetail />} />
    </Routes>
  );
}
