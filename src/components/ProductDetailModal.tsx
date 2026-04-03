import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '../types';
import { formatCurrency } from '../data/seedData';
import { useApp } from '../store/AppContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onSelect?: (p: Product) => void;
  onConfirm?: (p: Product) => void;
}

export default function ProductDetailModal({ product, onClose, onSelect, onConfirm }: ProductDetailModalProps) {
  const { state } = useApp();
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef(0);
  const isDragging = useRef(false);

  // Stop body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const categoryName = state?.categories?.find(c => c.id === product.categoryId)?.name || 'Özel Üretim Kombinasyon';

  // Güvenli galeri kontrolü (Eski önbellekten bozuk array gelebilir)
  const validGallery = product.gallery?.filter(g => typeof g === 'string' && g.trim().length > 5) || [];
  const baseImg = product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim().length > 5 ? product.imageUrl : 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&h=800&q=80&fit=crop';
  
  // Sorunsuz çalışan Ana Görsel'i GARANTİ olarak daima 1. sıraya (Kapak) koyuyoruz!
  const images = Array.from(new Set([baseImg, ...validGallery]));

  const next = useCallback(() => setCurrent(c => (c + 1) % images.length), [images.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + images.length) % images.length), [images.length]);

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true;
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };
  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragOffset(x - startX.current);
  };
  const onTouchEnd = () => {
    if (!isDragging.current) return;
    if (Math.abs(dragOffset) > 50) dragOffset > 0 ? prev() : next();
    setDragOffset(0);
    isDragging.current = false;
  };

  const hasExtraContents = !!(product.setContents?.buketIcerigi?.length || product.setContents?.sandikIcerigi?.length || product.setContents?.anneGulu?.length || product.setContents?.kahveYani?.length);

  const modalContent = (
    <div className="mobile-modal-backdrop animate-fade-in" style={{ zIndex: 100000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
      <div className="mobile-wrapper" style={{ background: '#FAF9F8', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px var(--space-md)', paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
        pointerEvents: 'none'
      }}>
        <button onClick={onClose} style={{ 
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', color: '#FFF', fontSize: 16, fontWeight: 700, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', pointerEvents: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          ✕
        </button>
      </div>

      {/* Content wrapper */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 150 }}>
        
        {/* Gallery Area - 3:4 aspect ratio for full visibility */}
        <div 
          style={{ position: 'relative', width: '100%', aspectRatio: '3/4', backgroundColor: '#E5E5E5', overflow: 'hidden' }}
          onMouseDown={onTouchStart} onMouseMove={onTouchMove} onMouseUp={onTouchEnd} onMouseLeave={onTouchEnd}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          <div style={{
            display: 'flex', height: '100%', transition: isDragging.current ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))`
          }}>
            {images.map((img, i) => (
              <img 
                key={i} 
                src={img} 
                onError={(e) => { e.currentTarget.src = baseImg; }}
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', flexShrink: 0, pointerEvents: 'none' }} 
              />
            ))}
          </div>
          
          {/* Badge */}
          {product.badge && (
            <div style={{
              position: 'absolute', top: 'calc(16px + env(safe-area-inset-top, 0px))', right: 16, background: 'rgba(255,255,255,0.9)', color: 'var(--nas-bordeaux)',
              padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {product.badge === 'indirim' ? '🏷️ İndirim' : product.badge === 'cok-satilan' ? '🔥 Popüler' : product.badge === 'cok-tercih-edilen' ? '⭐ Tercih Edilen' : product.badge}
            </div>
          )}

          {/* Pagination Indicators */}
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
              {images.map((_, i) => (
                <div key={i} style={{ 
                  width: i === current ? 24 : 8, height: 8, borderRadius: 4, 
                  background: i === current ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Product Meta Data */}
        <div style={{ padding: 'var(--space-2xl) var(--space-lg)', position: 'relative', marginTop: -20, background: '#FAF9F8', borderRadius: '24px 24px 0 0', zIndex: 5 }}>
          
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--nas-gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
            {categoryName}
          </div>
          
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 36px)', fontWeight: 900, color: 'var(--nas-black)', marginBottom: 12, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            {product.name}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 32 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--nas-bordeaux)', letterSpacing: '-0.02em' }}>
              {product.price > 0 ? formatCurrency(product.price) : 'Fiyat Sorunuz'}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span style={{ fontSize: 18, color: 'var(--gray-400)', textDecoration: 'line-through', marginBottom: 4, fontWeight: 600 }}>
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>

          <p style={{ fontSize: 16, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 32 }}>
            {product.description || 'Bu eşsiz ürünün detaylarına buradan ulaşabilirsiniz.'}
          </p>

          {/* ADVANCED CONTENT BENTO GRID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            
            {(product.includedRoseCount! > 0 || product.includedChocolateCount! > 0) && (
              <div className="dashboard-panel-card" style={{ padding: 'var(--space-lg)', background: '#FFF' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--nas-black)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🎁</span> Set Hediyeleri
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {product.includedRoseCount! > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: 12 }}>
                      <span style={{ fontSize: 14, color: 'var(--gray-600)', fontWeight: 500 }}>Anne Gülü Adedi</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--nas-bordeaux)' }}>{product.includedRoseCount} Adet (Sette Ücretsiz)</span>
                    </div>
                  )}
                  {product.includedChocolateCount! > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: 'var(--gray-600)', fontWeight: 500 }}>Karışık Ekstra Çikolata</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--nas-bordeaux)' }}>{product.includedChocolateCount} Adet Dağıtmalık</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {hasExtraContents && (
              <div className="dashboard-panel-card" style={{ padding: 'var(--space-lg)', background: '#FFF' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--nas-black)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>💎</span> Detaylı İçerik Listesi
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                  
                  {product.setContents?.buketIcerigi && product.setContents.buketIcerigi.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nas-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>💐 Buket Kompleksi</div>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.8 }}>
                        {product.setContents.buketIcerigi.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {product.setContents?.sandikIcerigi && product.setContents.sandikIcerigi.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nas-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>📦 Sandık Kompleksi</div>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.8 }}>
                        {product.setContents.sandikIcerigi.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {product.setContents?.anneGulu && product.setContents.anneGulu.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nas-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>🌹 Anne Gülü Tasarımı</div>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.8 }}>
                        {product.setContents.anneGulu.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {product.setContents?.kahveYani && product.setContents.kahveYani.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--nas-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>☕ Kahve Yanı Sunumu</div>
                      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.8 }}>
                        {product.setContents.kahveYani.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* Tags (Minimalist Badges) */}
          {product.tags && product.tags.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {product.tags.map(t => (
                  <span key={t} style={{ 
                    padding: '8px 16px', background: '#EAE8E5', color: 'var(--nas-black)', 
                    fontSize: 13, fontWeight: 600, borderRadius: 100 
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      {(onSelect || onConfirm) && (
        <div className="animate-fade-slide-up" style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px var(--space-lg)', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 24px))',
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(30px)', borderTop: '1px solid rgba(0,0,0,0.05)',
          zIndex: 100, boxShadow: '0 -10px 40px rgba(0,0,0,0.05)'
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            <button 
              className="btn btn-primary"
              style={{ flex: 1, padding: '18px', borderRadius: 100, fontSize: 16, fontWeight: 800, background: 'var(--nas-black)', color: '#fff', boxShadow: 'none' }}
              onClick={() => {
                if (onConfirm) onConfirm(product);
                else if (onSelect) onSelect(product);
                onClose();
              }}
            >
              Siparişe Ekle / Seçimi Onayla
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );

  return document.body ? createPortal(modalContent, document.body) : modalContent;
}
