import { useState, useRef, useEffect } from 'react';
import type { Product } from '../types';
import ProductCard from './ProductCard';
import ProductCatalogModal from './ProductCatalogModal';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  selectedId?: string;
  onSelect?: (p: Product) => void;
  onConfirm?: (p: Product) => void;
  showAll?: boolean;
  cardWidth?: number;
}

export default function ProductCarousel({
  title, products, selectedId, onSelect, onConfirm, showAll = true, cardWidth
}: ProductCarouselProps) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedId && scrollRef.current) {
      const el = document.getElementById(`product-card-${selectedId}`);
      if (el) {
        const container = scrollRef.current;
        const scrollLeft = el.offsetLeft - (container.clientWidth / 2) + (el.clientWidth / 2);
        container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
      }
    }
  }, [selectedId]);

  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <div className="flex items-center justify-between" style={{ padding: '0 var(--space-md)', marginBottom: 'var(--space-sm)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h3>
        {showAll && products.length > 2 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setCatalogOpen(true)}>
            Tümünü Gör →
          </button>
        )}
      </div>
      <div className="h-scroll" ref={scrollRef} style={{ padding: '4px var(--space-md) var(--space-sm)' }}>
        {products.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            selected={selectedId === p.id}
            onSelect={onSelect}
            onConfirm={onConfirm}
            width={cardWidth}
          />
        ))}
      </div>
      {catalogOpen && (
        <ProductCatalogModal
          title={title}
          products={products}
          selectedId={selectedId}
          onSelect={p => { onSelect?.(p); setCatalogOpen(false); }}
          onConfirm={p => { if (onConfirm) onConfirm(p); else onSelect?.(p); setCatalogOpen(false); }}
          onClose={() => setCatalogOpen(false)}
        />
      )}
    </div>
  );
}
