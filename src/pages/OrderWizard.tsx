import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import type { Order, Product, OrderExtra } from '../types';
import { generateOrderCode, formatCurrency } from '../data/seedData';
import { today, addDays, daysUntil, formatDate } from '../utils/helpers';
import StepBar from '../components/StepBar';
import PriceBar from '../components/PriceBar';
import ProductCarousel from '../components/ProductCarousel';
import ProductCard from '../components/ProductCard';
import Calendar from '../components/Calendar';
import GalleryModal from '../components/GalleryModal';
import Confetti from '../components/Confetti';

// ============================================================
// WIZARD STATE
// ============================================================
interface WizardState {
  mode: 'menu' | 'set-order' | 'custom-order';
  categoryId: string;

  // Step tracking
  step: number;

  // Customer info
  bride: string;
  groom: string;
  phone: string;
  eventDate: string;
  deliveryDate: string;

  // Selected products
  selectedSet?: Product;
  selectedBouquet?: Product;
  selectedBox?: Product;
  selectedLabel?: Product;
  selectedAnneGulu?: Product;
  selectedKahveYani?: Product;
  customLabelImages: string[];

  // Quantities
  chocolateCount: number;
  roseCount: number;

  // Bouquet builder
  bouquetKind?: 'buket' | 'kutu';
  bouquetSubType?: string;
  wantBouquet: boolean;
  wantBox: boolean;
  showNoBouquetConfirm: boolean;
}

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 15);
const eventD = tomorrow.toISOString().split('T')[0];
const deliveryD = new Date(tomorrow);
deliveryD.setDate(tomorrow.getDate() - 3);
const delivD = deliveryD.toISOString().split('T')[0];

const brides = ['Merve', 'Zeynep', 'Elif', 'Ayşe', 'Selin', 'Büşra', 'Ceren'];
const grooms = ['Can', 'Burak', 'Ahmet', 'Mehmet', 'Emre', 'Oğuz', 'Kerem'];
const randomBride = () => brides[Math.floor(Math.random() * brides.length)];
const randomGroom = () => grooms[Math.floor(Math.random() * grooms.length)];
const randomPhone = () => '5' + Math.floor(Math.random() * 900000000 + 100000000).toString();

let savedPhone = randomPhone();
let savedBride = randomBride();
let savedGroom = randomGroom();
try {
  const saved = localStorage.getItem('nas_customer_info');
  if (saved) {
    const p = JSON.parse(saved);
    if (p.bride) savedBride = p.bride;
    if (p.groom) savedGroom = p.groom;
    if (p.phone) savedPhone = p.phone;
  }
} catch (e) {}

const initWizard: WizardState = {
  mode: 'menu',
  categoryId: '',
  step: 0,
  bride: savedBride, groom: savedGroom, phone: savedPhone, eventDate: eventD, deliveryDate: delivD,
  customLabelImages: [],
  chocolateCount: 0, roseCount: 0,
  wantBouquet: true, wantBox: true,
  showNoBouquetConfirm: false,
};

// ============================================================
// CATEGORY CARD
// ============================================================
function CategoryCard({ cat, onClick }: { cat: { id: string; name: string; description: string; imageUrl: string; coverText?: string }; onClick: () => void }) {
  return (
    <div className="glass-block card-interactive" onClick={onClick} style={{
      border: '1px solid rgba(255,255,255,0.6)',
      overflow: 'hidden', cursor: 'pointer', position: 'relative', minHeight: 220,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <img src={cat.imageUrl} alt={cat.name} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(74,18,40,0.92) 0%, rgba(74,18,40,0.3) 60%, transparent 100%)',
      }} />
      <div style={{ position: 'relative', padding: 'var(--space-lg)' }}>
        {cat.coverText && (
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            color: 'var(--nas-gold)', marginBottom: 6,
          }}>{cat.coverText}</span>
        )}
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>{cat.name}</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{cat.description}</p>
        <div style={{ marginTop: 12 }}>
          <span style={{
            display: 'inline-block', padding: '8px 18px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: 999,
            color: '#fff', fontSize: 13, fontWeight: 600,
          }}>Setleri Gör →</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CUSTOMER INFO FORM
// ============================================================
function CustomerInfoForm({ w, setW }: { w: WizardState; setW: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const { state } = useApp();
  const firmPhone = state.settings.firmWhatsapp || '5551234567';
  const [showEventCal, setShowEventCal] = useState(false);
  const [showDeliveryCal, setShowDeliveryCal] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  const handleEventDate = (d: string) => {
    setW(p => ({ ...p, eventDate: d, deliveryDate: '' }));
    const diff = daysUntil(d);
    if (diff <= 2) {
      setIsUrgent(true);
    } else {
      setIsUrgent(false);
    }
    setShowEventCal(false);
  };

  const valid = w.bride && w.groom && w.eventDate && w.deliveryDate && w.phone.length === 10 && !isUrgent;

  return (
    <div style={{ padding: 'var(--space-md)', paddingBottom: 100 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Sipariş Bilgileri</h2>
      <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 'var(--space-xl)' }}>
        Lütfen tüm alanları eksiksiz doldurun.
      </p>

      <div className="input-group">
        <label className="input-label">Gelin Adı</label>
        <input className={`input-field ${!w.bride ? '' : ''}`} placeholder="Örn. Zeynep" value={w.bride}
          onChange={e => {
            const val = e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, '');
            setW(p => ({ ...p, bride: val }));
          }} />
      </div>
      <div className="input-group">
        <label className="input-label">Damat Adı</label>
        <input className="input-field" placeholder="Örn. Mehmet" value={w.groom}
          onChange={e => {
            const val = e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, '');
            setW(p => ({ ...p, groom: val }));
          }} />
      </div>
      <div className="input-group">
        <label className="input-label">Telefon Numarası</label>
        <div className="input-prefix">
          <span className="input-prefix__tag">+90</span>
          <input
            type="tel"
            placeholder="5XX XXX XX XX"
            value={w.phone}
            onChange={e => setW(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
          />
        </div>
        {w.phone && !w.phone.startsWith('5') && (
          <div className="form-error">Numara 5 ile başlamalıdır</div>
        )}
      </div>

      {/* Event Date */}
      <div className="input-group">
        <label className="input-label">Program Tarihi</label>
        <button
          className="input-field"
          style={{ textAlign: 'left', cursor: 'pointer', color: w.eventDate ? 'var(--gray-900)' : 'var(--gray-400)' }}
          onClick={() => setShowEventCal(!showEventCal)}
        >
          {w.eventDate ? formatDate(w.eventDate) : 'Takvimden seçin...'}
          <span style={{ float: 'right' }}>📅</span>
        </button>
        {showEventCal && (
          <div style={{ marginTop: 8, zIndex: 50 }}>
            <Calendar
              value={w.eventDate}
              onChange={handleEventDate}
              allowedHighlight="availability"
              onClose={() => setShowEventCal(false)}
            />
          </div>
        )}
        {isUrgent && (
          <div className="animate-fade-slide-up" style={{
            marginTop: 16, padding: '16px 20px',
            background: 'linear-gradient(135deg, #FFF3F3 0%, #FEE2E2 100%)',
            borderRadius: 16, border: '1px solid rgba(220, 38, 38, 0.1)',
            display: 'flex', gap: 16, alignItems: 'flex-start',
            boxShadow: '0 12px 24px rgba(220, 38, 38, 0.08)'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 18, background: '#DC2626', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
              boxShadow: '0 4px 12px rgba(220,38,38,0.3)', marginTop: 2
            }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#991B1B', marginBottom: 4, letterSpacing: '-0.01em' }}>Acil Teslimat Gerektiriyor</div>
              <p style={{ fontSize: 14, color: '#B91C1C', lineHeight: 1.5, marginBottom: 16, fontWeight: 500 }}>Bu program için çalışma takvimimiz oldukça yoğun. Mümkün olan en hızlı çözüm için lütfen iletişime geçin.</p>
              <a href={`https://wa.me/90${firmPhone}`} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', padding: '10px 20px', borderRadius: 999, background: '#25D366', color: '#FFF',
                fontSize: 14, fontWeight: 800, textDecoration: 'none', alignItems: 'center', gap: 8,
                boxShadow: '0 6px 16px rgba(37, 211, 102, 0.3)', transition: 'all 0.3s ease'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 0C5.385 0 0 5.385 0 12.031 0 14.654 1.05 17.07 2.809 18.91l-1.921 5.093 5.305-1.745A11.96 11.96 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 21.996c-2.023 0-3.91-.564-5.518-1.542l-.39-.235-3.35 1.102 1.21-3.21-.264-.413A9.962 9.962 0 012.004 12.03C2.004 6.502 6.502 2.004 12.031 2.004S22.058 6.502 22.058 12.03 17.559 21.996 12.031 21.996zm5.553-7.514c-.305-.152-1.802-.89-2.08-.992-.28-.102-.482-.152-.686.152-.203.305-.787.992-.964 1.196-.178.203-.356.228-.66.076-1.554-.775-2.73-1.874-3.52-3.14-.15-.24-.03-.38.12-.52.14-.13.31-.35.46-.53.15-.17.2-.3.3-.5s.05-.38-.03-.53c-.08-.15-.69-1.65-.94-2.26-.25-.6-.5-.52-.69-.53H8.38c-.28 0-.74.1-1.12.52-.38.42-1.47 1.44-1.47 3.5s1.5 4.05 1.7 4.33c.21.28 2.95 4.5 7.15 6.32 1 .43 1.78.69 2.39.88.99.31 1.9.27 2.62.16.8-.12 2.45-1.01 2.8-1.98.34-.98.34-1.82.23-1.98-.11-.15-.4-.25-.71-.41z" /></svg>
                WhatsApp Danışmanı
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Date — only shown after event date */}
      {w.eventDate && (
        <div className="input-group">
          <label className="input-label">Teslim Tarihi</label>
          <button
            className="input-field"
            style={{ textAlign: 'left', cursor: 'pointer', color: w.deliveryDate ? 'var(--gray-900)' : 'var(--gray-400)' }}
            onClick={() => setShowDeliveryCal(!showDeliveryCal)}
          >
            {w.deliveryDate ? formatDate(w.deliveryDate) : 'Takvimden seçin (program günü veya 1 gün önce)...'}
            <span style={{ float: 'right' }}>📅</span>
          </button>
          {showDeliveryCal && (
            <div style={{ marginTop: 8 }}>
              <Calendar
                value={w.deliveryDate}
                onChange={d => { setW(p => ({ ...p, deliveryDate: d })); setShowDeliveryCal(false); }}
                allowedHighlight="delivery"
                eventDate={w.eventDate}
                onClose={() => setShowDeliveryCal(false)}
              />
            </div>
          )}
        </div>
      )}

      <PriceBar
        basePrice={0} total={0}
        nextLabel="Devam Et"
        nextDisabled={!valid}
        onNext={() => setW(p => ({ ...p, step: p.step + 1 }))}
      />
    </div>
  );
}

// ============================================================
// EXTRAS STEP (Chocolate, Rose, Box, Label)
// ============================================================
function ExtrasStep({ w, setW, basePrice }: { w: WizardState; setW: React.Dispatch<React.SetStateAction<WizardState>>; basePrice: number }) {
  const { state } = useApp();
  const rosePrice = 120;
  const roseFreeSlots = w.selectedSet?.includedRoseCount ?? state.settings.roseFreeSlotsDefault;
  const boxes = state.products.filter(p => p.type === 'sandik' && p.isActive);
  const labels = state.products.filter(p => p.type === 'etiket' && p.isActive);

  const chocExtra = w.chocolateCount * 25; // 25₺ per chocolate unit
  const roseExtra = Math.max(0, w.roseCount - roseFreeSlots) * rosePrice;
  const boxExtra = w.selectedBox ? (w.selectedBox.price > 0 ? w.selectedBox.price : 0) : 0;
  const labelExtra = w.selectedLabel ? w.selectedLabel.price : 0;
  const total = basePrice + chocExtra + roseExtra + boxExtra + labelExtra;

  const extras = [
    ...(chocExtra > 0 ? [{ label: `+${w.chocolateCount} Çikolata`, amount: chocExtra }] : []),
    ...(roseExtra > 0 ? [{ label: `+${w.roseCount - roseFreeSlots} Anne Gülü`, amount: roseExtra }] : []),
    ...(boxExtra > 0 ? [{ label: `Özel Sandık`, amount: boxExtra }] : []),
    ...(labelExtra > 0 ? [{ label: `Etiket Tasarımı`, amount: labelExtra }] : []),
  ];

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Selected set preview */}
      {w.selectedSet && (
        <div style={{ padding: 'var(--space-md)', background: 'var(--nas-rose-light)', borderBottom: '1px solid var(--gray-100)' }}>
          <div className="flex items-center gap-md">
            <img src={w.selectedSet.imageUrl} alt="" style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Seçilen Set</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{w.selectedSet.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--nas-bordeaux)' }}>{formatCurrency(basePrice)}</div>
                <div style={{ fontSize: 10, fontWeight: 600, background: 'rgba(107,29,58,0.08)', color: 'var(--nas-bordeaux)', padding: '2px 6px', borderRadius: 4, letterSpacing: '-0.02em' }}>
                  {w.selectedSet.setContents && Object.keys(w.selectedSet.setContents).length > 0 ? (
                    [
                      w.selectedSet.setContents.buketIcerigi && 'Buket',
                      w.selectedSet.setContents.sandikIcerigi && 'Sandık',
                      w.selectedSet.setContents.anneGulu && 'Anne Gülü',
                      w.selectedSet.setContents.kahveYani && 'Kahve Yanı'
                    ].filter(Boolean).join(' • ')
                  ) : (
                    'Buket • Sandık • Anne Gülü • Kahve Yanı'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: 'var(--space-md)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Ekstralar & Özelleştirme</h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 'var(--space-xl)' }}>
          Siparişinizi özel yapın! İsteğe bağlı eklemeler yapabilirsiniz.
        </p>

        {/* Chocolate Count */}
        <div className="glass-block" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="overflow-icon-wrapper">
            <img src="/cikolata.png" alt="Ekstra Çikolata" className="overflow-icon-img" />
          </div>
          <div style={{ flex: 1, paddingLeft: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--nas-black)', letterSpacing: '-0.02em' }}>Ekstra Çikolata</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4, lineHeight: 1.4 }}>
              {w.mode === 'set-order' && w.selectedSet?.includedChocolateCount ? (
                <>Setinizde <strong>{w.selectedSet.includedChocolateCount} adet</strong> çikolata var, ekstra çikolata ister misiniz?<br/><span style={{ fontSize: 11, color: 'var(--gray-400)' }}>16 ve katları şeklinde artar • 25₺/adet</span></>
              ) : (
                <>16 ve katları şeklinde artar • 25₺/adet</>
              )}
              {w.chocolateCount > 0 && (
                <span style={{ color: 'var(--nas-gold)', fontWeight: 600, display: 'block', marginTop: 4 }}>
                  {w.chocolateCount} Adet Ekstra Seçildi (+{formatCurrency(chocExtra)})
                </span>
              )}
            </div>
          </div>
          <div className="stepper" style={{ flexShrink: 0 }}>
            <button className="stepper__btn" disabled={w.chocolateCount === 0}
              onClick={() => setW(p => ({ ...p, chocolateCount: Math.max(0, p.chocolateCount - 16) }))}>−</button>
            <span className="stepper__value">{w.chocolateCount}</span>
            <button className="stepper__btn"
              onClick={() => setW(p => ({ ...p, chocolateCount: p.chocolateCount + 16 }))}>+</button>
          </div>
        </div>

        {/* Rose Count */}
        <div className="glass-block" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="overflow-icon-wrapper">
            <img src="/annegulu.png" alt="Anne Gülü" className="overflow-icon-img" />
          </div>
          <div style={{ flex: 1, paddingLeft: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--nas-black)', letterSpacing: '-0.02em' }}>Anne Gülü</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4, lineHeight: 1.4 }}>
              {roseFreeSlots > 0 ? `${roseFreeSlots} adet sette dahil` : 'Sette dahil gül yok'} • Sonrası {rosePrice}₺/adet
              {w.roseCount > 0 && (
                <span style={{ color: w.roseCount <= roseFreeSlots ? 'var(--green-600)' : 'var(--nas-gold)', fontWeight: 600, display: 'block', marginTop: 2 }}>
                  {w.roseCount <= roseFreeSlots
                    ? `${w.roseCount} adet — Sete Dahil ✅`
                    : `${roseFreeSlots} dahil + ${w.roseCount - roseFreeSlots} ekstra (+${formatCurrency(roseExtra)})`
                  }
                </span>
              )}
            </div>
          </div>
          <div className="stepper" style={{ flexShrink: 0 }}>
            <button className="stepper__btn" disabled={w.roseCount === 0}
              onClick={() => setW(p => ({ ...p, roseCount: Math.max(0, p.roseCount - 1) }))}>−</button>
            <span className="stepper__value">{w.roseCount}</span>
            <button className="stepper__btn"
              onClick={() => setW(p => ({ ...p, roseCount: p.roseCount + 1 }))}>+</button>
          </div>
        </div>
      </div>

      {/* Box Selection */}
      {boxes.length > 0 && (
        <ProductCarousel
          title="Sandık Seçimi (İsteğe Bağlı)"
          products={boxes}
          selectedId={w.selectedBox?.id}
          onSelect={p => setW(prev => ({
            ...prev, selectedBox: prev.selectedBox?.id === p.id ? undefined : p
          }))}
        />
      )}

      {/* Label Selection */}
      {labels.length > 0 && (
        <ProductCarousel
          title="Çikolata Etiket Tasarımı"
          products={labels}
          selectedId={w.selectedLabel?.id}
          onSelect={p => setW(prev => ({
            ...prev, selectedLabel: prev.selectedLabel?.id === p.id ? undefined : p
          }))}
        />
      )}

      {/* Custom label image upload */}
      {w.selectedLabel?.hasCustomImage && (
        <div style={{ padding: '0 var(--space-md) var(--space-md)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
            📷 {w.selectedLabel.customImageLabel}
          </div>
          <label className="upload-area">
            <input
              type="file" accept="image/*" multiple hidden
              onChange={e => {
                const files = Array.from(e.target.files || []).slice(0, 5);
                Promise.all(files.map(f => new Promise<string>(res => {
                  const r = new FileReader();
                  r.onload = () => res(r.result as string);
                  r.readAsDataURL(f);
                }))).then(imgs => setW(p => ({ ...p, customLabelImages: [...p.customLabelImages, ...imgs].slice(0, 5) })));
              }}
            />
            {w.customLabelImages.length < 5
              ? <><span style={{ fontSize: 32 }}>📷</span><span style={{ fontSize: 14, color: 'var(--gray-500)' }}>Fotoğraf eklemek için tıklayın (max 5)</span></>
              : <span style={{ color: 'var(--green-600)', fontWeight: 600 }}>✓ 5 fotoğraf eklendi</span>
            }
          </label>
          {w.customLabelImages.length > 0 && (
            <div className="upload-grid" style={{ marginTop: 8 }}>
              {w.customLabelImages.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={img} alt="" className="upload-thumb" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                  <button
                    onClick={() => setW(p => ({ ...p, customLabelImages: p.customLabelImages.filter((_, j) => j !== i) }))}
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'var(--red-500)', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <PriceBar
        basePrice={basePrice} extras={extras} total={total}
        onBack={() => setW(p => ({ ...p, step: p.step - 1 }))}
        onNext={() => setW(p => ({ ...p, step: p.step + 1 }))}
        nextDisabled={(labels.length > 0 && !w.selectedLabel) || (w.selectedLabel?.hasCustomImage && w.customLabelImages.length === 0)}
        nextLabel={(labels.length > 0 && !w.selectedLabel) ? "Etiket Seçiniz" : (w.selectedLabel?.hasCustomImage && w.customLabelImages.length === 0) ? "Fotoğraf Yükleyiniz" : "Özeti Gör"}
      />
    </div>
  );
}

// ============================================================
// ORDER SUMMARY STEP
// ============================================================
function OrderSummaryStep({ w, onSubmit }: { w: WizardState; onSubmit: () => void }) {
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const { state } = useApp();
  const roseFreeSlots = state.settings.roseFreeSlotsDefault;
  const rosePrice = 120;
  const isCustom = w.mode === 'custom-order';
  const basePrice = isCustom ? (w.selectedBouquet?.price ?? 0) : (w.selectedSet?.price ?? 0);
  const chocExtra = w.chocolateCount * 25;
  
  const usedRoseFreeSlots = w.selectedAnneGulu?.freeSlots ?? roseFreeSlots;
  const usedRosePrice = w.selectedAnneGulu?.price ?? rosePrice;
  const roseExtra = Math.max(0, w.roseCount - usedRoseFreeSlots) * usedRosePrice;
  
  const boxExtra = w.selectedBox ? w.selectedBox.price : 0;
  const labelExtra = w.selectedLabel ? w.selectedLabel.price : 0;
  const kahveYaniExtra = (w.selectedKahveYani && w.selectedKahveYani.price !== -1) ? w.selectedKahveYani.price : 0;
  
  const total = basePrice + chocExtra + roseExtra + boxExtra + labelExtra + kahveYaniExtra;

  return (
    <div style={{ padding: 'var(--space-md)', paddingBottom: 100 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Sipariş Özeti</h2>
      <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 'var(--space-lg)' }}>Her şey doğru mu? Kontrol edin.</p>

      {/* Set Image */}
      {w.selectedSet && (
        <div className="glass-block" style={{ marginBottom: 'var(--space-lg)', padding: 8 }}>
          <img src={w.selectedSet.imageUrl} alt={w.selectedSet.name} style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 'calc(var(--radius-2xl) - 8px)' }} />
        </div>
      )}

      {/* Order info */}
      <div className="summary-section">
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Sipariş Bilgileri</div>
        {[
          ['Gelin & Damat', `${w.bride} & ${w.groom}`],
          ['Telefon', `+90 ${w.phone}`],
          ['Program Tarihi', formatDate(w.eventDate)],
          ['Teslim Tarihi', formatDate(w.deliveryDate)],
        ].map(([k, v]) => (
          <div key={k} className="summary-row">
            <span className="summary-row__label">{k}</span>
            <span className="summary-row__value">{v}</span>
          </div>
        ))}
      </div>

      <div className="summary-section">
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Seçilen Ürünler</div>
        {[
          isCustom 
            ? (w.selectedBouquet ? [<span>Buket <i style={{ fontWeight: 'normal', opacity: 0.7, fontSize: 12 }}>+ Pleksiler</i></span>, w.selectedBouquet.name, formatCurrency(w.selectedBouquet.price), w.selectedBouquet.imageUrl] : undefined)
            : (w.selectedSet ? ['Set', w.selectedSet.name, formatCurrency(w.selectedSet.price), w.selectedSet.imageUrl] : undefined),
          w.selectedBox ? [<span>Sandık <i style={{ fontWeight: 'normal', opacity: 0.7, fontSize: 12 }}>+ Pleksiler</i></span>, w.selectedBox.name, w.selectedBox.price > 0 ? formatCurrency(w.selectedBox.price) : 'Ücretsiz', w.selectedBox.imageUrl] : undefined,
          w.selectedLabel ? ['Etiket', w.selectedLabel.name, w.selectedLabel.price > 0 ? formatCurrency(w.selectedLabel.price) : 'Ücretsiz', w.selectedLabel.imageUrl] : undefined,
          ...(w.chocolateCount > 0 ? [[w.mode === 'custom-order' ? 'Etiketli Çikolata' : 'Ekstra Çikolata', `${w.chocolateCount} adet`, formatCurrency(chocExtra), '']] : []),
          ...(w.roseCount > 0 && w.selectedAnneGulu?.id !== 'skip-rose' ? [[w.selectedAnneGulu ? w.selectedAnneGulu.name : 'Anne Gülü', w.roseCount <= usedRoseFreeSlots ? `${w.roseCount} adet` : `${usedRoseFreeSlots} Ücretsiz + ${w.roseCount - usedRoseFreeSlots} Adet`, roseExtra > 0 ? formatCurrency(roseExtra) : 'Ücretsiz', w.selectedAnneGulu?.imageUrl || '']] : []),
          (w.selectedKahveYani && w.selectedKahveYani.id !== 'skip-coffee') ? ['Kahve Yanı', w.selectedKahveYani.name, w.selectedKahveYani.price > 0 ? formatCurrency(w.selectedKahveYani.price) : 'Ücretsiz', w.selectedKahveYani.imageUrl] : undefined,
        ].filter(Boolean).map((row, i) => (
          <div key={i} className="summary-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
            {row![3] && (
              <img 
                src={row![3] as string} 
                alt="" 
                onClick={() => setZoomImage(row![3] as string)}
                style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--gray-200)', flexShrink: 0 }} 
              />
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 2 }}>{row![0]}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--nas-black)' }}>{row![1]}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--nas-bordeaux)', whiteSpace: 'nowrap' }}>{row![2]}</div>
          </div>
        ))}
      </div>

      <div className="summary-total">
        <span className="summary-total__label">Toplam Tutar</span>
        <span className="summary-total__amount">{formatCurrency(total)}</span>
      </div>

      <div style={{ height: 80 }} />

      {/* Fixed buttons */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--gray-100)', padding: 'var(--space-md) var(--space-lg)',
        display: 'flex', gap: 'var(--space-sm)', zIndex: 100,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      }}>
        <span style={{ flex: 1, display: 'flex', alignItems: 'center', fontSize: 22, fontWeight: 900, color: 'var(--nas-bordeaux)' }}>
          {formatCurrency(total)}
        </span>
        <button className="btn btn-primary" style={{ minWidth: 160 }} onClick={onSubmit}>
          Siparişi Ver 🎀
        </button>
      </div>

      {zoomImage && (
        <div 
          className="animate-fade-in"
          style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          onClick={() => setZoomImage(null)}
        >
          <button style={{ position: 'absolute', top: 20, right: 20, color: '#fff', fontSize: 32, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          <img src={zoomImage} alt="" className="animate-scale-up" style={{ maxWidth: '90%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} />
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUCCESS STEP
// ============================================================
function SuccessStep({ orderId }: { orderId: string }) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'var(--space-xl)' }}>
      <Confetti active />
      <div style={{ fontSize: 80, marginBottom: 24, animation: 'bounce 1s ease infinite' }}>🎉</div>
      <h1 style={{ fontSize: 'clamp(24px, 6vw, 40px)', fontWeight: 900, color: 'var(--nas-bordeaux)', letterSpacing: '-0.04em', marginBottom: 12 }}>
        Siparişiniz Oluşturuldu!
      </h1>
      <p style={{ fontSize: 17, color: 'var(--gray-600)', marginBottom: 32, maxWidth: 400, lineHeight: 1.6 }}>
        Siparişiniz incelenip en kısa sürede size bilgi verilecektir. 💕
      </p>
      <div style={{
        padding: '24px 40px', background: 'linear-gradient(135deg, var(--nas-bordeaux), var(--nas-bordeaux-2))',
        borderRadius: 'var(--radius-2xl)', marginBottom: 32, boxShadow: 'var(--shadow-bordeaux)',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>
          Sipariş Kodunuz
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '0.20em' }}>{orderId}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.60)', marginTop: 8 }}>Bu kodu not alın!</div>
      </div>
      <button className="btn btn-primary btn-lg" onClick={() => navigate(`/takip?code=${orderId}`)}>
        Siparişimi Göster 🔍
      </button>
      <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => navigate('/')}>
        Ana Sayfaya Dön
      </button>
    </div>
  );
}



// ============================================================
// MAIN WIZARD
// ============================================================
const SET_STEPS = [
  { label: 'Bilgiler', icon: '📝' },
  { label: 'Ekstralar', icon: '✨' },
  { label: 'Özet', icon: '📋' },
];

export default function OrderWizard() {
  const { state, addOrder } = useApp();
  const navigate = useNavigate();
  const [w, setW] = useState<WizardState>({ ...initWizard });
  const [mainSelectedProd, setMainSelectedProd] = useState<Product | null>(null);
  const [orderId, setOrderId] = useState('');

  const customCardRef = useRef<HTMLDivElement>(null);
  const [customCardInView, setCustomCardInView] = useState(true);

  useEffect(() => {
    if (!customCardRef.current || w.mode !== 'menu') return;
    const observer = new IntersectionObserver(([entry]) => {
      setCustomCardInView(entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(customCardRef.current);
    return () => observer.disconnect();
  }, [w.mode]);

  const categories = state.categories.filter(c => c.isActive);
  const subCategories = state.subCategories.filter(s => s.isActive);
  const products = state.products.filter(p => p.isActive);

  const handleSubmitOrder = () => {
    const basePrice = w.selectedSet?.price ?? (w.selectedBouquet?.price ?? 0);
    const roseFreeSlots = state.settings.roseFreeSlotsDefault;
    const rosePrice = 120;
    const chocExtra = w.chocolateCount * 25;
    const roseExtra = Math.max(0, w.roseCount - roseFreeSlots) * rosePrice;
    const boxExtra = w.selectedBox ? w.selectedBox.price : 0;
    const labelExtra = w.selectedLabel ? w.selectedLabel.price : 0;
    const totalPrice = basePrice + chocExtra + roseExtra + boxExtra + labelExtra;

    const code = generateOrderCode(state.orders.map(o => o.id));
    const extras: { label: string; qty: number; unitPrice: number; unitCost: number; total: number; totalCost: number; isFree: boolean }[] = [];

    if (w.chocolateCount > 0) extras.push({ label: w.mode === 'custom-order' ? 'Etiketli Çikolata' : 'Ekstra Çikolata', qty: w.chocolateCount, unitPrice: 25, unitCost: 15, total: chocExtra, totalCost: w.chocolateCount * 15, isFree: false });
    if (w.roseCount > 0) extras.push({ label: 'Anne Gülü', qty: w.roseCount, unitPrice: rosePrice, unitCost: 50, total: roseExtra, totalCost: w.roseCount * 50, isFree: w.roseCount <= roseFreeSlots });
    if (w.selectedBox && boxExtra > 0) extras.push({ label: w.selectedBox.name, qty: 1, unitPrice: boxExtra, unitCost: w.selectedBox.cost, total: boxExtra, totalCost: w.selectedBox.cost, isFree: false });
    if (w.selectedLabel && labelExtra > 0) extras.push({ label: w.selectedLabel.name, qty: 1, unitPrice: labelExtra, unitCost: w.selectedLabel.cost, total: labelExtra, totalCost: w.selectedLabel.cost, isFree: false });

    const baseCost = (w.selectedSet?.cost ?? 0) + (w.selectedBouquet?.cost ?? 0);
    const totalCost = baseCost + extras.reduce((s, e) => s + e.totalCost, 0);

    const cat = state.categories.find(c => c.id === w.categoryId);
    const order: Order = {
      id: code,
      status: 'onay',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      bride: w.bride, groom: w.groom, phone: w.phone,
      eventDate: w.eventDate, deliveryDate: w.deliveryDate,
      orderType: w.mode === 'set-order' ? 'set' : 'custom',
      categoryId: w.categoryId,
      categoryName: cat?.name ?? '',
      selectedSet: w.selectedSet,
      selectedBouquet: w.selectedBouquet,
      selectedBox: w.selectedBox,
      selectedLabel: w.selectedLabel,
      chocolateCount: w.chocolateCount,
      roseCount: w.roseCount,
      extras,
      basePrice,
      totalPrice, totalCost,
      deposit: Math.ceil(totalPrice * state.settings.depositRate),
      depositPaid: false,
      pleksiOrdered: false,
      productionPhotos: [],
      programPhotos: [],
      notes: '',
      customerNotifiedDeposit: false,
      customerSentDeposit: false,
      googleReviewSent: false,
    };

    addOrder(order);
    try {
      localStorage.setItem('nas_customer_info', JSON.stringify({
        bride: w.bride,
        groom: w.groom,
        phone: w.phone,
        lastOrderId: code,
      }));
    } catch (e) {}
    setOrderId(code);
    setW(p => ({ ...p, step: 99 }));
  };

  // DONE
  if (w.step === 99) return <SuccessStep orderId={orderId} />;

  // MENU — unified product selection
  if (w.mode === 'menu') {
    const mainSubCats = subCategories.filter(s => s.categoryId === 'cat1' && s.productType === 'set');

    return (
      <div className="mobile-wrapper" style={{ minHeight: '100vh', background: 'var(--nas-cream)', position: 'relative' }}>
        <nav className="nav-header" style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ position: 'relative', zIndex: 10 }}>← Geri</button>
          <img src="/logo.png" alt="Nas Çikolata" style={{ height: 28, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} />
          <div />
        </nav>

        <div style={{ padding: 'var(--space-xl) 0', overflowX: 'hidden' }}>
          <div style={{ textAlign: 'center', marginBottom: 40, padding: '0 16px' }}>
            <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--nas-bordeaux)', marginBottom: 8 }}>
              Size Özel Tasarımlar
            </span>
            <h1 style={{ fontSize: 'clamp(26px, 7vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.15, color: 'var(--gray-900)' }}>
              Siparişinizi<br />Oluşturun
            </h1>
          </div>

          <div style={{ paddingBottom: 16 }}>
            {mainSubCats.map(sub => {
              const subProducts = products.filter(p => p.type === 'set' && p.subCategoryId === sub.id);
              if (subProducts.length === 0) return null;
              return (
                <ProductCarousel
                  key={sub.id}
                  title={sub.name}
                  products={subProducts}
                  selectedId={mainSelectedProd?.id}
                  onSelect={p => {
                    setMainSelectedProd(mainSelectedProd?.id === p.id ? null : p);
                  }}
                />
              );
            })}
          </div>

          {mainSelectedProd && (
            <div className="animate-fade-slide-up" style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
              background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
              padding: 'var(--space-sm) var(--space-md)', paddingBottom: 'calc(var(--space-sm) + env(safe-area-inset-bottom, 24px))',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
              borderTop: '1px solid var(--gray-100)'
            }}>
              <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={mainSelectedProd.imageUrl} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nas-black)' }}>{mainSelectedProd.name}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--nas-bordeaux)' }}>{mainSelectedProd.price > 0 ? formatCurrency(mainSelectedProd.price) : 'Fiyat Sorunuz'}</div>
                </div>
              </div>
              <button 
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontWeight: 800 }}
                onClick={() => {
                  setW(p => ({ ...p, mode: 'set-order', categoryId: mainSelectedProd.categoryId, selectedSet: mainSelectedProd, step: 0 }));
                  setMainSelectedProd(null);
                }}
              >
                Siparişe Başla
              </button>
              </div>
            </div>
          )}

          <div style={{ position: 'relative', padding: '0 16px', margin: '40px auto', maxWidth: 800, paddingBottom: mainSelectedProd ? 100 : 0 }} ref={customCardRef}>
            <div
              className="card-interactive hover-scale"
              style={{
                position: 'relative',
                background: '#111111',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: 32,
                overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              }}
              onClick={() => setW(p => ({ ...p, mode: 'custom-order', step: 0, chocolateCount: 80 }))}
            >
              <div style={{ position: 'absolute', inset: -4, background: 'linear-gradient(45deg, #111, #C9A96E, #B8476F, #111)', backgroundSize: '400% 400%', animation: 'gradientMove 6s ease infinite', zIndex: 0, borderRadius: 36 }} />
              <div style={{ 
                position: 'absolute', inset: 2, background: '#111111', borderRadius: 30, zIndex: 1,
                backgroundImage: 'linear-gradient(rgba(201, 169, 110, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 169, 110, 0.1) 1px, transparent 1px)',
                backgroundSize: '30px 30px', backgroundPosition: 'center center',
              }}>
                {/* Overlay gradient to fade the grid out towards edges */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, #111 80%)', borderRadius: 30 }} />
              </div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: '#FFF', letterSpacing: '-0.02em', marginBottom: 12 }}>
                  Setini Kendin Oluştur!
                </h3>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>
                  Buketini, sandığını, detayları kendin seç!
                </p>
                <span className="btn-luxury-shimmer" style={{
                  display: 'inline-flex', padding: '14px 32px',
                  borderRadius: 999, color: '#FFF', fontWeight: 800, fontSize: 16,
                  border: 'none', cursor: 'pointer', boxShadow: '0 12px 32px rgba(201,169,110,0.3)'
                }}>
                  Deneyimi Başlat
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: '40px 0 60px', overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 80, background: 'linear-gradient(to right, var(--nas-cream), transparent)', zIndex: 2, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 80, background: 'linear-gradient(to left, var(--nas-cream), transparent)', zIndex: 2, pointerEvents: 'none' }} />
            <div className="animate-marquee" style={{ display: 'inline-flex', gap: 24, paddingLeft: 24 }}>
              {state.settings.landing.googleReviews.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column',
                  background: '#FFF', padding: '20px', borderRadius: 16,
                  border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  width: 280, minWidth: 280, whiteSpace: 'normal', flexShrink: 0
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ background: r.avatarBg, width: 36, height: 36, borderRadius: 18, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 15, marginRight: 12 }}>{r.letter}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1D1D1F', lineHeight: 1.2 }}>{r.name}</div>
                      <div style={{ color: '#86868B', fontSize: 12, marginTop: 2 }}>{r.date}</div>
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: 18, height: 18, marginLeft: 'auto' }} />
                  </div>
                  <div style={{ color: '#FBBC05', fontSize: 14, letterSpacing: 2, marginBottom: 8 }}>★★★★★</div>
                  <div style={{ fontSize: 14, color: '#4A4A4D', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{r.text}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STICKY BOTTOM BANNER FOR CUSTOM ORDER */}
          {!customCardInView && !mainSelectedProd && (
            <div className="animate-fade-slide-up" style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
              padding: '16px var(--space-md) calc(16px + env(safe-area-inset-bottom, 24px))',
              display: 'flex', justifyContent: 'center', pointerEvents: 'none'
            }}>
               <div style={{
                position: 'relative',
                borderRadius: 999,
                padding: 2,
                background: 'linear-gradient(45deg, #FFD700, #C9A96E, #B8476F, #FFD700)',
                backgroundSize: '400% 400%',
                animation: 'gradientMove 3s ease infinite',
                pointerEvents: 'auto',
                boxShadow: '0 12px 40px rgba(201,169,110,0.4)',
                cursor: 'pointer'
              }}
              onClick={() => {
                // When clicked, smoothly scroll to the main custom card
                customCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              >
                <div style={{
                  background: 'rgba(17,17,17,0.95)', backdropFilter: 'blur(20px)',
                  borderRadius: 999, padding: '8px 8px 8px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span style={{ fontSize: 18, animation: 'bounce 2s infinite' }}>✨</span>
                  <span style={{ color: '#FFF', fontWeight: 700, fontSize: 13, marginRight: 8 }}>Setini Kendin Oluştur!</span>
                  <button
                    className="btn-luxury-shimmer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setW(p => ({ ...p, mode: 'custom-order', step: 0, chocolateCount: 80 }));
                    }}
                    style={{
                      border: 'none', borderRadius: 999, padding: '8px 16px',
                      fontSize: 12, fontWeight: 800, color: '#FFF', cursor: 'pointer'
                    }}
                  >
                    Başla
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // SET WIZARD STEPS
  if (w.mode === 'set-order' && w.selectedSet) {
    const basePrice = w.selectedSet.price;
    return (
      <div className="mobile-wrapper" style={{ minHeight: '100vh', background: 'var(--nas-cream)' }}>
        <nav className="nav-header">
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (w.step === 0) setW(p => ({ ...p, mode: 'menu', selectedSet: undefined }));
            else setW(p => ({ ...p, step: p.step - 1 }));
          }}>← Geri</button>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Set Siparişi</span>
          <div />
        </nav>
        <StepBar steps={SET_STEPS} current={w.step} />

        {w.step === 0 && <CustomerInfoForm w={w} setW={setW} />}
        {w.step === 1 && <ExtrasStep w={w} setW={setW} basePrice={basePrice} />}
        {w.step === 2 && <OrderSummaryStep w={w} onSubmit={handleSubmitOrder} />}
      </div>
    );
  }

  // CUSTOM ORDER — simplified (similar structure)
  if (w.mode === 'custom-order') {
    const CUSTOM_STEPS = [
      { label: 'Bilgiler', icon: '📝' },
      { label: 'Buket', icon: '💐' },
      { label: 'Sandık', icon: '🎁' },
      { label: 'Özet', icon: '📋' },
    ];

    const bouquets = state.products.filter(p => p.type === 'buket');
    const boxes = state.products.filter(p => p.type === 'sandik');
    const labels = state.products.filter(p => p.type === 'etiket');
    const anneGulleri = state.products.filter(p => p.type === 'anne-gulu');
    const kahveYanlari = state.products.filter(p => p.type === 'kahve-yani');

    const basePrice = (w.selectedBouquet?.price ?? 0) + (w.selectedBox?.price ?? 0) + (w.selectedLabel?.price ?? 0) + (w.selectedKahveYani?.price ?? 0);
    const roseFreeSlots = state.settings.roseFreeSlotsDefault;
    const rosePrice = 120;
    
    const usedRoseFreeSlots = w.selectedAnneGulu?.freeSlots ?? roseFreeSlots;
    const usedRosePrice = w.selectedAnneGulu?.price ?? rosePrice;
    
    const chocExtra = w.chocolateCount * 25;
    const roseExtra = Math.max(0, w.roseCount - usedRoseFreeSlots) * usedRosePrice;
    const total = basePrice + chocExtra + roseExtra;

    return (
      <div className="mobile-wrapper" style={{ minHeight: '100vh', background: 'var(--nas-cream)' }}>
        <nav className="nav-header">
          <button className="btn btn-ghost btn-sm" onClick={() => {
             if (w.step === 0) setW({ ...initWizard });
             else if (w.step === 1 && w.bouquetSubType) setW(p => ({ ...p, bouquetSubType: undefined }));
             else if (w.step === 1 && w.bouquetKind) setW(p => ({ ...p, bouquetKind: undefined }));
             else setW(p => ({ ...p, step: p.step - 1 }));
          }}>← Geri</button>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Kendin Oluştur</span>
          {w.step === 1 ? (
            <button 
              style={{ background: 'transparent', border: 'none', color: 'var(--nas-bordeaux)', fontWeight: 800, fontSize: 12, textAlign: 'right', lineHeight: 1.2, cursor: 'pointer', padding: 0 }} 
              onClick={() => setW(p => ({ ...p, showNoBouquetConfirm: true }))}
            >
              Buket İstemiyorum<br/>Sandığa Geç
            </button>
          ) : w.step === 2 ? (
            <button 
              style={{ background: 'transparent', border: 'none', color: 'var(--nas-bordeaux)', fontWeight: 800, fontSize: 12, textAlign: 'right', lineHeight: 1.2, cursor: 'pointer', padding: 0 }} 
              onClick={() => setW(p => ({ ...p, showNoBouquetConfirm: true }))}
            >
              Sandık İstemiyorum<br/>Özete Geç
            </button>
          ) : <div style={{ width: 60 }} />}
        </nav>
        <StepBar steps={CUSTOM_STEPS} current={w.step} />

        {w.step === 0 && <CustomerInfoForm w={w} setW={setW} />}

        {w.step === 1 && (
          <div style={{ paddingBottom: 100 }}>
            {w.showNoBouquetConfirm && (
               <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)' }}>
                 <div className="animate-fade-slide-up" style={{ background: '#FFF', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, textAlign: 'center', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Emin misiniz?</h3>
                    <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 24 }}>
                      Çiçek aranjmanı seçmediniz. Sadece sandık ve detaylarla mı oluşturmak istiyorsunuz?
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                       <button className="btn btn-secondary" onClick={() => setW(p => ({ ...p, showNoBouquetConfirm: false }))}>Vazgeç</button>
                       <button className="btn btn-primary" onClick={() => setW(p => ({ ...p, showNoBouquetConfirm: false, wantBouquet: false, selectedBouquet: undefined, step: 2 }))}>Evet, Sandığa Geç</button>
                    </div>
                 </div>
               </div>
            )}

            <div style={{ padding: 'var(--space-md)' }}>
              <div style={{ position: 'relative', marginBottom: 16, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Aranjman Türünü Seçin</h2>
              </div>
              
              <div className={`split-choice-container animate-fade-slide-up ${w.bouquetKind ? 'compact' : ''}`}>
                <div 
                  className={`split-side left ${w.bouquetKind === 'buket' ? 'selected' : w.bouquetKind === 'kutu' ? 'unselected' : ''}`}
                  onClick={() => setW(p => ({ ...p, bouquetKind: 'buket', bouquetSubType: undefined, selectedBouquet: undefined }))}
                >
                  <img src="/buket.png" alt="Buket" />
                  <div className="split-label">Buket<br/><small>Aranjmanlar</small></div>
                </div>

                <div className="split-choice-divider" />
                <div className="split-badge">VEYA</div>

                <div 
                  className={`split-side right ${w.bouquetKind === 'kutu' ? 'selected' : w.bouquetKind === 'buket' ? 'unselected' : ''}`}
                  onClick={() => setW(p => ({ ...p, bouquetKind: 'kutu', bouquetSubType: undefined, selectedBouquet: undefined }))}
                >
                  <img src="/kutu.png" alt="Kutu" />
                  <div className="split-label" style={{textAlign: 'right'}}>Kutu<br/><small>Aranjmanlar</small></div>
                </div>
              </div>

              {w.bouquetKind && (
                <div className="animate-fade-slide-up" style={{ marginTop: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center' }}>Çiçek Türünü Seçin</h2>
                  
                  <div className={`split-choice-container animate-fade-slide-up ${w.bouquetSubType ? 'compact' : ''}`}>
                    <div 
                      className={`split-side left ${w.bouquetSubType === 'sakayik' ? 'selected' : w.bouquetSubType === 'yapay-gul' ? 'unselected' : ''}`}
                      onClick={() => {
                        setW(p => ({ ...p, bouquetSubType: 'sakayik', selectedBouquet: undefined }));
                        setTimeout(() => document.getElementById('section-buket-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
                      }}
                    >
                      <img src="/sakayik.png" alt="Şakayık" />
                      <div className="split-label">Şakayık<br/><small>Çeşitleri</small></div>
                    </div>

                    <div className="split-choice-divider" />
                    <div className="split-badge">VEYA</div>

                    <div 
                      className={`split-side right ${w.bouquetSubType === 'yapay-gul' ? 'selected' : w.bouquetSubType === 'sakayik' ? 'unselected' : ''}`}
                      onClick={() => {
                        setW(p => ({ ...p, bouquetSubType: 'yapay-gul', selectedBouquet: undefined }));
                        setTimeout(() => document.getElementById('section-buket-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
                      }}
                    >
                      <img src="/gul.png" alt="Yapay Gül" />
                      <div className="split-label" style={{textAlign: 'right'}}>Yapay Gül<br/><small>Çeşitleri</small></div>
                    </div>
                  </div>
                </div>
              )}

              {w.bouquetSubType && (
                <div id="section-buket-list" className="animate-fade-slide-up" style={{ margin: '24px -var(--space-md) 0' }}>
                  <ProductCarousel
                    title={`${w.bouquetSubType === 'sakayik' ? 'Şakayık' : 'Yapay Gül'} ${w.bouquetKind === 'buket' ? 'Buketleri' : 'Kutuları'}`}
                    products={bouquets.filter(b => b.bouquetKind === w.bouquetKind && b.subType === w.bouquetSubType)}
                    selectedId={w.selectedBouquet?.id}
                    onSelect={p => {
                      const isNew = w.selectedBouquet?.id !== p.id;
                      setW(prev => ({ ...prev, selectedBouquet: isNew ? p : undefined }));
                      if (isNew) setTimeout(() => document.getElementById('section-annegulu-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
                    }}
                  />
                </div>
              )}

              {w.selectedBouquet && (
                <div id="section-annegulu-list" className="animate-fade-slide-up" style={{ margin: '0 -var(--space-md)' }}>
                  <ProductCarousel
                    title="🌹 Anne Gülü Seçenekleri"
                    products={[
                      { id: 'skip-rose', name: 'İstemiyorum', description: 'Gül olmadan devam et', categoryId: 'annegulu', price: -1, imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="%23FAFAFA" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80" fill="%23ccc">✕</text></svg>', gallery: [] } as unknown as Product,
                      ...anneGulleri
                    ]}
                    selectedId={w.selectedAnneGulu?.id}
                    onSelect={p => {
                      const isNew = w.selectedAnneGulu?.id !== p.id;
                      setW(prev => ({ 
                        ...prev, 
                        selectedAnneGulu: isNew ? p : undefined,
                        roseCount: isNew && p.id === 'skip-rose' ? 0 : isNew ? 2 : prev.roseCount
                      }));
                      if (isNew) {
                        setTimeout(() => document.getElementById(p.id === 'skip-rose' ? 'section-kahveyani-list' : 'section-annegulu-stepper')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
                      }
                    }}
                  />
                </div>
              )}

              {w.selectedAnneGulu && w.selectedAnneGulu.id !== 'skip-rose' && (
                <div id="section-annegulu-stepper" className="animate-fade-slide-up" style={{ marginTop: 24, marginBottom: 24 }}>
                  <div style={{ 
                    background: '#fff', borderRadius: 'var(--radius-xl)', padding: 'var(--space-md)', 
                    boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid var(--gray-100)', 
                    display: 'flex', alignItems: 'center', gap: 16 
                  }}>
                    <div className="overflow-icon-wrapper">
                      <img src={w.selectedAnneGulu?.imageUrl || '/annegulu.png'} alt="Anne Gülü" className="overflow-icon-img" style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, paddingLeft: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--nas-black)', letterSpacing: '-0.02em' }}>Anne Gülü Adedi Seç</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4, lineHeight: 1.4 }}>
                        İlk {usedRoseFreeSlots} adet ücretsiz
                        {w.roseCount > usedRoseFreeSlots && (
                          <span style={{ color: 'var(--nas-gold)', fontWeight: 600, display: 'block', marginTop: 2 }}>
                            {w.roseCount - usedRoseFreeSlots} Adet Ekstra (+{roseExtra} ₺)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="stepper" style={{ flexShrink: 0 }}>
                      <button className="stepper__btn" disabled={w.roseCount === 0}
                        onClick={() => setW(p => ({ ...p, roseCount: Math.max(0, p.roseCount - 1) }))}>−</button>
                      <span className="stepper__value">{w.roseCount}</span>
                      <button className="stepper__btn"
                        onClick={() => {
                          setW(p => ({ ...p, roseCount: p.roseCount + 1 }));
                          // After increasing stepper for the first time, scroll to kahveyani
                          setTimeout(() => document.getElementById('section-kahveyani-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
                        }}>+</button>
                    </div>
                  </div>
                </div>
              )}

              {w.selectedAnneGulu && (w.selectedAnneGulu.id === 'skip-rose' || w.roseCount > 0) && (
                <div id="section-kahveyani-list" className="animate-fade-slide-up" style={{ margin: '0 -var(--space-md)' }}>
                  <ProductCarousel
                    title="☕ Kahve Yanı Seçenekleri"
                    products={[
                      { id: 'skip-coffee', name: 'İstemiyorum', description: 'Ekstra ürün olmadan devam et', categoryId: 'kahveyani', price: -1, imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="%23FAFAFA" width="400" height="400"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80" fill="%23ccc">✕</text></svg>', gallery: [] } as unknown as Product,
                      ...kahveYanlari
                    ]}
                    selectedId={w.selectedKahveYani?.id}
                    onSelect={p => setW(prev => ({ ...prev, selectedKahveYani: prev.selectedKahveYani?.id === p.id ? undefined : p }))}
                  />
                </div>
              )}

            </div>

            <PriceBar
              basePrice={(w.selectedBouquet?.price ?? 0) + (w.selectedKahveYani && w.selectedKahveYani.price !== -1 ? w.selectedKahveYani.price : 0)}
              extras={[
                ...(roseExtra > 0 ? [{ label: `Ekstra Güller`, amount: roseExtra }] : []),
              ]}
              total={(w.selectedBouquet?.price ?? 0) + (w.selectedKahveYani && w.selectedKahveYani.price !== -1 ? w.selectedKahveYani.price : 0) + roseExtra}
              onBack={() => setW(p => ({ ...p, step: 0 }))}
              onNext={() => setW(p => ({ ...p, step: 2 }))}
              nextDisabled={(w.wantBouquet && !w.selectedBouquet) || (!!w.selectedAnneGulu && w.selectedAnneGulu.id !== 'skip-rose' && w.roseCount === 0)}
              nextLabel="Sandık Seç"
            />
          </div>
        )}

        {w.step === 2 && (
          <div style={{ paddingBottom: 100 }}>
            {w.showNoBouquetConfirm && (
               <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)' }}>
                 <div className="animate-fade-slide-up" style={{ background: '#FFF', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, textAlign: 'center', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Emin misiniz?</h3>
                    <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 24 }}>
                      Sandık seçmediniz. Siparişi sadece diğer aksesuarlarla oluşturacaksınız.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                       <button className="btn btn-secondary" onClick={() => setW(p => ({ ...p, showNoBouquetConfirm: false }))}>Vazgeç</button>
                       <button className="btn btn-primary" onClick={() => setW(p => ({ ...p, showNoBouquetConfirm: false, wantBox: false, selectedBox: undefined, step: 3 }))}>Evet, Özete Geç</button>
                    </div>
                 </div>
               </div>
            )}

            <div style={{ padding: 'var(--space-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Sandık & Detaylar</h2>
                  <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Sandık modeli ve çikolata ekleyebilirsiniz.</p>
                </div>
                {!!w.selectedBouquet && (
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setW(p => ({ ...p, showNoBouquetConfirm: true }))}
                  >
                    Sandık İstemiyorum
                  </button>
                )}
              </div>
            </div>

            {w.wantBox && (
              <ProductCarousel
                title="🎁 Sandık Modelleri"
                products={boxes}
                selectedId={w.selectedBox?.id}
                onSelect={p => setW(prev => ({ ...prev, selectedBox: prev.selectedBox?.id === p.id ? undefined : p }))}
              />
            )}

            {/* Chocolate */}
            <div style={{ padding: 'var(--space-md)' }}>
              <div style={{ 
                background: '#fff', borderRadius: 'var(--radius-xl)', padding: 'var(--space-md)', 
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid var(--gray-100)', 
                display: 'flex', alignItems: 'center', gap: 16 
              }}>
                <div className="overflow-icon-wrapper">
                  <img src="/cikolata.png" alt="Etiketli Çikolata" className="overflow-icon-img" />
                </div>
                <div style={{ flex: 1, paddingLeft: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--nas-black)', letterSpacing: '-0.02em' }}>Etiketli Çikolata</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4, lineHeight: 1.4 }}>
                    16 ve katları şeklinde artar • 25₺/adet
                    {chocExtra > 0 && (
                      <span style={{ color: 'var(--nas-gold)', fontWeight: 600, display: 'block', marginTop: 2 }}>
                        {w.chocolateCount} Adet Seçildi (+{chocExtra} ₺)
                      </span>
                    )}
                  </div>
                </div>
                <div className="stepper" style={{ flexShrink: 0 }}>
                  <button className="stepper__btn" disabled={w.chocolateCount <= 80}
                    onClick={() => setW(p => ({ ...p, chocolateCount: Math.max(80, p.chocolateCount - 16) }))}>−</button>
                  <span className="stepper__value">{w.chocolateCount}</span>
                  <button className="stepper__btn"
                    onClick={() => setW(p => ({ ...p, chocolateCount: p.chocolateCount + 16 }))}>+</button>
                </div>
              </div>
            </div>

            <ProductCarousel
              title="🏷️ Çikolata Etiket Tasarımı"
              products={labels}
              selectedId={w.selectedLabel?.id}
              onSelect={p => {
                setW(prev => ({ ...prev, selectedLabel: prev.selectedLabel?.id === p.id ? undefined : p }));
                if (p.hasCustomImage && w.selectedLabel?.id !== p.id) {
                  setTimeout(() => {
                    const el = document.getElementById('upload-area');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }
              }}
            />

            {w.selectedLabel?.hasCustomImage && (
              <div id="upload-area" style={{ padding: '0 var(--space-md) var(--space-md)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
                  📷 {w.selectedLabel.customImageLabel}
                </div>
                <label className="upload-area">
                  <input
                    type="file" accept="image/*" multiple hidden
                    onChange={e => {
                      const files = Array.from(e.target.files || []).slice(0, 5);
                      Promise.all(files.map(f => new Promise<string>(res => {
                        const r = new FileReader();
                        r.onload = () => res(r.result as string);
                        r.readAsDataURL(f);
                      }))).then(imgs => setW(p => ({ ...p, customLabelImages: [...p.customLabelImages, ...imgs].slice(0, 5) })));
                    }}
                  />
                  {w.customLabelImages.length < 5
                    ? <><span style={{ fontSize: 32 }}>📷</span><span style={{ fontSize: 14, color: 'var(--gray-500)' }}>Fotoğraf eklemek için tıklayın (max 5)</span></>
                    : <span style={{ color: 'var(--green-600)', fontWeight: 600 }}>✓ 5 fotoğraf eklendi</span>
                  }
                </label>
                {w.customLabelImages.length > 0 && (
                  <div className="upload-grid" style={{ marginTop: 8 }}>
                    {w.customLabelImages.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={img} alt="" className="upload-thumb" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                        <button
                          onClick={() => setW(p => ({ ...p, customLabelImages: p.customLabelImages.filter((_, j) => j !== i) }))}
                          style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'var(--red-500)', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <PriceBar
              basePrice={basePrice}
              extras={[
                ...(chocExtra > 0 ? [{ label: 'Etiketli Çikolata', amount: chocExtra }] : []),
                ...(roseExtra > 0 ? [{ label: `Ekstra Güller`, amount: roseExtra }] : []),
              ]}
              total={total}
              onBack={() => setW(p => ({ ...p, step: 1 }))}
              onNext={() => setW(p => ({ ...p, step: 3 }))}
              nextDisabled={(!w.selectedBouquet && !w.selectedBox) || (w.wantBox && !w.selectedBox) || (w.selectedLabel?.hasCustomImage && w.customLabelImages.length === 0)}
              nextLabel={(w.selectedLabel?.hasCustomImage && w.customLabelImages.length === 0) ? "Fotoğraf Yükleyiniz" : "Özeti Gör"}
            />
          </div>
        )}

        {w.step === 3 && (
          <OrderSummaryStep w={w} onSubmit={handleSubmitOrder} />
        )}
      </div>
    );
  }

  return null;
}
