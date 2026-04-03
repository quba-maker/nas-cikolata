import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { compressImage } from '../../utils/helpers';
import type { LandingSettings } from '../../types';

export default function AdminLandingSettings() {
  const { state, updateSettings } = useApp();
  const s = state.settings.landing;
  const [saved, setSaved] = useState(false);
  
  // Initialize with fallbacks in case of old state
  const [local, setLocal] = useState<LandingSettings>({
    marqueeText: s.marqueeText || '',
    badgeText: s.badgeText || '',
    heroTitle: s.heroTitle || 'En Özel Gününüzde,\nEn Özel Ürünler.',
    heroSubtitle: s.heroSubtitle || 'Kız İsteme, Söz, Nişan programlarınız için en doğru yerdesiniz.',
    heroImage: s.heroImage || '',
    varietyTitle: s.varietyTitle || 'Zengin Ürün Çeşitliliği',
    varietySubtitle: s.varietySubtitle || 'Hayalinizdeki konsepti yansıtan muazzam seçenekler.',
    featuredCollections: s.featuredCollections || [],
    magicMomentsTitle: s.magicMomentsTitle || 'Sihirli Anlar.',
    magicMomentsSubtitle: s.magicMomentsSubtitle || 'Tasarımdan teslimata, her detayda aşk var.',
    bentoVideos: s.bentoVideos || [],
    faqData: s.faqData || [],
    googleReviews: s.googleReviews || []
  });

  const save = (updates: Partial<LandingSettings>) => {
    const merged = { ...local, ...updates };
    setLocal(merged);
    updateSettings({ landing: merged });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, key: keyof LandingSettings) => {
    setLocal(p => ({ ...p, [key]: e.target.value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const compressedUrl = await compressImage(file);
    callback(compressedUrl);
    e.target.value = ''; // reset input
  };

  return (
    <div style={{ padding: 'var(--space-md)', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {saved && (
        <div className="toast success animate-fade-slide-up" style={{ position: 'fixed', bottom: 'var(--space-xl)', right: 'var(--space-xl)', zIndex: 9999 }}>
          ✅ Değişiklikler Canlıya Alındı!
        </div>
      )}

      {/* HEADER & GLOBAL TEXTS */}
      <div className="glass-block" style={{ padding: 'var(--space-lg)', background: '#fff' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--nas-bordeaux)', marginBottom: 'var(--space-xl)' }}>
          Ana Sayfa & Global Metinler
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Kayan Yazı (Marquee Header)</label>
            <input className="input-field" value={local.marqueeText} onChange={e => handleChange(e, 'marqueeText')} onBlur={() => save({ marqueeText: local.marqueeText })} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Dönen Mühür Yazısı (Badge)</label>
            <input className="input-field" value={local.badgeText} onChange={e => handleChange(e, 'badgeText')} onBlur={() => save({ badgeText: local.badgeText })} />
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '16px 0' }} />
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Ana Vitrin Başlığı (Hero Title)</label>
            <textarea className="input-field" value={local.heroTitle} onChange={e => handleChange(e, 'heroTitle')} onBlur={() => save({ heroTitle: local.heroTitle })} rows={2} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Ana Vitrin Alt Metni (Hero Subtitle)</label>
            <input className="input-field" value={local.heroSubtitle} onChange={e => handleChange(e, 'heroSubtitle')} onBlur={() => save({ heroSubtitle: local.heroSubtitle })} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Ana Vitrin Arka Plan Görseli</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
               <label className="btn btn-sm" style={{ background: 'var(--gray-100)', color: 'var(--gray-900)', cursor: 'pointer' }}>
                  Dosya Yükle
                  <input type="file" accept="image/*" onChange={e => handleFileUpload(e, url => {
                    setLocal(p => ({ ...p, heroImage: url }));
                    save({ heroImage: url });
                  })} style={{ display: 'none' }} />
               </label>
               <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>veya link:</span>
               <input className="input-field" style={{ flex: 1, marginBottom: 0 }} value={local.heroImage} onChange={e => handleChange(e, 'heroImage')} onBlur={() => save({ heroImage: local.heroImage })} placeholder="https://..." />
            </div>
            {local.heroImage && <img src={local.heroImage} alt="Hero Preview" style={{ height: 100, objectFit: 'cover', borderRadius: 8, marginTop: 12 }} />}
          </div>
        </div>
      </div>

      {/* ZENGİN ÜRÜN ÇEŞİTLİLİĞİ */}
      <div className="glass-block" style={{ padding: 'var(--space-lg)', background: '#fff' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--nas-bordeaux)', marginBottom: 'var(--space-xl)' }}>
          Ürün Çeşitliliği & Koleksiyon Kartları
        </div>
        <div className="input-group">
          <label className="input-label">Bölüm Başlığı</label>
          <input className="input-field" value={local.varietyTitle} onChange={e => handleChange(e, 'varietyTitle')} onBlur={() => save({ varietyTitle: local.varietyTitle })} />
        </div>
        <div className="input-group">
          <label className="input-label">Bölüm Alt Metni</label>
          <input className="input-field" value={local.varietySubtitle} onChange={e => handleChange(e, 'varietySubtitle')} onBlur={() => save({ varietySubtitle: local.varietySubtitle })} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Koleksiyon Kartları (Galeri Slider İçeren Kartlar)</div>
          <button className="btn btn-primary btn-sm" onClick={() => {
            const nc = [...local.featuredCollections, { id: 'fc' + Date.now(), title: 'Yeni Koleksiyon', desc: 'Açıklama', images: [] }];
            setLocal(p => ({ ...p, featuredCollections: nc }));
            save({ featuredCollections: nc });
          }}>+ Kart Ekle</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {local.featuredCollections.map((col, index) => (
            <div key={col.id} style={{ background: '#F8F9FA', border: '1px solid var(--gray-100)', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span className="badge badge-rose">Kart #{index + 1}</span>
                <button className="btn btn-sm" style={{ background: '#FEF2F2', color: '#DC2626' }} onClick={() => {
                  const updated = local.featuredCollections.filter(c => c.id !== col.id);
                  setLocal(p => ({ ...p, featuredCollections: updated }));
                  save({ featuredCollections: updated });
                }}>Kaldır</button>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">Kart Başlığı</label>
                  <input className="input-field" value={col.title} onChange={e => {
                    const up = [...local.featuredCollections]; up[index].title = e.target.value; setLocal({ ...local, featuredCollections: up });
                  }} onBlur={() => save({ featuredCollections: local.featuredCollections })} />
                </div>
                <div style={{ flex: 2 }}>
                  <label className="input-label">Kısa Açıklama</label>
                  <input className="input-field" value={col.desc} onChange={e => {
                    const up = [...local.featuredCollections]; up[index].desc = e.target.value; setLocal({ ...local, featuredCollections: up });
                  }} onBlur={() => save({ featuredCollections: local.featuredCollections })} />
                </div>
              </div>
              <div>
                <label className="input-label">Görseller (Toplu yüklenebilir veya virgülle link eklenebilir)</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                   <label className="btn btn-sm" style={{ background: 'var(--gray-100)', color: 'var(--gray-900)', cursor: 'pointer' }}>
                      Cihazdan Seç
                      <input type="file" accept="image/*" multiple onChange={async e => {
                        const files = e.target.files;
                        if (!files) return;
                        
                        const newUrls = await Promise.all(
                          Array.from(files).map(file => compressImage(file))
                        );
                        
                        const up = [...local.featuredCollections];
                        up[index].images.push(...newUrls);
                        setLocal({ ...local, featuredCollections: up });
                        save({ featuredCollections: up });
                        e.target.value = '';
                      }} style={{ display: 'none' }} />
                   </label>
                </div>
                <textarea className="input-field" rows={2} value={col.images.join(', ')} onChange={e => {
                  const up = [...local.featuredCollections]; 
                  up[index].images = e.target.value.split(',').map(s => s.trim()).filter(Boolean); 
                  setLocal({ ...local, featuredCollections: up });
                }} onBlur={() => save({ featuredCollections: local.featuredCollections })} placeholder="https://image1.jpg, https://image2.jpg" />
                <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 8 }}>
                  {col.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img} alt="" style={{ height: 60, width: 60, objectFit: 'cover', borderRadius: 8 }} />
                      <button style={{ position: 'absolute', top: -4, right: -4, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: 10, cursor: 'pointer' }} onClick={() => {
                        const up = [...local.featuredCollections];
                        up[index].images = up[index].images.filter((_, imgIdx) => imgIdx !== i);
                        setLocal({ ...local, featuredCollections: up });
                        save({ featuredCollections: up });
                      }}>x</button>
                    </div> 
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SİHİRLİ ANLAR (BENTO) */}
      <div className="glass-block" style={{ padding: 'var(--space-lg)', background: '#fff' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--nas-bordeaux)', marginBottom: 'var(--space-xl)' }}>
          Sihirli Anlar (Bento Grid)
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <label className="input-label">Bölüm Başlığı</label>
            <input className="input-field" value={local.magicMomentsTitle} onChange={e => handleChange(e, 'magicMomentsTitle')} onBlur={() => save({ magicMomentsTitle: local.magicMomentsTitle })} />
          </div>
          <div style={{ flex: 2 }}>
            <label className="input-label">Bölüm Alt Metni</label>
            <input className="input-field" value={local.magicMomentsSubtitle} onChange={e => handleChange(e, 'magicMomentsSubtitle')} onBlur={() => save({ magicMomentsSubtitle: local.magicMomentsSubtitle })} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Medya Blokları (Grid Hücreleri)</div>
          <button className="btn btn-primary btn-sm" onClick={() => {
            const up = [...local.bentoVideos, { title: 'Yeni Konsept', subtitle: 'Açıklama', type: 'small' as const, img: '' }];
            setLocal(p => ({ ...p, bentoVideos: up }));
            save({ bentoVideos: up });
          }}>+ Blok Ekle</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {local.bentoVideos.map((b, index) => (
            <div key={index} style={{ background: '#F8F9FA', padding: 16, borderRadius: 16, border: '1px solid var(--gray-100)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                 <select className="input-field" style={{ width: 'auto', padding: '4px 8px', height: 32 }} value={b.type} onChange={e => {
                   const up = [...local.bentoVideos]; up[index].type = e.target.value as 'large'|'small'; setLocal({...local, bentoVideos: up});
                 }} onBlur={() => save({ bentoVideos: local.bentoVideos })}>
                   <option value="large">Geniş Kart (Large)</option>
                   <option value="small">Kare Kart (Small)</option>
                 </select>
                 <button className="btn btn-sm" style={{ padding: '4px 8px', height: 32, background: '#FEF2F2', color: '#DC2626' }} onClick={() => {
                   const up = local.bentoVideos.filter((_, i) => i !== index);
                   setLocal(p => ({ ...p, bentoVideos: up }));
                   save({ bentoVideos: up });
                 }}>Sil</button>
               </div>
               <input className="input-field" style={{ marginBottom: 8 }} placeholder="Başlık" value={b.title} onChange={e => { const up=[...local.bentoVideos]; up[index].title=e.target.value; setLocal({...local, bentoVideos: up}); }} onBlur={() => save({ bentoVideos: local.bentoVideos })} />
               <input className="input-field" style={{ marginBottom: 8 }} placeholder="Alt Başlık" value={b.subtitle} onChange={e => { const up=[...local.bentoVideos]; up[index].subtitle=e.target.value; setLocal({...local, bentoVideos: up}); }} onBlur={() => save({ bentoVideos: local.bentoVideos })} />
               <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                 <label className="btn btn-sm" style={{ background: 'var(--gray-100)', color: 'var(--gray-900)', cursor: 'pointer', flexShrink: 0 }}>
                    Media Yükle
                    <input type="file" accept="image/*,video/*" onChange={e => handleFileUpload(e, url => {
                      const up=[...local.bentoVideos]; up[index].img=url; setLocal({...local, bentoVideos: up}); save({ bentoVideos: up });
                    })} style={{ display: 'none' }} />
                 </label>
                 <input className="input-field" style={{ marginBottom: 0 }} placeholder="veya URL" value={b.img} onChange={e => { const up=[...local.bentoVideos]; up[index].img=e.target.value; setLocal({...local, bentoVideos: up}); }} onBlur={() => save({ bentoVideos: local.bentoVideos })} />
               </div>
               {b.img && (
                 <div style={{ marginTop: 12, height: 100, borderRadius: 8, overflow: 'hidden' }}>
                    {b.img.match(/\.(mp4|webm)$/i) || b.img.startsWith('data:video') ? (
                       <video src={b.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                    ) : (
                       <img src={b.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    )}
                 </div>
               )}
            </div>
          ))}
        </div>
      </div>

      {/* GOOGLE REVIEWS */}
      <div className="glass-block" style={{ padding: 'var(--space-lg)', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--nas-bordeaux)' }}>Google Yorumlarımız</div>
          <button className="btn btn-primary btn-sm" onClick={() => {
            const up = [...local.googleReviews, { name: 'Müşteri Adı', date: 'Yeni', text: 'Harika bir alışverişti.', letter: 'M', avatarBg: '#4ADE80' }];
            setLocal(p => ({ ...p, googleReviews: up }));
            save({ googleReviews: up });
          }}>+ Yorum Ekle</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {local.googleReviews.map((rev, index) => (
            <div key={index} style={{ display: 'flex', gap: 16, background: '#F8F9FA', padding: 20, borderRadius: 16, border: '1px solid var(--gray-100)' }}>
              <div style={{ width: 60, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <input type="color" value={rev.avatarBg} onChange={e => { const up=[...local.googleReviews]; up[index].avatarBg=e.target.value; setLocal({...local, googleReviews: up}); }} onBlur={() => save({ googleReviews: local.googleReviews })} style={{ width: 40, height: 40, padding: 0, border: 'none', borderRadius: 20, cursor: 'pointer' }} title="Avatar Rengi" />
                <input className="input-field" style={{ width: '100%', textAlign: 'center', padding: 4 }} placeholder="Harf" maxLength={1} value={rev.letter} onChange={e => { const up=[...local.googleReviews]; up[index].letter=e.target.value.toUpperCase(); setLocal({...local, googleReviews: up}); }} onBlur={() => save({ googleReviews: local.googleReviews })} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                   <div style={{ flex: 1 }}><input className="input-field" placeholder="İsim Soyisim" value={rev.name} onChange={e => { const up=[...local.googleReviews]; up[index].name=e.target.value; setLocal({...local, googleReviews: up}); }} onBlur={() => save({ googleReviews: local.googleReviews })} /></div>
                   <div style={{ flex: 1 }}><input className="input-field" placeholder="Tarih / Zaman (Örn: 2 gün önce)" value={rev.date} onChange={e => { const up=[...local.googleReviews]; up[index].date=e.target.value; setLocal({...local, googleReviews: up}); }} onBlur={() => save({ googleReviews: local.googleReviews })} /></div>
                </div>
                <div><textarea className="input-field" rows={2} placeholder="Müşteri Yorumu..." value={rev.text} onChange={e => { const up=[...local.googleReviews]; up[index].text=e.target.value; setLocal({...local, googleReviews: up}); }} onBlur={() => save({ googleReviews: local.googleReviews })} /></div>
                
                <div style={{ marginTop: 8 }}>
                  <label className="input-label" style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 8 }}>Müşteri Görselleri Ekle (İsteğe Bağlı)</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                     <label className="btn btn-sm" style={{ background: 'var(--gray-100)', color: 'var(--gray-900)', cursor: 'pointer' }}>
                        Cihazdan Görsel Yükle
                        <input type="file" accept="image/*" multiple onChange={async e => {
                          const files = e.target.files;
                          if (!files) return;
                          
                          const newUrls = await Promise.all(
                            Array.from(files).map(file => compressImage(file))
                          );
                          
                          const up = [...local.googleReviews];
                          if (!up[index].images) up[index].images = [];
                          up[index].images!.push(...newUrls);
                          setLocal({ ...local, googleReviews: up });
                          save({ googleReviews: up });
                          e.target.value = '';
                        }} style={{ display: 'none' }} />
                     </label>
                  </div>
                  {rev.images && rev.images.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto', paddingBottom: 8 }}>
                      {rev.images.map((img, i) => (
                        <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                          <img src={img} alt="" style={{ height: 48, width: 48, objectFit: 'cover', borderRadius: 8 }} />
                          <button style={{ position: 'absolute', top: -6, right: -6, background: '#DC2626', color: 'white', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => {
                            const up = [...local.googleReviews];
                            up[index].images = up[index].images!.filter((_, imgIdx) => imgIdx !== i);
                            setLocal({ ...local, googleReviews: up });
                            save({ googleReviews: up });
                          }}>x</button>
                        </div> 
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <button className="btn btn-sm" style={{ background: '#FEF2F2', color: '#DC2626' }} onClick={() => {
                   const up = local.googleReviews.filter((_, i) => i !== index);
                   setLocal(p => ({ ...p, googleReviews: up }));
                   save({ googleReviews: up });
                }}>Sil</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SSS */}
      <div className="glass-block" style={{ padding: 'var(--space-lg)', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--nas-bordeaux)' }}>S.S.S (Sıkça Sorulan Sorular)</div>
          <button className="btn btn-primary btn-sm" onClick={() => {
            const up = [...local.faqData, { q: 'Yeni Soru', a: 'Cevap' }];
            setLocal(p => ({ ...p, faqData: up }));
            save({ faqData: up });
          }}>+ Soru Ekle</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {local.faqData.map((faq, index) => (
            <div key={index} style={{ padding: 16, background: '#F8F9FA', borderRadius: 16, border: '1px solid var(--gray-100)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="input-field" placeholder="Soru" value={faq.q} onChange={e => { const up=[...local.faqData]; up[index].q=e.target.value; setLocal({...local, faqData: up}); }} onBlur={() => save({ faqData: local.faqData })} />
              <textarea className="input-field" rows={2} placeholder="Cevap" value={faq.a} onChange={e => { const up=[...local.faqData]; up[index].a=e.target.value; setLocal({...local, faqData: up}); }} onBlur={() => save({ faqData: local.faqData })} style={{ resize: 'vertical' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-sm" style={{ background: '#FEF2F2', color: '#DC2626' }} onClick={() => {
                  const up = local.faqData.filter((_, i) => i !== index);
                  setLocal(p => ({ ...p, faqData: up }));
                  save({ faqData: up });
                }}>Sil</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
