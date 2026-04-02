import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '../types';
import { formatCurrency } from '../data/seedData';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onSelect?: (p: Product) => void;
  onConfirm?: (p: Product) => void;
}

export default function ProductDetailModal({ product, onClose, onSelect, onConfirm }: ProductDetailModalProps) {
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef(0);
  const isDragging = useRef(false);

  const images = product.gallery?.length > 0 ? product.gallery : [product.imageUrl];

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

  const modalContent = (
    <div className="mobile-modal-backdrop animate-fade-in" style={{ zIndex: 100000 }}>
      <div className="mobile-wrapper" style={{ background: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px var(--space-md)', width: '100%'
      }}>
        <button onClick={onClose} style={{ 
          background: 'none', border: 'none', color: 'var(--nas-bordeaux)', fontSize: 16, fontWeight: 600, 
          display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '8px 0'
        }}>
          ‹ Geri
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--nas-black)' }}>Ürün Detayı</span>
        <div style={{ width: 60 }} /> {/* Spacer for centering */}
      </div>

      {/* Content wrapper */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 120 }}>
        
        {/* Gallery Area */}
        <div 
          style={{ position: 'relative', width: '100%', aspectRatio: '1', backgroundColor: '#f9f9f9', overflow: 'hidden' }}
          onMouseDown={onTouchStart} onMouseMove={onTouchMove} onMouseUp={onTouchEnd} onMouseLeave={onTouchEnd}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          <div style={{
            display: 'flex', height: '100%', transition: isDragging.current ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
            transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))`
          }}>
            {images.map((img, i) => (
              <img 
                key={i} 
                src={img || 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&h=800&q=80&fit=crop'} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', flexShrink: 0, pointerEvents: 'none' }} 
              />
            ))}
          </div>
          
          {/* Badge */}
          {product.badge && (
            <div style={{
              position: 'absolute', top: 16, left: 16, background: 'rgba(17,17,17,0.85)', color: '#fff',
              padding: '6px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', backdropFilter: 'blur(8px)'
            }}>
              {product.badge === 'indirim' ? '🏷️ İndirim' : product.badge === 'cok-satilan' ? '🔥 Çok Satılan' : product.badge === 'cok-tercih-edilen' ? '⭐ Çok Tercih' : product.badge}
            </div>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
              {images.map((_, i) => (
                <div key={i} style={{ 
                  width: i === current ? 20 : 6, height: 6, borderRadius: 3, 
                  background: i === current ? 'var(--nas-rose)' : 'rgba(0,0,0,0.2)', transition: 'all 0.3s' 
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{ padding: 'var(--space-lg) var(--space-md)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--nas-black)', marginBottom: 8, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {product.name}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--nas-bordeaux)' }}>
              {product.price > 0 ? formatCurrency(product.price) : 'Fiyat Sorunuz'}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span style={{ fontSize: 16, color: 'var(--gray-400)', textDecoration: 'line-through', marginBottom: 4 }}>
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--gray-100)', marginBottom: 24 }} />

          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--nas-black)', marginBottom: 12 }}>Ürün Açıklaması</h3>
          <p style={{ fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {product.description || 'Bu ürün için detaylı bir açıklama girilmemiş.'}
          </p>

          {product.tags && product.tags.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Etiketler</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {product.tags.map(t => (
                  <span key={t} style={{ 
                    padding: '6px 12px', background: 'var(--gray-100)', color: 'var(--nas-black)', 
                    fontSize: 13, fontWeight: 500, borderRadius: 100 
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
          position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--space-md) var(--space-lg)', paddingBottom: 'calc(var(--space-md) + env(safe-area-inset-bottom, 24px))',
          background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--gray-100)',
          zIndex: 10
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            <button 
              className="btn btn-primary"
              style={{ flex: 1, padding: '16px', borderRadius: 100, fontSize: 16, fontWeight: 800, boxShadow: '0 8px 24px rgba(107,29,58,0.2)' }}
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
