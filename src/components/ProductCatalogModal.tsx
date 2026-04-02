import { useState, useMemo } from 'react';
import type { Product } from '../types';
import ProductCard from './ProductCard';
import { createPortal } from 'react-dom';

interface ProductCatalogModalProps {
  title: string;
  products: Product[];
  selectedId?: string;
  onSelect?: (p: Product) => void;
  onConfirm?: (p: Product) => void;
  onClose: () => void;
}

export default function ProductCatalogModal({ title, products, selectedId, onSelect, onConfirm, onClose }: ProductCatalogModalProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [localSelected, setLocalSelected] = useState<Product | undefined>(
    products.find(p => p.id === selectedId)
  );

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!activeTag) return products;
    return products.filter(p => p.tags?.includes(activeTag));
  }, [products, activeTag]);

  const modalContent = (
    <div className="animate-fade-in mobile-modal-backdrop">
      <div className="mobile-wrapper" style={{ background: '#FAFAFA', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: 'env(safe-area-inset-top, 20px) var(--space-md) var(--space-sm)', background: '#fff', borderBottom: availableTags.length > 0 ? 'none' : '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--nas-bordeaux)', fontWeight: 600, fontSize: 16, cursor: 'pointer', padding: '8px 0' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Geri
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800, flex: 1, textAlign: 'center', marginRight: 48 }}>{title}</h2>
      </div>

      {availableTags.length > 0 && (
        <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-100)', padding: '0 0 var(--space-md) 0' }}>
          <div style={{ padding: '0 var(--space-md) 12px var(--space-md)', fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, letterSpacing: '-0.2px', textAlign: 'center' }}>
            Konsept renginize göre ürünleri filtreleyin:
          </div>
          <div className="h-scroll hide-scrollbar" style={{ padding: '0 var(--space-md)', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => setActiveTag(null)}
              style={{
                padding: '6px 14px', borderRadius: 100, border: !activeTag ? '1.5px solid var(--nas-bordeaux)' : '1px solid var(--gray-200)',
                background: !activeTag ? 'var(--nas-rose-light)' : '#fff', color: !activeTag ? 'var(--nas-bordeaux)' : 'var(--gray-600)',
                fontSize: 13, fontWeight: !activeTag ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0, outline: 'none'
              }}
            >
              Tümü
            </button>
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  padding: '6px 14px', borderRadius: 100, border: activeTag === tag ? '1.5px solid var(--nas-bordeaux)' : '1px solid var(--gray-200)',
                  background: activeTag === tag ? 'var(--nas-rose-light)' : '#fff', color: activeTag === tag ? 'var(--nas-bordeaux)' : 'var(--gray-600)',
                  fontSize: 13, fontWeight: activeTag === tag ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0, outline: 'none'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="catalog-grid-responsive" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-md)',
          }}>
            {filteredProducts.map(p => (
              <div key={p.id} style={{ width: '100%' }}>
                <ProductCard
                  product={p}
                  selected={localSelected?.id === p.id}
                  onSelect={prod => setLocalSelected(localSelected?.id === prod.id ? undefined : prod)}
                  onConfirm={onConfirm}
                  width={undefined}
                />
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom, 24px)' }} />
      </div>

      {localSelected && (
        <div className="animate-fade-slide-up" style={{
          position: 'sticky', bottom: 0, 
          padding: '16px var(--space-md) calc(16px + env(safe-area-inset-bottom, 0px))', 
          background: '#fff', 
          borderTop: '1px solid var(--gray-200)', 
          boxShadow: '0 -10px 40px rgba(0,0,0,0.08)',
          zIndex: 10
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{localSelected.name}</div>
            <div style={{ fontWeight: 700, color: 'var(--nas-bordeaux)' }}>{localSelected.price} ₺</div>
          </div>
          <button 
            className="btn btn-primary"
            style={{ padding: '12px 24px', fontWeight: 800 }}
            onClick={() => {
              if (onConfirm) onConfirm(localSelected);
              else onSelect?.(localSelected);
            }}
          >
            Seçimi Onayla
          </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );

  return document.body ? createPortal(modalContent, document.body) : modalContent;
}
