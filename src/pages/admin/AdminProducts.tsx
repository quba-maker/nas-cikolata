import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { Product, ProductType, BadgeType } from '../../types';
import { compressImage } from '../../utils/helpers';
import { formatCurrency } from '../../data/seedData';
import ProductCard from '../../components/ProductCard';

type Tab = 'set' | 'buket' | 'sandik' | 'etiket' | 'anne-gulu' | 'kahve-yani';

const TAB_LABELS: Record<Tab, string> = {
  set: '📦 Setler',
  buket: '💐 Buketler',
  sandik: '🎁 Sandıklar',
  etiket: '🏷️ Etiketler',
  'anne-gulu': '🌹 Anne Gülü',
  'kahve-yani': '☕ Kahve Yanı',
};

function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Product>;
  onSave: (p: Partial<Product>) => void;
  onCancel: () => void;
}) {
  const { state, updateSettings } = useApp();
  const [form, setForm] = useState<Partial<Product>>({
    type: 'set', name: '', description: '', price: 0, cost: 0,
    oldPrice: 0, badge: null, isActive: true, sortOrder: 0,
    imageUrl: '', gallery: [], categoryId: '', subCategoryId: '',
    hasCustomImage: false, freeSlots: 0,
    setContents: { buketIcerigi: [], sandikIcerigi: [], anneGulu: [], kahveYani: [] },
    ...initial,
  });

  const setField = (k: keyof Product, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await compressImage(file);
    setField('imageUrl', url);
  };

  const cats = state.categories;
  const subs = state.subCategories.filter(s => s.categoryId === form.categoryId);

  return (
    <div className="modal-overlay animate-fade-in" onClick={onCancel}>
      <div className="modal-sheet animate-fade-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="modal-title">{initial?.id ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Type */}
          <div className="input-group">
            <label className="input-label">Ürün Tipi</label>
            <select className="input-field" value={form.type} onChange={e => setField('type', e.target.value as ProductType)}>
              {(['set','buket','sandik','etiket','anne-gulu','kahve-yani'] as ProductType[]).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Kategori</label>
            <select className="input-field" value={form.categoryId} onChange={e => setField('categoryId', e.target.value)}>
              <option value="">Seçin...</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {subs.length > 0 && (
            <div className="input-group">
              <label className="input-label">Alt Kategori</label>
              <select className="input-field" value={form.subCategoryId} onChange={e => setField('subCategoryId', e.target.value)}>
                <option value="">Seçin...</option>
                {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div className="input-group">
            <label className="input-label">Ürün Adı</label>
            <input className="input-field" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Ürün adı..." />
          </div>
          <div className="input-group">
            <label className="input-label">Açıklama</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Açıklama..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label className="input-label">Satış Fiyatı (₺)</label>
              <input type="number" className="input-field" value={form.price} onChange={e => setField('price', +e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Maliyet (₺)</label>
              <input type="number" className="input-field" value={form.cost} onChange={e => setField('cost', +e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Eski Fiyat (₺)</label>
              <input type="number" className="input-field" value={form.oldPrice ?? 0} onChange={e => setField('oldPrice', +e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Rozet (Kartın Sol Üstündeki Yazı)</label>
              <select className="input-field" value={form.badge || ''} onChange={e => setField('badge', e.target.value || null)}>
                <option value="">(Yok)</option>
                {((state.settings.productBadges?.length ? state.settings.productBadges : null) || ['İndirim', 'Çok Satılan', 'Çok Tercih Edilen', 'Yeni']).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Image */}
          <div className="input-group">
            <label className="input-label">Ana Görsel</label>
            <label className="upload-area" style={{ padding: 'var(--space-md)' }}>
              <input type="file" accept="image/*" hidden onChange={handleImage} />
              {form.imageUrl
                ? <img src={form.imageUrl} alt="" style={{ height: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                : <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>+ Görsel Yükle</span>
              }
            </label>
          </div>
          
          {/* Tags */}
          <div className="input-group">
            <label className="input-label">Filtre Etiketleri (Konsept Renkleri, Örn: Gümüş, Özel Tasarım)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {((state.settings.productTags?.length ? state.settings.productTags : null) || ['Karışık', 'Beyaz', 'Gümüş', 'Gold', 'Pembe', 'Mavi', 'Sarı', 'Mor', 'Siyah', 'Kırmızı']).map(t => {
                const isSelected = form.tags?.includes(t);
                return (
                  <div
                    key={t}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 100, border: isSelected ? '1.5px solid var(--nas-bordeaux)' : '1px solid var(--gray-200)',
                      background: isSelected ? 'var(--nas-rose-light)' : '#fff', color: isSelected ? 'var(--nas-bordeaux)' : 'var(--gray-600)',
                      fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none'
                    }}
                    onClick={() => {
                      const tags = form.tags || [];
                      setField('tags', isSelected ? tags.filter(x => x !== t) : [...tags, t]);
                    }}
                  >
                    <span>{t}</span>
                    <button
                      style={{ background: 'none', border: 'none', padding: 0, margin: 0, color: 'currentColor', opacity: 0.5, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      onClick={e => {
                        e.stopPropagation();
                        // eslint-disable-next-line no-restricted-globals
                        if (window.confirm(`"${t}" etiketini sistemden tamamen silmek istiyor musunuz?`)) {
                          const ct = (state.settings.productTags?.length ? state.settings.productTags : null) || ['Karışık', 'Beyaz', 'Gümüş', 'Gold', 'Pembe', 'Mavi', 'Sarı', 'Mor', 'Siyah', 'Kırmızı'];
                          updateSettings({ ...state.settings, productTags: ct.filter(x => x !== t) });
                        }
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                );
              })}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="+ Yeni"
                  style={{ width: 70, border: 'none', borderBottom: '1px solid var(--gray-300)', fontSize: 13, padding: '4px 0', background: 'transparent', outline: 'none' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      const ct = (state.settings.productTags?.length ? state.settings.productTags : null) || ['Karışık', 'Beyaz', 'Gümüş', 'Gold', 'Pembe', 'Mavi', 'Sarı', 'Mor', 'Siyah', 'Kırmızı'];
                      if (val && !ct.includes(val)) {
                        updateSettings({ ...state.settings, productTags: [...ct, val] });
                        const tags = form.tags || [];
                        setField('tags', [...tags, val]); // Auto select it
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
          {/* Extras for sets */}
          {form.type === 'etiket' && (
            <div className="input-group">
              <label className="input-label">Özel Fotoğraf Yükleme</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="checkbox" checked={!!form.hasCustomImage} onChange={e => setField('hasCustomImage', e.target.checked)} />
                <span style={{ fontSize: 14 }}>Müşteri fotoğraf yükleyebilsin</span>
              </div>
              {form.hasCustomImage && (
                <input className="input-field" style={{ marginTop: 8 }} placeholder="Açıklama etiketi..." value={form.customImageLabel ?? ''} onChange={e => setField('customImageLabel', e.target.value)} />
              )}
            </div>
          )}
          {(form.type === 'sandik' || form.type === 'buket') && (
            <div className="input-group">
              <label className="input-label">Ücretsiz Slot</label>
              <input type="number" className="input-field" value={form.freeSlots ?? 0} onChange={e => setField('freeSlots', +e.target.value)} />
            </div>
          )}
          {form.type === 'set' && (
            <div style={{ background: '#F8F9FA', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid var(--gray-200)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 'var(--space-md) 0 var(--space-sm)' }}>Set İçeriği</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ marginBottom: 12 }}>
                  <label className="input-label" style={{ fontSize: 13 }}>Sette Dahil Olan Anne Gülü Adedi</label>
                  <input type="number" className="input-field" value={form.includedRoseCount ?? 2} 
                    onChange={e => setField('includedRoseCount', parseInt(e.target.value) || 0)} min={0} />
                </div>
                <div className="input-group" style={{ marginBottom: 12 }}>
                  <label className="input-label" style={{ fontSize: 13 }}>Setteki Karışık Çikolata Adedi</label>
                  <input type="number" className="input-field" value={form.includedChocolateCount ?? 0} 
                    onChange={e => setField('includedChocolateCount', parseInt(e.target.value) || 0)} min={0} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: 13 }}>Buket İçeriği</label>
                  <textarea className="input-field" rows={3} value={form.setContents?.buketIcerigi?.join('\n') || ''} 
                    onChange={e => setField('setContents', { ...form.setContents, buketIcerigi: e.target.value.split('\n').filter(Boolean) })} placeholder="Örn: 36 adet yapay kırmızı gül" />
                </div>
                
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: 13 }}>Sandık İçeriği</label>
                  <textarea className="input-field" rows={3} value={form.setContents?.sandikIcerigi?.join('\n') || ''} 
                    onChange={e => setField('setContents', { ...form.setContents, sandikIcerigi: e.target.value.split('\n').filter(Boolean) })} placeholder="Örn: 36 adet premium çikolata" />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: 13 }}>Anne Gülü</label>
                  <textarea className="input-field" rows={2} value={form.setContents?.anneGulu?.join('\n') || ''} 
                    onChange={e => setField('setContents', { ...form.setContents, anneGulu: e.target.value.split('\n').filter(Boolean) })} placeholder="Örn: 2 adet kadife gül (ücretsiz)" />
                </div>
                
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: 13 }}>Kahve Yanı</label>
                  <textarea className="input-field" rows={2} value={form.setContents?.kahveYani?.join('\n') || ''} 
                    onChange={e => setField('setContents', { ...form.setContents, kahveYani: e.target.value.split('\n').filter(Boolean) })} placeholder="Örn: Fincan çikolata seti" />
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-md">
            <input type="checkbox" id="isActive" checked={!!form.isActive} onChange={e => setField('isActive', e.target.checked)} />
            <label htmlFor="isActive" style={{ fontSize: 14, fontWeight: 500 }}>Aktif (sipariş ekranında göster)</label>
          </div>
        </div>
        <div className="modal-footer">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="btn btn-secondary" onClick={onCancel}>İptal</button>
            <button className="btn btn-primary" onClick={() => onSave(form)} disabled={!form.name || !form.categoryId}>
              {initial?.id ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<Tab>('set');
  const [editing, setEditing] = useState<Product | null | 'new'>(null);

  const products = state.products.filter(p => p.type === tab).sort((a, b) => a.sortOrder - b.sortOrder);

  const handleSave = (form: Partial<Product>) => {
    if (editing === 'new') {
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        type: form.type ?? 'set',
        categoryId: form.categoryId ?? '',
        subCategoryId: form.subCategoryId,
        name: form.name ?? '',
        description: form.description ?? '',
        price: form.price ?? 0,
        cost: form.cost ?? 0,
        oldPrice: form.oldPrice,
        badge: (form.badge as BadgeType) ?? null,
        imageUrl: form.imageUrl ?? '',
        gallery: form.gallery ?? [],
        isActive: form.isActive ?? true,
        sortOrder: state.products.length,
        hasCustomImage: form.hasCustomImage,
        customImageLabel: form.customImageLabel,
        freeSlots: form.freeSlots,
        setContents: form.setContents,
      };
      dispatch({ type: 'ADD_PRODUCT', product: newProd });
    } else if (editing) {
      dispatch({ type: 'UPDATE_PRODUCT', id: editing.id, updates: form });
    }
    setEditing(null);
  };

  return (
    <div style={{ padding: 'var(--space-md)', paddingBottom: 100 }}>
      {/* Tab */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 'var(--space-md)', paddingBottom: 4 }}>
        {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
          <button
            key={t}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{products.length} ürün</div>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>+ Yeni Ekle</button>
      </div>

      {/* Product list */}
      {products.length === 0 && (
        <div className="glass-block" style={{ textAlign: 'center', padding: 'var(--space-3xl)', margin: 'var(--space-md) 0' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>Henüz bu kategoride ürün yok</div>
        </div>
      )}

      <div className="glass-block" style={{ background: '#fff', padding: 'var(--space-xs)' }}>
        {products.map((p, idx) => (
          <div key={p.id} className="glass-list-item" style={{
            display: 'flex', alignItems: 'center', padding: '12px', gap: 'var(--space-md)',
            border: 'none', borderBottom: idx < products.length - 1 ? '1px solid var(--gray-100)' : 'none',
            borderRadius: 0, margin: 0, background: 'transparent', boxShadow: 'none'
          }}>
            <img src={p.imageUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23f3f4f6" width="80" height="80"/></svg>'}
              alt={p.name} style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6, opacity: 0.9 }}>{p.description?.slice(0, 60)}{p.description?.length > 60 ? '...' : ''}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--nas-bordeaux)' }}>{formatCurrency(p.price)}</span>
                <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>Maliyet: {formatCurrency(p.cost)}</span>
                {!p.isActive && <span className="badge badge-gray">Pasif</span>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="btn btn-sm" style={{ background: 'var(--gray-100)', color: 'var(--gray-800)' }} onClick={() => setEditing(p)}>✏️ Düzenle</button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      {products.length > 0 && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Müşteri Önizlemesi
          </div>
          <div className="h-scroll">
            {products.slice(0, 6).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {editing && (
        <ProductForm
          initial={editing === 'new' ? { type: tab } : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
