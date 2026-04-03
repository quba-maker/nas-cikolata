import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import type { Order } from '../types';
import { formatDate, daysUntil, prepProgress } from '../utils/helpers';
import { formatCurrency as fc, formatCurrency, calcDeposit } from '../data/seedData';
import { openWhatsApp } from '../utils/whatsapp';
import Confetti from '../components/Confetti';

function KeynoteRevealPhoto({ src }: { src: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={`keynote-reveal-box ${revealed ? 'revealed' : ''}`} onClick={() => setRevealed(true)}>
      <div className="keynote-reveal-inner">
        {/* Front side of the 3D box */}
        <div className="keynote-reveal-front">
          <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#C9A96E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            SÜRPRİZ!
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
            Fotoğrafı Görmek İçin Dokun
          </div>
        </div>
        
        {/* Back side containing actual image */}
        <div className="keynote-reveal-back">
          <img src={src} alt="Üretim karesi" />
        </div>
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
    <div className="mobile-wrapper keynote-bg" style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-xl)',
    }}>
      <div className="animate-fade-slide-up" style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 24 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--nas-gold)', filter: 'blur(30px)', opacity: 0.2, borderRadius: '50%' }} />
          <div style={{ fontSize: 64, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.1))' }}>✨</div>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--nas-black)', letterSpacing: '-0.04em', marginBottom: 8 }}>
          Sipariş Takibi
        </h1>
        <p style={{ fontSize: 16, color: 'var(--gray-500)', fontWeight: 500 }}>
          Zarafetinizi adım adım izleyin
        </p>
      </div>

      <div className="card animate-fade-slide-up delay-100" style={{ 
        width: '100%', maxWidth: 400, padding: 'var(--space-2xl)',
        background: '#FFF', border: '1px solid rgba(0,0,0,0.05)',
        borderRadius: 32, boxShadow: '0 32px 64px rgba(0,0,0,0.08)'
      }}>
        <div className="input-group">
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>Sipariş Kodu</label>
          <input
             placeholder="Örn: AB4KL"
             value={code}
             onChange={e => setCode(e.target.value.toUpperCase())}
             maxLength={5}
             style={{ 
               width: '100%', padding: '16px', background: 'var(--gray-50)', border: '1px solid rgba(0,0,0,0.1)',
               borderRadius: 16, color: 'var(--nas-black)', fontSize: 20, fontWeight: 800, textAlign: 'center', letterSpacing: '0.2em',
               textTransform: 'uppercase', outline: 'none', transition: 'all 0.3s ease'
             }}
             onFocus={e => e.target.style.borderColor = 'var(--nas-gold)'}
             onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
          />
        </div>
        <div className="input-group" style={{ marginTop: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'block' }}>Telefon Numarası</label>
          <div style={{ display: 'flex', background: 'var(--gray-50)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, overflow: 'hidden' }}>
            <span style={{ padding: '16px', fontSize: 16, fontWeight: 700, color: 'var(--gray-500)', background: 'var(--gray-50)' }}>+90</span>
            <input
              type="tel"
              placeholder="5XX XXX XX XX"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={{
                flex: 1, padding: '16px', background: 'transparent', border: 'none',
                color: 'var(--nas-black)', fontSize: 18, fontWeight: 600, outline: 'none', width: '100%'
              }}
            />
          </div>
        </div>
        {error && <div className="form-error" style={{ marginBottom: 16, marginTop: 16, background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: 12, borderRadius: 12 }}>⚠️ {error}</div>}
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

  // Auto scroll to active keynote card vertically
  useEffect(() => {
    const list = document.querySelector('.keynote-carousel');
    const active = document.querySelector('.keynote-card.active');
    if (list && active) {
      setTimeout(() => {
        active.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [currentIdx]);

  return (
    <div className="mobile-wrapper keynote-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      
      {/* KEYNOTE HEADER */}
      <div style={{ padding: 'var(--space-2xl) var(--space-xl) 0', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--nas-bordeaux)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 800 }}>
          Nas Özel Koleksiyon
        </div>
        <h1 className="text-shimmer-gold" style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 12 }}>
          Mükemmellik <br />Hazırlanıyor.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--gray-500)', maxWidth: 280, margin: '0 auto' }}>
          <strong style={{ color: 'var(--nas-black)' }}>{order.bride} & {order.groom}</strong> için sipariş süreci
        </p>

        <div style={{ marginTop: 24, display: 'inline-flex', gap: 16, background: '#FFF', borderRadius: 999, padding: '8px 16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 12, color: 'var(--gray-600)' }}><span style={{ color: 'var(--nas-bordeaux)', marginRight: 4, fontWeight: 700 }}>Program</span>{formatDate(order.eventDate)}</div>
          <div style={{ width: 1, background: 'rgba(0,0,0,0.1)' }} />
          <div style={{ fontSize: 12, color: 'var(--gray-600)' }}><span style={{ color: 'var(--nas-bordeaux)', marginRight: 4, fontWeight: 700 }}>Teslim</span>{formatDate(order.deliveryDate)}</div>
        </div>
      </div>

      {/* HAUTE COUTURE PROGRESS TIMELINE */}
      <div style={{ marginTop: 24, position: 'relative', zIndex: 10 }}>
        <div className="couture-container">
          
          {/* Dynamic liquid gold line connecting the steps */}
          {/* Top is 60px padding, each step is approx 110px. Let's calculate height based on currentIdx */}
          <div 
            className="couture-progress-line" 
            style={{ height: `${currentIdx * 128}px` }} 
          />
          
          {/* STEP 1: Onay */}
          <div className={`couture-item ${currentIdx === 0 ? 'active' : currentIdx > 0 ? 'done' : ''}`} onClick={(e) => e.currentTarget.scrollIntoView({behavior: 'smooth', block: 'center'})}>
            <div className="couture-icon-wrapper">{currentIdx > 0 ? '✓' : '1'}</div>
            <div className="couture-title">{currentIdx > 0 ? 'Onaylandı' : 'Onay Bekleniyor'}</div>
            <div className="couture-desc">Sipariş alındı. Detaylar inceleniyor, kısa süre içerisinde işleme alınacak.</div>
          </div>

          {/* STEP 2: Kapora */}
          <div className={`couture-item ${currentIdx === 1 ? 'active' : currentIdx > 1 ? 'done' : ''}`} onClick={(e) => e.currentTarget.scrollIntoView({behavior: 'smooth', block: 'center'})}>
            <div className="couture-icon-wrapper">{currentIdx > 1 ? '✓' : '2'}</div>
            <div className="couture-title">{currentIdx > 1 ? 'Kapora Alındı' : currentIdx === 1 ? 'Ödeme Bekleniyor' : 'Kapora'}</div>
            <div className="couture-desc">
              {currentIdx > 1 
                ? 'Ödemeniz başarıyla tarafımıza ulaştı.'
                : 'Siparişin üretime girmesi için kapora işleminin tamamlanması gerekmektedir.'}
            </div>
            {currentIdx === 1 && !customerSent && iban && (
              <div style={{ marginTop: 24, padding: '16px', background: 'var(--gray-50)', borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Ödeme Bilgileri</div>
                <CopyField label="Ad Soyad" value={iban.holderName} />
                <CopyField label="IBAN" value={iban.iban} />
                <div style={{ marginTop: 16, padding: '12px', background: '#FFF', borderRadius: 16, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Toplam: {formatCurrency(order.totalPrice)}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--nas-bordeaux)', marginTop: 4 }}>Kapora: {formatCurrency(deposit)}</div>
                </div>
                <button
                  className="btn-luxury-shimmer"
                  onClick={(e) => { e.stopPropagation(); handleCustomerSentDeposit(); }}
                  style={{ width: '100%', marginTop: 16, padding: 16, borderRadius: 999, border: 'none', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}
                >
                  Gönderdim
                </button>
              </div>
            )}
            {currentIdx === 1 && customerSent && (
              <div style={{ marginTop: 20, padding: 16, background: 'var(--nas-cream)', borderRadius: 16, textAlign: 'center', border: '1px solid rgba(201,169,110,0.2)' }}>
                <span className="animate-pulse" style={{ display: 'inline-block', fontSize: 24, marginBottom: 8 }}>⏳</span>
                <div style={{ fontSize: 13, color: 'var(--nas-bordeaux)' }}>Dekont inceleniyor, onaylandığında bilgilendirileceksiniz.</div>
              </div>
            )}
          </div>

          {/* STEP 3: Hazırlanıyor */}
          <div className={`couture-item ${currentIdx === 2 ? 'active' : currentIdx > 2 ? 'done' : ''}`} onClick={(e) => e.currentTarget.scrollIntoView({behavior: 'smooth', block: 'center'})}>
            <div className="couture-icon-wrapper">{currentIdx > 2 ? '✓' : '3'}</div>
            <div className="couture-title">{currentIdx > 2 ? 'Hazırlandı' : 'Tasarım Sürecinde'}</div>
            <div className="couture-desc">
              Siparişiniz atölyemizde özenle hayat buluyor.
              {currentIdx === 2 && (
                <div style={{ marginTop: 16 }}>
                  <PrepProgressBar eventDate={order.eventDate} />
                </div>
              )}
            </div>
          </div>

          {/* STEP 4: Hazır (Gizemli Kutulu) */}
          <div className={`couture-item ${currentIdx === 3 ? 'active' : currentIdx > 3 ? 'done' : ''}`} onClick={(e) => e.currentTarget.scrollIntoView({behavior: 'smooth', block: 'center'})}>
            <div className="couture-icon-wrapper">{currentIdx > 3 ? '✓' : '4'}</div>
            <div className="couture-title">{currentIdx > 3 ? 'Ayrıldı' : 'Teslime Hazır'}</div>
            <div className="couture-desc">
              Tüm hazırlıklar tamamlandı. Bu kusursuzluk sizi bekliyor.
              {currentIdx === 3 && (
                <div style={{ marginTop: 16 }}>
                  <Confetti active />
                  {order.productionPhotos.map((img, i) => (
                    <KeynoteRevealPhoto key={i} src={img} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* STEP 5: Teslim (Bambaşka Son) */}
          <div className={`couture-item ${currentIdx === 4 ? 'active' : ''}`} onClick={(e) => e.currentTarget.scrollIntoView({behavior: 'smooth', block: 'center'})}>
            <div className="couture-icon-wrapper" style={{ borderColor: currentIdx === 4 ? '#22c55e' : '', color: currentIdx === 4 ? '#22c55e' : '' }}>5</div>
            <div className="couture-title" style={{ color: currentIdx === 4 ? '#22c55e' : '' }}>Kusursuz Bir Son.</div>
            <div className="couture-desc">Siparişiniz başarıyla teslim edildi. En güzel anılarınızda yer almak bizim için bir lükstü.</div>
            
            {currentIdx === 4 && (
              <div style={{ marginTop: 32, cursor: 'default' }} onClick={e => e.stopPropagation()}>
                {/* Yorumlar Apple Tarzı */}
                <div style={{ background: '#FFF', borderRadius: 24, padding: 24, textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)', marginBottom: 24, boxShadow: '0 8px 16px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>⭐️</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--nas-black)', marginBottom: 8 }}>Google Değerlendirmesi</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 16 }}>Deneyimlerinizi paylaşarak bize güç verin.</div>
                  <a href={state.settings.googleReviewUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: 'var(--gray-50)', color: '#4285F4', padding: '12px 24px', borderRadius: 999, fontWeight: 800, textDecoration: 'none', fontSize: 13, border: '1px solid rgba(66, 133, 244, 0.2)' }}>
                    Değerlendirme Yap
                  </a>
                </div>

                {/* Fotoğraf Yükleme Apple Lansman Tarzı */}
                <div style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.05), rgba(201,169,110,0.02))', borderRadius: 24, padding: 24, textAlign: 'center', border: '1px solid rgba(201,169,110,0.15)' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📸</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--nas-bordeaux)', marginBottom: 8 }}>Anı Bekliyoruz</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 16 }}>Söz/Nişan töreninizden profesyonel bir kare paylaşmak ister misiniz?</div>
                  {photoFiles.length > 0 && (
                    <div className="upload-grid" style={{ marginBottom: 16 }}>
                      {photoFiles.map((img, i) => (
                        <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                      ))}
                    </div>
                  )}
                  <label style={{ display: 'block' }}>
                    <input type="file" accept="image/*" multiple hidden onChange={addPhoto} />
                    <span className="btn-luxury-shimmer" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 999, color: '#FFF', fontWeight: 800, fontSize: 13, cursor: 'pointer', border: 'none' }}>
                      Fotoğraf Ekle
                    </span>
                  </label>
                </div>
              </div>
            )}
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

