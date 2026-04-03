import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import type { Order } from '../types';
import { formatDate, daysUntil, prepProgress } from '../utils/helpers';
import { formatCurrency as fc, formatCurrency, calcDeposit } from '../data/seedData';
import { openWhatsApp } from '../utils/whatsapp';
import Confetti from '../components/Confetti';

// ============================================================
// MYSTERIOUS PHOTO REVEAL COMPONENT
// ============================================================
function BlurRevealPhoto({ src }: { src: string }) {
  const [revealed, setRevealed] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isHolding && !revealed) {
      timer = setTimeout(() => {
        setRevealed(true);
      }, 600); // 600ms hold to unlock
    }
    return () => clearTimeout(timer);
  }, [isHolding, revealed]);

  return (
    <div 
      className={`mysterious-photo-container ${revealed ? 'revealed' : ''}`}
      onMouseDown={() => setIsHolding(true)}
      onMouseUp={() => setIsHolding(false)}
      onMouseLeave={() => setIsHolding(false)}
      onTouchStart={() => setIsHolding(true)}
      onTouchEnd={() => setIsHolding(false)}
      style={{ marginBottom: 16 }}
    >
      <img src={src} className="real-img" alt="" />
      
      <div className="mysterious-glass">
        <div className="mysterious-lock-icon">✨</div>
        <div className="mysterious-text">Siparişinizden Bir Kare</div>
        <div className="mysterious-subtext">Büyüyü Bozmak İçin Basılı Tut</div>
      </div>
    </div>
  );
}

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
      background: 'radial-gradient(ellipse at top, var(--nas-bordeaux-3) 0%, var(--nas-black) 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-xl)',
    }}>
      <div className="animate-fade-slide-up" style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 24 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--nas-gold)', filter: 'blur(30px)', opacity: 0.3, borderRadius: '50%' }} />
          <div style={{ fontSize: 64, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))' }}>✨</div>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', marginBottom: 8, textShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
          Sipariş Takibi
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
          Zarafetinizi adım adım izleyin
        </p>
      </div>

      <div className="card animate-fade-slide-up delay-100" style={{ 
        width: '100%', maxWidth: 400, padding: 'var(--space-2xl)',
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 32, boxShadow: '0 32px 64px rgba(0,0,0,0.4)'
      }}>
        <div className="input-group">
          <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>Sipariş Kodu</label>
          <input
             placeholder="Örn: AB4KL"
             value={code}
             onChange={e => setCode(e.target.value.toUpperCase())}
             maxLength={5}
             style={{ 
               width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
               borderRadius: 16, color: '#FFF', fontSize: 20, fontWeight: 800, textAlign: 'center', letterSpacing: '0.2em',
               textTransform: 'uppercase', outline: 'none', transition: 'all 0.3s ease'
             }}
             onFocus={e => e.target.style.borderColor = 'var(--nas-gold)'}
             onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
        <div className="input-group" style={{ marginTop: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>Telefon Numarası</label>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
            <span style={{ padding: '16px', fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.2)' }}>+90</span>
            <input
              type="tel"
              placeholder="5XX XXX XX XX"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={{
                flex: 1, padding: '16px', background: 'transparent', border: 'none',
                color: '#FFF', fontSize: 18, fontWeight: 600, outline: 'none', width: '100%'
              }}
            />
          </div>
        </div>
        {error && <div className="form-error" style={{ marginBottom: 16, marginTop: 16, background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', padding: 12, borderRadius: 12 }}>⚠️ {error}</div>}
        <button
          className="btn-luxury-shimmer"
          disabled={code.length < 5 || phone.length < 10}
          onClick={() => onLogin(code, phone)}
          style={{ width: '100%', marginTop: 32, padding: '18px', borderRadius: 999, fontSize: 16, fontWeight: 800, border: 'none', color: '#FFF', opacity: (code.length < 5 || phone.length < 10) ? 0.5 : 1, cursor: (code.length < 5 || phone.length < 10) ? 'not-allowed' : 'pointer' }}
        >
          Devam Et
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

      <div style={{ padding: 'var(--space-md)', marginTop: -32, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Status Tracker */}
        <div style={{ padding: 'var(--space-2xl) var(--space-md) var(--space-xl)', background: '#FFF', borderRadius: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.06)' }}>
          <div className="cinematic-timeline">

            {/* STEP 1: Onay */}
            <div className={`cinematic-node ${currentIdx > 0 ? 'done' : currentIdx === 0 ? 'active' : ''}`}>
              <div className="cinematic-icon-box">
                {currentIdx > 0 ? '✓' : '1'}
              </div>
              <div className="cinematic-content">
                <div style={{ fontSize: 18, fontWeight: 800, color: currentIdx >= 0 ? 'var(--nas-black)' : 'var(--gray-400)', marginBottom: 4 }}>
                  {currentIdx > 0 ? '✅ Sipariş Onaylandı' : 'Onay Bekleniyor'}
                </div>
                <div style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.5 }}>
                  {currentIdx === 0
                    ? 'Siparişiniz incelenip en kısa sürede onaylanacaktır.'
                    : 'Siparişiniz onaylandı!'}
                </div>
              </div>
            </div>

            {/* STEP 2: Kapora */}
            <div className={`cinematic-node ${currentIdx > 1 ? 'done' : currentIdx === 1 ? 'active' : ''}`}>
              <div className="cinematic-icon-box">
                {currentIdx > 1 ? '✓' : '2'}
              </div>
              <div className="cinematic-content">
                <div style={{ fontSize: 18, fontWeight: 800, color: currentIdx >= 1 ? 'var(--nas-black)' : 'var(--gray-400)', marginBottom: 4 }}>
                  {currentIdx > 1 ? '✅ Kapora Alındı' : currentIdx === 1 ? 'Kapora Bekleniyor' : 'Kapora'}
                </div>
                <div style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.5 }}>
                  {currentIdx === 1 && !customerSent && iban && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
                        Lütfen aşağıdaki hesaba kapora gönderin:
                      </div>
                      <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)' }}>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>{iban.bankName}</div>
                        <CopyField label="Ad Soyad" value={iban.holderName} />
                        <CopyField label="IBAN" value={iban.iban} />
                        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--nas-cream)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 4 }}>Toplam: <strong>{formatCurrency(order.totalPrice)}</strong></div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--nas-bordeaux)' }}>
                            Kapora (%{Math.round(state.settings.depositRate * 100)}): {formatCurrency(deposit)}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-primary w-full"
                        style={{ marginTop: 16, padding: '14px', borderRadius: 999 }}
                        onClick={handleCustomerSentDeposit}
                      >
                        💸 Kaporayı Gönderdim
                      </button>
                    </div>
                  )}
                  {currentIdx === 1 && customerSent && (
                    <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--orange-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--orange-500)', fontWeight: 600 }}>
                      ⏳ Kapora kontrol ediliyor, onaylandığında bilgilendirileceksiniz.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 3: Hazırlanıyor */}
            <div className={`cinematic-node ${currentIdx > 2 ? 'done' : currentIdx === 2 ? 'active' : ''}`}>
               <div className="cinematic-icon-box">
                {currentIdx > 2 ? '✓' : '3'}
              </div>
              <div className="cinematic-content">
                <div style={{ fontSize: 18, fontWeight: 800, color: currentIdx >= 2 ? 'var(--nas-black)' : 'var(--gray-400)', marginBottom: 4 }}>
                  {currentIdx > 2 ? '✅ Sipariş Hazırlandı' : 'Sipariş Hazırlanıyor'}
                </div>
                <div style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.5 }}>
                  {currentIdx === 2 && <PrepProgressBar eventDate={order.eventDate} />}
                </div>
              </div>
            </div>

            {/* STEP 4: Hazır */}
            <div className={`cinematic-node ${currentIdx > 3 ? 'done' : currentIdx === 3 ? 'active' : ''}`}>
              <div className="cinematic-icon-box">
                {currentIdx > 3 ? '✓' : '4'}
              </div>
              <div className="cinematic-content">
                <div style={{ fontSize: 18, fontWeight: 800, color: currentIdx >= 3 ? 'var(--nas-black)' : 'var(--gray-400)', marginBottom: 4 }}>
                  {currentIdx > 3 ? '✅ Teslim Edildi' : currentIdx === 3 ? '🎉 Siparişiniz Hazır!' : 'Siparişiniz Hazırlandı'}
                </div>
                <div style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.5 }}>
                  {currentIdx === 3 && (
                    <>
                      <Confetti active />
                      <div style={{ marginTop: 8, fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>
                        Siparişinizi özenle hazırladık 🎀<br />
                        Mesai saatleri içinde veya belirlediğiniz tarihte teslim alabilirsiniz.
                      </div>
                      
                      {/* Mysterious Photo Reveal if photos exist */}
                      {order.productionPhotos.length > 0 && (
                        <div style={{ marginTop: 24 }}>
                           {order.productionPhotos.map((img, i) => (
                              <BlurRevealPhoto key={i} src={img} />
                           ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 5: Teslim */}
            <div className={`cinematic-node ${currentIdx === 4 ? 'done' : ''}`}>
              <div className="cinematic-icon-box">
                {currentIdx === 4 ? '✓' : '5'}
              </div>
              <div className="cinematic-content" style={{ opacity: currentIdx === 4 ? 1 : 0.4 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: currentIdx === 4 ? 'var(--green-600)' : 'var(--gray-400)', marginBottom: 4 }}>
                  {currentIdx === 4 ? '🥳 Siparişiniz Teslim Edildi!' : 'Teslim'}
                </div>
                <div style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.5 }}>
                  {currentIdx === 4 && (
                    <div style={{ marginTop: 12 }}>
                      <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 20 }}>
                        Programınız için sonsuz mutluluklar dileriz! 💕 En güzel anılarınızı biriktirmeniz dileğiyle.
                      </p>

                      {/* Premium Program photo upload */}
                      <div style={{ background: '#F5F5F7', padding: 'var(--space-md)', borderRadius: 24, textAlign: 'center', marginBottom: 24 }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6, color: 'var(--nas-black)' }}>
                          Söz/Nişan Anısından Bir Kare?
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16, lineHeight: 1.4 }}>
                          Gelecekteki çiftlerimize ilham kaynağı olmanız için programdan bir fotoğraf yollar mısınız?
                        </p>
                        
                        {photoFiles.length > 0 && (
                          <div className="upload-grid" style={{ marginBottom: 16 }}>
                            {photoFiles.map((img, i) => (
                              <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                            ))}
                          </div>
                        )}
                        <label style={{ display: 'block' }}>
                          <input type="file" accept="image/*" multiple hidden onChange={addPhoto} />
                          <span className="btn-luxury-shimmer" style={{ display: 'inline-flex', padding: '12px 24px', borderRadius: 999, color: '#FFF', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Fotoğraf Yükle</span>
                        </label>
                      </div>

                      {/* Apple Style Google review */}
                      <div style={{ padding: 'var(--space-md)', background: '#FFF', border: '1px solid var(--gray-200)', borderRadius: 24, textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.03)' }}>
                        <div style={{ fontSize: 32, marginBottom: 4 }}>⭐</div>
                        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em', color: 'var(--nas-black)' }}>Bizi Değerlendirin</div>
                        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>Deneyiminiz Google'da yazın.</div>
                        <a
                          href={state.settings.googleReviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block', background: '#F5F5F7', color: '#4285F4', padding: '10px 24px', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: 14, border: '1px solid rgba(66, 133, 244, 0.2)'
                          }}
                        >
                          Değerlendirme Yaz
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
