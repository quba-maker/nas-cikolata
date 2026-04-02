import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface GalleryModalProps {
  images: string[];
  title: string;
  onClose: () => void;
}

export default function GalleryModal({ images, title, onClose }: GalleryModalProps) {
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef(0);
  const isDragging = useRef(false);

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
  const next = () => setCurrent(i => (i + 1) % images.length);

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; isDragging.current = true; };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    setDragOffset(e.touches[0].clientX - startX.current);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setDragOffset(0);
    isDragging.current = false;
  };

  const onMouseDown = (e: React.MouseEvent) => { startX.current = e.clientX; isDragging.current = true; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setDragOffset(e.clientX - startX.current);
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const diff = startX.current - e.clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setDragOffset(0);
    isDragging.current = false;
  };
  const onMouseLeave = () => {
    if (isDragging.current) {
      setDragOffset(0);
      isDragging.current = false;
    }
  };

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  const modalContent = (
    <div className="modal-overlay center animate-fade-in" onClick={onClose} onKeyDown={handleKey} tabIndex={0} style={{ backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.85)', zIndex: 100000 }}>
      <div className="animate-scale-in" onClick={e => e.stopPropagation()}
        style={{ background: '#111', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', width: '100%', maxWidth: 500, margin: 'auto' }}>
        <div className="modal-header" style={{ background: '#111', color: '#fff', borderBottom: '1px solid #222' }}>
          <span className="modal-title" style={{ color: '#fff' }}>{title}</span>
          <button className="btn btn-icon" style={{ background: '#333', color: '#fff' }} onClick={onClose}>✕</button>
        </div>
        <div
          style={{ position: 'relative', userSelect: 'none', cursor: isDragging.current ? 'grabbing' : 'grab', overflow: 'hidden' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <div style={{
            transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))`,
            transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${title} ${i + 1}`}
                style={{ width: '100%', flexShrink: 0, display: 'block', maxHeight: '60vh', objectFit: 'contain', pointerEvents: 'none', background: '#111' }}
                draggable={false}
              />
            ))}
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev(); }}
                style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 40, height: 40, border: 'none', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                }}
              >‹</button>
              <button
                onClick={e => { e.stopPropagation(); next(); }}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 40, height: 40, border: 'none', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                }}
              >›</button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="gallery-thumb-row" style={{ padding: '12px', background: '#111' }}>
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className={`gallery-thumb ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        )}
        <div style={{ padding: '8px 16px 16px', background: '#111', textAlign: 'center', color: '#888', fontSize: 12 }}>
          {current + 1} / {images.length}
        </div>
      </div>
    </div>
  );

  return document.body ? createPortal(modalContent, document.body) : modalContent;
}
