import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import type { Order } from '../types';
import { formatDate, daysUntil, prepProgress } from '../utils/helpers';
import { formatCurrency as fc, formatCurrency, calcDeposit } from '../data/seedData';
import { openWhatsApp } from '../utils/whatsapp';
import Confetti from '../components/Confetti';

// ============================================================
// LOGIN SCREEN
// ============================================================
function TrackingLogin({ onLogin, error }: { onLogin: (code: string, phone: string) => void; error: string }) {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nas_customer_info');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.lastOrderId) setCode(p.lastOrderId);
        if (p.phone) setPhone(p.phone);
      }
    } catch(e) {}
  }, []);

  return (
    <div className="mobile-wrapper" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--nas-bordeaux-3) 0%, var(--nas-bordeaux) 60%, var(--nas-bordeaux-2) 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-xl)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎀</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', marginBottom: 8 }}>
          Sipariş Takibi
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)' }}>
          Siparişinizi adım adım izleyin
        </p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 'var(--space-xl)' }}>
        <div className="input-group">
          <label className="input-label">Sipariş Kodu</label>
          <input
            className="input-field"
            placeholder="Örn: AB4KL"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={5}
            style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 20, fontWeight: 700, textAlign: 'center' }}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Telefon Numarası</label>
          <div className="input-prefix">
            <span className="input-prefix__tag">+90</span>
            <input
              type="tel"
              placeholder="5XX XXX XX XX"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </div>
        </div>
        {error && <div className="form-error" style={{ marginBottom: 12 }}>⚠️ {error}</div>}
        <button
          className="btn btn-primary w-full btn-lg"
          disabled={code.length < 5 || phone.length < 10}
          onClick={() => onLogin(code, phone)}
        >
          Siparişimi Göster 🔍
        </button>
      </div>
    </div>
  );
}

// ============================================================
// COPY FIELD
// ============================================================
function CopyField({ label, value }: { label?: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>}
      <div className="copy-field">
        <span className="copy-field__value">{value}</span>
        <button className="copy-field__btn" onClick={copy}>{copied ? '✓ Kopyalandı' : 'Kopyala'}</button>
      </div>
    </div>
  );
}

// ============================================================
// PREPARATION PROGRESS BAR
// ============================================================
function PrepProgressBar({ eventDate }: { eventDate: string }) {
  const pct = prepProgress(eventDate);
  const label =
    pct < 6 ? 'Hazırlık başlıyor…' :
    pct < 81 ? 'Siparişinizi özenle hazırlıyoruz 🎀' :
    'Son dokunuşlar yapılıyor ✨';

  return (
    <div style={{ padding: 'var(--space-md)', background: 'var(--nas-rose-light)', borderRadius: 'var(--radius-xl)', marginTop: 'var(--space-md)' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 10, fontSize: 13, fontWeight: 600, color: 'var(--nas-bordeaux)' }}>
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="prep-bar-track">
        <div className="prep-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ============================================================
// TRACKER VIEW
// ============================================================
const STATUS_ORDER = ['onay', 'kapora', 'hazirlaniyor', 'hazir', 'teslim'] as const;
const STATUS_IDX = { onay: 0, kapora: 1, hazirlaniyor: 2, hazir: 3, teslim: 4 };

function TrackerView({ order }: { order: Order }) {
  const { state, updateOrder } = useApp();
  const navigate = useNavigate();
  const [customerSent, setCustomerSent] = useState(order.customerSentDeposit);
  const [photoFiles, setPhotoFiles] = useState<string[]>(order.programPhotos);

  const currentIdx = STATUS_IDX[order.status];
  const deposit = calcDeposit(order.totalPrice, state.settings.depositRate);
  const iban = state.settings.ibans.find(i => i.isDefault) ?? state.settings.ibans[0];

  const handleCustomerSentDeposit = () => {
    setCustomerSent(true);
    updateOrder(order.id, { customerSentDeposit: true });
  };

  const addPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    Promise.all(files.map(f => new Promise<string>(res => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(f);
    }))).then(imgs => {
      const updated = [...photoFiles, ...imgs];
      setPhotoFiles(updated);
      updateOrder(order.id, { programPhotos: updated });
    });
  };

  return (
    <div className="mobile-wrapper" style={{ minHeight: '100vh', background: 'var(--nas-cream)' }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, var(--nas-bordeaux-3), var(--nas-bordeaux))',
        padding: 'var(--space-xl) var(--space-lg) var(--space-2xl)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.60)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>
          Merhaba 💕
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 6 }}>
          {order.bride} & {order.groom}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.70)' }}>
          Siparişinizi adım adım izleyebilirsiniz
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: 999, fontSize: 13, color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            📅 Program: {formatDate(order.eventDate)}
          </span>
          <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: 999, fontSize: 13, color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            🚀 Teslim: {formatDate(order.deliveryDate)}
          </span>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.50)' }}>
          Sipariş No: {order.id}
        </div>
        </div>
      </div>

      <div style={{ padding: 'var(--space-lg)', marginTop: -24, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Status Tracker */}
        <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
          <div className="order-tracker">

            {/* STEP 1: Onay */}
            <div className="tracker-item">
              <div className="tracker-left">
                <div className={`tracker-dot ${currentIdx > 0 ? 'done' : currentIdx === 0 ? 'active spin' : ''}`}>
                  {currentIdx > 0 ? '✓' : '1'}
                </div>
                {currentIdx > 0 ? <div className="tracker-line done" /> : <div className="tracker-line" />}
              </div>
              <div className="tracker-content">
                <div className={`tracker-title ${currentIdx === 0 ? 'active' : currentIdx > 0 ? 'done' : ''}`}>
                  {currentIdx > 0 ? '✅ Sipariş Onaylandı' : 'Onay Bekleniyor'}
                </div>
                <div className="tracker-desc">
                  {currentIdx === 0
                    ? 'Siparişiniz incelenip en kısa sürede onaylanacaktır.'
                    : 'Siparişiniz onaylandı!'}
                </div>
              </div>
            </div>

            {/* STEP 2: Kapora */}
            <div className="tracker-item">
              <div className="tracker-left">
                <div className={`tracker-dot ${currentIdx > 1 ? 'done' : currentIdx === 1 ? 'active spin' : ''}`}>
                  {currentIdx > 1 ? '✓' : '2'}
                </div>
                {currentIdx > 1 ? <div className="tracker-line done" /> : <div className="tracker-line" />}
              </div>
              <div className="tracker-content">
                <div className={`tracker-title ${currentIdx === 1 ? 'active' : currentIdx > 1 ? 'done' : ''}`}>
                  {currentIdx > 1 ? '✅ Kapora Alındı' : currentIdx === 1 ? 'Kapora Bekleniyor' : 'Kapora'}
                </div>
                <div className="tracker-desc">
                  {currentIdx === 1 && !customerSent && iban && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
                        Lütfen aşağıdaki hesaba kapora gönderin:
                      </div>
                      <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)' }}>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>{iban.bankName}</div>
                        <CopyField label="Ad Soyad" value={iban.holderName} />
                        <CopyField label="IBAN" value={iban.iban} />
                        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--nas-rose-light)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 4 }}>Toplam: <strong>{formatCurrency(order.totalPrice)}</strong></div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--nas-bordeaux)' }}>
                            Kapora (%{Math.round(state.settings.depositRate * 100)}): {formatCurrency(deposit)}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-primary w-full"
                        style={{ marginTop: 12 }}
                        onClick={handleCustomerSentDeposit}
                      >
                        💸 Kaporayı Gönderdim, Dekont Attım
                      </button>
                    </div>
                  )}
                  {currentIdx === 1 && customerSent && (
                    <div style={{ marginTop: 6, padding: '10px 14px', background: 'var(--orange-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--orange-500)', fontWeight: 600 }}>
                      ⏳ Kapora kontrol ediliyor, onaylandığında bilgilendirileceksiniz.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 3: Hazırlanıyor */}
            <div className="tracker-item">
              <div className="tracker-left">
                <div className={`tracker-dot ${currentIdx > 2 ? 'done' : currentIdx === 2 ? 'active spin' : ''}`}>
                  {currentIdx > 2 ? '✓' : '3'}
                </div>
                {currentIdx > 2 ? <div className="tracker-line done" /> : <div className="tracker-line" />}
              </div>
              <div className="tracker-content">
                <div className={`tracker-title ${currentIdx === 2 ? 'active' : currentIdx > 2 ? 'done' : ''}`}>
                  {currentIdx > 2 ? '✅ Sipariş Hazırlandı' : 'Sipariş Hazırlanıyor'}
                </div>
                <div className="tracker-desc">
                  {currentIdx === 2 && <PrepProgressBar eventDate={order.eventDate} />}
                </div>
              </div>
            </div>

            {/* STEP 4: Hazır */}
            <div className="tracker-item">
              <div className="tracker-left">
                <div className={`tracker-dot ${currentIdx > 3 ? 'done' : currentIdx === 3 ? 'active' : ''}`}>
                  {currentIdx > 3 ? '✓' : '4'}
                </div>
                {currentIdx > 3 ? <div className="tracker-line done" /> : <div className="tracker-line" />}
              </div>
              <div className="tracker-content">
                <div className={`tracker-title ${currentIdx === 3 ? 'active' : currentIdx > 3 ? 'done' : ''}`}>
                  {currentIdx > 3 ? '✅ Teslim Edildi' : currentIdx === 3 ? '🎉 Siparişiniz Hazır!' : 'Siparişiniz Hazırlandı'}
                </div>
                <div className="tracker-desc">
                  {currentIdx === 3 && (
                    <>
                      <Confetti active />
                      <div style={{ marginTop: 8, fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>
                        Siparişinizi özenle hazırladık 🎀<br />
                        Mesai saatleri içinde veya belirlediğiniz tarihte teslim alabilirsiniz.<br />
                        <em style={{ color: 'var(--gray-400)', fontSize: 12 }}>Fotoğraflara bakmayı unutmayın 📸</em>
                      </div>
                      {/* Production photos */}
                      {order.productionPhotos.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nas-bordeaux)', marginBottom: 8 }}>Hazırlık Fotoğrafları</div>
                          <div className="upload-grid">
                            {order.productionPhotos.map((img, i) => (
                              <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 5: Teslim */}
            <div className="tracker-item">
              <div className="tracker-left">
                <div className={`tracker-dot ${currentIdx === 4 ? 'done' : ''}`}>
                  {currentIdx === 4 ? '✓' : '5'}
                </div>
              </div>
              <div className="tracker-content last">
                <div className={`tracker-title ${currentIdx === 4 ? 'done' : ''}`}>
                  {currentIdx === 4 ? '✅ Siparişiniz Teslim Edildi! 🥳' : 'Teslim'}
                </div>
                <div className="tracker-desc">
                  {currentIdx === 4 && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 12 }}>
                        Programınız için sonsuz mutluluklar dileriz! 💕
                      </p>

                      {/* Program photo upload */}
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--gray-700)' }}>
                        📷 Programdan fotoğraf gönderir misiniz?
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 10, lineHeight: 1.5 }}>
                        Gelecekteki çiftlerimize ilham kaynağı olur 🌸
                      </p>
                      {photoFiles.length > 0 && (
                        <div className="upload-grid" style={{ marginBottom: 10 }}>
                          {photoFiles.map((img, i) => (
                            <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                          ))}
                        </div>
                      )}
                      <label style={{ display: 'block' }}>
                        <input type="file" accept="image/*" multiple hidden onChange={addPhoto} />
                        <span className="btn btn-outline" style={{ display: 'block', textAlign: 'center' }}>+ Fotoğraf Ekle</span>
                      </label>

                      {/* Google review */}
                      <div style={{ marginTop: 16, padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>⭐⭐⭐⭐⭐</div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Bizi Değerlendirin</div>
                        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>Google yorumunuz bizim için çok değerli!</div>
                        <a
                          href={state.settings.googleReviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          Google'da Yorum Yaz ⭐
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Fixed bottom */}
      <div className="price-bar" style={{ gap: 'var(--space-sm)' }}>
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ flex: 1 }}
        >
          📍 Konuma Git
        </a>
        <button
          className="btn btn-green"
          style={{ flex: 1 }}
          onClick={() => openWhatsApp(state.settings.firmWhatsapp, `Merhaba, Sipariş No: ${order.id} hakkında bilgi almak istiyorum.`)}
        >
          💬 WhatsApp
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function OrderTracking() {
  const { state } = useApp();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  // Pre-fill from URL params or localStorage
  useEffect(() => {
    const code = searchParams.get('code');
    const phoneParam = searchParams.get('phone');

    if (code && phoneParam) {
      const found = state.orders.find(o => o.id === code && o.phone === phoneParam);
      if (found) setOrder(found);
      return;
    }

    try {
      const saved = localStorage.getItem('nas_customer_info');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.lastOrderId && p.phone) {
           const found = state.orders.find(o => o.id === p.lastOrderId && o.phone === p.phone);
           if (found) setOrder(found);
        }
      }
    } catch(e) {}
  }, [searchParams, state.orders]);

  // Re-sync order when state changes
  useEffect(() => {
    if (order) {
      const updated = state.orders.find(o => o.id === order.id);
      if (updated) setOrder(updated);
    }
  }, [state.orders]);

  const handleLogin = (code: string, phone: string) => {
    const found = state.orders.find(o => o.id === code && o.phone === phone);
    if (found) {
      setOrder(found);
      setError('');
    } else {
      setError('Sipariş bulunamadı. Kodu ve telefon numaranızı kontrol edin.');
    }
  };

  if (!order) return <TrackingLogin onLogin={handleLogin} error={error} />;
  return <TrackerView order={order} />;
}
