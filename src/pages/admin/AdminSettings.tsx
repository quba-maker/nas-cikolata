import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { IbanInfo, WhatsAppTemplate } from '../../types';

const TEMPLATE_VARS = [
  '{gelin_adi}', '{damat_adi}', '{siparis_no}',
  '{toplam_tutar}', '{kapora_tutar}', '{teslim_tarihi}',
  '{banka_adi}', '{hesap_adi}', '{iban}',
  '{takip_linki}', '{google_link}', '{program_tarihi}',
];

export default function AdminSettings() {
  const { state, updateSettings, dispatch } = useApp();
  const s = state.settings;
  const [saved, setSaved] = useState(false);
  const [local, setLocal] = useState({ ...s });
  const [editTpl, setEditTpl] = useState<WhatsAppTemplate | null>(null);

  const save = (updates: Partial<typeof s>) => {
    const merged = { ...local, ...updates };
    setLocal(merged);
    updateSettings(merged);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addIban = () => {
    const newIban: IbanInfo = {
      id: `iban_${Date.now()}`,
      partnerId: 'ortak2',
      bankName: '',
      holderName: '',
      iban: '',
      isDefault: false,
    };
    save({ ibans: [...local.ibans, newIban] });
  };

  const updateIban = (id: string, updates: Partial<IbanInfo>) => {
    save({ ibans: local.ibans.map(i => i.id === id ? { ...i, ...updates } : i) });
  };

  const deleteIban = (id: string) => {
    save({ ibans: local.ibans.filter(i => i.id !== id) });
  };

  const saveTpl = (tpl: WhatsAppTemplate) => {
    save({ whatsappTemplates: local.whatsappTemplates.map(t => t.id === tpl.id ? tpl : t) });
    setEditTpl(null);
  };

  const insertVar = (v: string) => {
    if (!editTpl) return;
    setEditTpl(t => t ? { ...t, body: t.body + v } : null);
  };

  return (
    <div style={{ padding: 'var(--space-md)', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {saved && (
        <div className="toast success" style={{ position: 'fixed', top: 'var(--space-md)', right: 'var(--space-md)', zIndex: 999 }}>
          ✅ Kaydedildi!
        </div>
      )}

      {/* General settings */}
      <div className="glass-block" style={{ padding: 'var(--space-md)', background: '#fff' }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 'var(--space-md)' }}>⚙️ Genel Ayarlar</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Firma Adı', key: 'firmName' },
            { label: 'Firma WhatsApp (90 ile başlayan)', key: 'firmWhatsapp' },
            { label: 'Pleksici WhatsApp', key: 'pleksiWhatsapp' },
            { label: 'Google Yorum Linki', key: 'googleReviewUrl' },
            { label: 'Sipariş Takip Base URL', key: 'orderTrackingBaseUrl' },
          ].map(({ label, key }) => (
            <div key={key} className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">{label}</label>
              <input
                className="input-field"
                value={(local as Record<string, unknown>)[key] as string ?? ''}
                onChange={e => setLocal(p => ({ ...p, [key]: e.target.value }))}
                onBlur={() => save({ [key]: (local as Record<string, unknown>)[key] })}
              />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Kapora Oranı (%)</label>
              <input type="number" className="input-field" value={Math.round(local.depositRate * 100)}
                onChange={e => setLocal(p => ({ ...p, depositRate: +e.target.value / 100 }))}
                onBlur={() => save({ depositRate: local.depositRate })} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Ücretsiz Anne Gülü</label>
              <input type="number" className="input-field" value={local.roseFreeSlotsDefault}
                onChange={e => setLocal(p => ({ ...p, roseFreeSlotsDefault: +e.target.value }))}
                onBlur={() => save({ roseFreeSlotsDefault: local.roseFreeSlotsDefault })} />
            </div>
          </div>
        </div>
      </div>

      {/* Product Tags */}
      <div className="glass-block" style={{ padding: 'var(--space-md)', background: '#fff' }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 'var(--space-md)' }}>🏷️ Ürün Etiketleri (Renk vb.)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {((local.productTags?.length ? local.productTags : null) || ['Karışık', 'Beyaz', 'Gümüş', 'Gold', 'Pembe', 'Mavi', 'Sarı', 'Mor', 'Siyah', 'Kırmızı']).map(tag => (
              <div key={tag} style={{
                padding: '6px 12px', borderRadius: 100, border: '1px solid var(--gray-200)',
                background: '#fff', color: 'var(--nas-black)', fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                {tag}
                <button 
                  style={{ background: 'none', border: 'none', color: 'var(--nas-bordeaux)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  onClick={() => {
                    const currentTags = local.productTags?.length ? local.productTags : ['Karışık', 'Beyaz', 'Gümüş', 'Gold', 'Pembe', 'Mavi', 'Sarı', 'Mor', 'Siyah', 'Kırmızı'];
                    save({ productTags: currentTags.filter(t => t !== tag) });
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              type="text" 
              className="input-field" 
              id="new-tag-input"
              placeholder="Yeni etiket (Örn: Yeşil)..." 
              style={{ flex: 1 }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value.trim();
                  const currentTags = local.productTags?.length ? local.productTags : ['Karışık', 'Beyaz', 'Gümüş', 'Gold', 'Pembe', 'Mavi', 'Sarı', 'Mor', 'Siyah', 'Kırmızı'];
                  if (val && !currentTags.includes(val)) {
                    save({ productTags: [...currentTags, val] });
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
            <button 
              className="btn btn-secondary"
              onClick={() => {
                const el = document.getElementById('new-tag-input') as HTMLInputElement;
                const val = el?.value.trim();
                const currentTags = local.productTags?.length ? local.productTags : ['Karışık', 'Beyaz', 'Gümüş', 'Gold', 'Pembe', 'Mavi', 'Sarı', 'Mor', 'Siyah', 'Kırmızı'];
                if (val && !currentTags.includes(val)) {
                  save({ productTags: [...currentTags, val] });
                  el.value = '';
                }
              }}
            >
              Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Product Badges */}
      <div className="glass-block" style={{ padding: 'var(--space-md)', background: '#fff' }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 'var(--space-md)' }}>🎀 Ürün Rozetleri (Sol Üst Köşe Yazısı)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {((local.productBadges?.length ? local.productBadges : null) || ['İndirim', 'Çok Satılan', 'Çok Tercih Edilen', 'Yeni']).map(badge => (
              <div key={badge} style={{
                padding: '6px 12px', borderRadius: 100, border: '1px solid var(--gray-200)',
                background: '#fff', color: 'var(--nas-black)', fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                {badge}
                <button 
                  style={{ background: 'none', border: 'none', color: 'var(--nas-bordeaux)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  onClick={() => {
                    const currentBadges = local.productBadges?.length ? local.productBadges : ['İndirim', 'Çok Satılan', 'Çok Tercih Edilen', 'Yeni'];
                    save({ productBadges: currentBadges.filter(b => b !== badge) });
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              type="text" 
              className="input-field" 
              id="new-badge-input"
              placeholder="Yeni rozet (Örn: Tükeniyor)..." 
              style={{ flex: 1 }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value.trim();
                  const currentBadges = local.productBadges?.length ? local.productBadges : ['İndirim', 'Çok Satılan', 'Çok Tercih Edilen', 'Yeni'];
                  if (val && !currentBadges.includes(val)) {
                    save({ productBadges: [...currentBadges, val] });
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
            <button 
              className="btn btn-secondary"
              onClick={() => {
                const el = document.getElementById('new-badge-input') as HTMLInputElement;
                const val = el?.value.trim();
                const currentBadges = local.productBadges?.length ? local.productBadges : ['İndirim', 'Çok Satılan', 'Çok Tercih Edilen', 'Yeni'];
                if (val && !currentBadges.includes(val)) {
                  save({ productBadges: [...currentBadges, val] });
                  el.value = '';
                }
              }}
            >
              Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Custom Order Category Forms */}
      <div className="glass-block" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)', background: '#fff' }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 'var(--space-md)' }}>🖼️ Kendin Oluştur Kategorileri</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { key: 'customOrderBouquetImg', label: 'Buket Aranjmanlar', desc: 'İlk adımdaki Buket buton resmi' },
            { key: 'customOrderBoxImg', label: 'Kutu Aranjmanlar', desc: 'İlk adımdaki Kutu buton resmi' },
            { key: 'customOrderSakayikImg', label: 'Şakayık Buketler', desc: 'Gül veya Şakayık seçim resimleri' },
            { key: 'customOrderGulImg', label: 'Yapay Gül Buketleri', desc: 'Gül veya Şakayık seçim resimleri' },
          ].map(({ key, label, desc }) => {
            const val = (local as Record<string, unknown>)[key] as string;
            return (
              <div key={key} style={{ padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 8 }}>{desc}</div>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#e5e7eb', marginBottom: 8 }}>
                  <img src={val} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <label style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: 12, fontWeight: 700, opacity: 0, transition: '0.2s', cursor: 'pointer' }}
                    className="hover-opacity-100">
                    Değiştir
                    <input type="file" hidden accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => save({ [key]: reader.result });
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Partners */}
      <div className="glass-block" style={{ padding: 'var(--space-md)', background: '#fff' }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 'var(--space-md)' }}>👥 Ortaklar</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { key: 'partner1Name', shareKey: 'partner1Share', label: 'Ortak 1 (Kasa)' },
            { key: 'partner2Name', shareKey: 'partner2Share', label: 'Ortak 2' },
          ].map(({ key, shareKey, label }) => (
            <div key={key} style={{ padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 6 }}>{label}</div>
              <input className="input-field" value={(local as Record<string, unknown>)[key] as string}
                onChange={e => setLocal(p => ({ ...p, [key]: e.target.value }))}
                onBlur={() => save({ [key]: (local as Record<string, unknown>)[key] })}
                style={{ marginBottom: 8 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>Kar Payı:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--nas-bordeaux)' }}>
                  %{Math.round(((local as Record<string, unknown>)[shareKey] as number) * 100)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IBANs */}
      <div className="glass-block" style={{ padding: 'var(--space-md)', background: '#fff' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>💳 IBAN Listesi</div>
          <button className="btn btn-primary btn-sm" onClick={addIban}>+ Ekle</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {local.ibans.map(iban => (
            <div key={iban.id} style={{ padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 4 }}>Ortak</div>
                  <select className="input-field" value={iban.partnerId}
                    onChange={e => updateIban(iban.id, { partnerId: e.target.value as 'ortak1' | 'ortak2' })}
                    style={{ padding: '10px 12px', fontSize: 13 }}>
                    <option value="ortak1">{local.partner1Name}</option>
                    <option value="ortak2">{local.partner2Name}</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 4 }}>Banka</div>
                  <input className="input-field" value={iban.bankName}
                    onChange={e => updateIban(iban.id, { bankName: e.target.value })}
                    placeholder="Garanti BBVA" style={{ padding: '10px 12px', fontSize: 13 }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 4 }}>Ad Soyad</div>
                <input className="input-field" value={iban.holderName}
                  onChange={e => updateIban(iban.id, { holderName: e.target.value })}
                  placeholder="Ad Soyad" style={{ padding: '10px 12px', fontSize: 13 }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 4 }}>IBAN</div>
                <input className="input-field" value={iban.iban}
                  onChange={e => updateIban(iban.id, { iban: e.target.value })}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  style={{ padding: '10px 12px', fontSize: 13, letterSpacing: '0.04em' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" id={`def_${iban.id}`} checked={iban.isDefault}
                  onChange={e => {
                    const updated = local.ibans.map(i => ({ ...i, isDefault: i.id === iban.id ? e.target.checked : false }));
                    save({ ibans: updated });
                  }} />
                <label htmlFor={`def_${iban.id}`} style={{ fontSize: 13 }}>Varsayılan</label>
                <button
                  className="btn btn-sm"
                  style={{ marginLeft: 'auto', background: 'var(--red-bg)', color: 'var(--red-500)' }}
                  onClick={() => deleteIban(iban.id)}
                >Sil</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Templates */}
      <div className="glass-block" style={{ padding: 'var(--space-md)', background: '#fff' }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 'var(--space-md)' }}>💬 WhatsApp Şablonları</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {local.whatsappTemplates.map(tpl => (
            <div key={tpl.id} style={{ padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{tpl.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{tpl.body.slice(0, 60)}...</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditTpl(tpl)}>✏️ Düzenle</button>
            </div>
          ))}
        </div>
      </div>

      {/* Template editor modal */}
      {editTpl && (
        <div className="modal-overlay animate-fade-in" onClick={() => setEditTpl(null)}>
          <div className="modal-sheet animate-fade-slide-up" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
            <div className="modal-handle" />
            <div className="modal-header">
              <span className="modal-title">{editTpl.name}</span>
              <button className="btn btn-icon btn-secondary" onClick={() => setEditTpl(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 8 }}>Değişken Ekle:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {TEMPLATE_VARS.map(v => (
                  <button
                    key={v}
                    className="btn btn-sm"
                    style={{ background: 'var(--nas-rose-light)', color: 'var(--nas-bordeaux)', fontSize: 11, padding: '4px 10px' }}
                    onClick={() => insertVar(v)}
                  >{v}</button>
                ))}
              </div>
              <textarea
                className="input-field"
                rows={12}
                value={editTpl.body}
                onChange={e => setEditTpl(t => t ? { ...t, body: e.target.value } : null)}
                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
              />
            </div>
            <div className="modal-footer">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setEditTpl(null)}>İptal</button>
                <button className="btn btn-primary" onClick={() => saveTpl(editTpl)}>Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
