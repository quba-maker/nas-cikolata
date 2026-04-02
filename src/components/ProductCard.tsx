import { useState } from 'react';
import type { Product } from '../types';
import ProductDetailModal from './ProductDetailModal';
import { formatCurrency } from '../data/seedData';

interface ProductCardProps {
  product: Product;
  selected?: boolean;
  onSelect?: (p: Product) => void;
  onConfirm?: (p: Product) => void;
  width?: number | string;
}

export default function ProductCard({ product, selected, onSelect, onConfirm, width }: ProductCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);

  const badgeLabel: Record<string, string> = {
    'indirim': '🏷️ İndirim',
    'cok-satilan': '🔥 Çok Satılan',
    'cok-tercih-edilen': '⭐ Çok Tercih',
  };

  return (
    <>
      <div
        id={`product-card-${product.id}`}
        className={`product-card${selected ? ' selected' : ''}`}
        style={width ? { width } : undefined}
        onClick={() => onSelect?.(product)}
      >
        <div className="product-card__image-wrap">
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
          {product.badge && (
            <div className={`product-card__badge ${product.badge}`}>
              {badgeLabel[product.badge] || product.badge}
            </div>
          )}

          {selected && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(107,29,58,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--nas-bordeaux)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18,
                boxShadow: 'var(--shadow-bordeaux)',
              }}>✓</div>
            </div>
          )}
        </div>
        <div className="product-card__info">
          <div className="product-card__name">{product.name}</div>
          {product.description && (
            <div className="product-card__desc">{product.description}</div>
          )}
          <div className="product-card__price">
            {product.price === -1 ? null : product.price === 0 ? (
              <span className="product-card__price-free">Ücretsiz</span>
            ) : (
              <span className="product-card__price-new">{formatCurrency(product.price)}</span>
            )}
            {product.price !== -1 && product.oldPrice && product.oldPrice > product.price && (
              <span className="product-card__price-old">{formatCurrency(product.oldPrice)}</span>
            )}
          </div>
          <button 
            style={{ 
              marginTop: 12, padding: '8px 12px', background: 'var(--gray-100)', color: 'var(--nas-black)', 
              borderRadius: 100, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}
            onClick={e => { e.stopPropagation(); setDetailOpen(true); }}
          >
            Detaylı İncele
          </button>
        </div>
      </div>

      {detailOpen && (
        <ProductDetailModal
          product={product}
          onSelect={onSelect}
          onConfirm={onConfirm}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  );
}
