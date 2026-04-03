import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';

const FOMO_DATA = [
  { name: 'Ayşe K.', city: 'İstanbul', item: 'Kırmızı Gül Sandık Set' },
  { name: 'Mehmet Y.', city: 'Ankara', item: 'Şakayık Rüya Set' },
  { name: 'Zeynep E.', city: 'İzmir', item: 'Lüks Kadife Tepsi' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { state } = useApp();
  const s = state.settings.landing;
  
  const [fomoVisible, setFomoVisible] = useState(false);
  const [fomoCurrent, setFomoCurrent] = useState(FOMO_DATA[0]);

  // Carousel & Modal State
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const [showSticky, setShowSticky] = useState(false);
  const [activeJourneyStep, setActiveJourneyStep] = useState(0);

  const heroImg = '/slidergorsel.jpeg';

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const triggerFomo = () => {
      const nextIdx = Math.floor(Math.random() * FOMO_DATA.length);
      setFomoCurrent(FOMO_DATA[nextIdx]);
      setFomoVisible(true);
      timeoutId = setTimeout(() => setFomoVisible(false), 5000);
    };
    const interval = setInterval(triggerFomo, 25000);
    const initDelay = setTimeout(triggerFomo, 8000);
    return () => { clearInterval(interval); clearTimeout(initDelay); clearTimeout(timeoutId); };
  }, []);

  // Auto-Carousel effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide(prev => prev + 1);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, []);

  // Journey auto progression
  useEffect(() => {
    const journeyInterval = setInterval(() => {
      setActiveJourneyStep(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(journeyInterval);
  }, []);

  // Keydown for lightbox
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxImg(null); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Scroll listener for sticky CTA
  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll Reveal Logic (IntersectionObserver)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-up');
    elements.forEach(el => observer.observe(el));
    return () => elements.forEach(el => observer.unobserve(el));
  }, []);

  const sfFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#4A1525', fontFamily: sfFont, position: 'relative' }}>
      


      {/* LIGHTBOX MODAL */}
      {lightboxImg && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)',
          animation: 'fade-in 0.3s ease-out'
        }} onClick={() => setLightboxImg(null)}>
          <button style={{ position: 'absolute', top: 32, right: 32, background: 'transparent', color: '#FFF', fontSize: 40, border: 'none', cursor: 'pointer' }} onClick={() => setLightboxImg(null)}>×</button>
          {lightboxImg.match(/\.(mp4|webm)$/i) || lightboxImg.startsWith('data:video') ? (
             <video src={lightboxImg} controls autoPlay style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()} />
          ) : (
             <img src={lightboxImg} alt="Büyük Görsel" style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()} />
          )}
        </div>
      )}

      {/* APPLE STYLE NAV */}
      <div style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000 }}>
        <nav style={{ 
          margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '12px 24px', background: 'rgba(250, 250, 250, 0.75)', backdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.png" alt="Nas Çikolata" style={{ height: 28, objectFit: 'contain' }} />
          </a>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Siparis Takibi */}
            <button 
               style={{ background: 'transparent', border: 'none', fontSize: 14, fontWeight: 700, color: '#4A1525', cursor: 'pointer', opacity: 0.9 }}
               onClick={() => navigate('/takip')}
            >
               Sipariş Takibi
            </button>

            {/* Top Sticky Button */}
            <div style={{
              opacity: showSticky ? 1 : 0, transition: 'all 0.5s ease', pointerEvents: showSticky ? 'auto' : 'none', transform: showSticky ? 'translateY(0)' : 'translateY(-10px)'
            }}>
               <button 
                  className="btn-luxury-shimmer"
                  style={{ color: '#FFF', borderRadius: 999, padding: '10px 24px', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }} 
                  onClick={() => navigate('/siparis')}
                >
                  Sipariş Oluştur!
                </button>
            </div>
          </div>
        </nav>
      </div>

      {/* COMPACT & ELEGANT HERO */}
      <section style={{ 
        position: 'relative', paddingTop: 140, paddingBottom: 80,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
      }}>
        {/* Soft Background Image, Heavily Faded to keep it clean */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.15, pointerEvents: 'none' }}>
          <img src={s.heroImage || '/slidergorsel.jpeg'} alt="Hero Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #FAFAFA 0%, transparent 100%)' }} />
        </div>

        <div className="container relative z-10" style={{ maxWidth: 860 }}>
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05,
            color: '#4A1525', marginBottom: 20
          }}>
             {s.heroTitle.split('\n')[0]} 
             {s.heroTitle.split('\n').length > 1 && (
               <><br/><span style={{ background: 'linear-gradient(135deg, #4A1525 0%, #B8476F 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.heroTitle.split('\n').slice(1).join(' ')}</span></>
             )}
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 500, color: '#86868B', maxWidth: 640, margin: '0 auto 48px',
            lineHeight: 1.4, letterSpacing: '-0.01em'
          }}>
            {s.heroSubtitle}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
             <button className="btn-luxury-shimmer hover-scale" style={{
              color: '#FFFFFF', borderRadius: 999, padding: '18px 40px', fontSize: 18, fontWeight: 600, border: 'none',
              cursor: 'pointer', transition: 'all 0.3s ease'
             }} onClick={() => navigate('/siparis')}>
              Setinizi Oluşturmaya Başlayın
             </button>
             
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 14, fontWeight: 700, color: '#4A1525', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
               <span>📍</span> Konya içi mağaza teslimi bulunmaktadır.
             </div>
          </div>

          {/* Dönen Lüks Mühür (SVG Badge) */}
          <div className="absolute animate-spin-slow" style={{ bottom: -60, right: -40, width: 140, height: 140, pointerEvents: 'none', zIndex: 20 }}>
             <svg viewBox="0 0 200 200" width="140" height="140">
                <path id="textPath" d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0" fill="transparent" />
                <text fill="#B8476F" fontSize="16" fontWeight="bold" letterSpacing="4">
                <textPath href="#textPath" startOffset="0%">
                  {s.badgeText}
                </textPath>
                </text>
                <circle cx="100" cy="100" r="12" fill="#4A1525" />
             </svg>
          </div>
        </div>
      </section>

      {/* MARQUEE BANNER */}
      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', padding: '24px 0', background: '#FAFAFA', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'relative', zIndex: 2 }}>
         <div className="animate-marquee" style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '0.05em' }}>
            <span className="text-stroke-dark" style={{ marginRight: 64 }}>{s.marqueeText}</span>
            <span className="text-stroke-dark" style={{ marginRight: 64 }}>{s.marqueeText}</span>
            <span className="text-stroke-dark">{s.marqueeText}</span>
         </div>
      </div>

      {/* 3 GRID CAROUSEL - ÖRNEK MODELLER (DARK MODE V3) */}
      <section className="reveal-up" style={{ padding: '80px 16px 100px', background: '#111111', position: 'relative', zIndex: 10, color: '#FFF' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
           <h2 style={{ fontSize: 13, fontWeight: 700, color: '#C9A96E', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12, textAlign: 'center' }}>
             {s.varietyTitle}
           </h2>
           <p style={{ fontSize: 16, color: '#A1A1A6', textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
             {s.varietySubtitle}
           </p>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
             {s.featuredCollections.map((collection, colIdx) => {
                  const images = collection.images.length > 0 ? collection.images : ['https://via.placeholder.com/400'];
                  return (
                    <div key={colIdx} style={{ position: 'relative', height: 440, borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', background: '#1D1D1F', border: '1px solid rgba(255,255,255,0.05)' }}>
                       {images.map((img, idx) => (
                          <div key={idx} style={{ 
                            position: 'absolute', inset: 0, opacity: idx === (activeSlide % images.length) ? 1 : 0, 
                            transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'zoom-in' 
                          }} onClick={() => setLightboxImg(img)}>
                             <img src={img} alt={collection.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: idx === (activeSlide % images.length) ? 'scale(1.03)' : 'scale(1)', transition: 'transform 6s ease-out', opacity: 0.9 }} />
                          </div>
                       ))}
                       
                       <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '40px 24px 24px', background: 'linear-gradient(to top, rgba(17,17,17,1) 0%, rgba(17,17,17,0.6) 50%, transparent 100%)', color: '#FFF', textAlign: 'left', pointerEvents: 'none' }}>
                          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, color: '#C9A96E', letterSpacing: '-0.02em', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>{collection.title}</h3>
                          <p style={{ fontSize: 15, color: '#A1A1A6', lineHeight: 1.4 }}>{collection.desc}</p>
                       </div>
                       
                       <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 6 }}>
                         {images.map((_, i) => (
                           <div key={i} style={{ width: i === (activeSlide % images.length) ? 16 : 6, height: 6, borderRadius: 3, background: '#FFF', border: 'none', opacity: i === (activeSlide % images.length) ? 1 : 0.4, transition: 'all 0.3s', pointerEvents: 'none' }} />
                         ))}
                       </div>
                    </div>
                  );
              })}
           </div>
        </div>
      </section>

      {/* CHIC & SHOCKING 4-STEP TIMELINE REDESIGNED */}
      <section className="reveal-up" style={{ padding: '100px 16px', background: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#1D1D1F', marginBottom: 16 }}>
              Sipariş Serüveni
            </h2>
            <p style={{ fontSize: 18, color: '#86868B', maxWidth: 600, margin: '0 auto' }}>Tasarımdan teslimata, her anı kontrolünüz altında olan büyüleyici bir süreç.</p>
          </div>

          <div style={{ position: 'relative', padding: '0 20px' }}>
            {/* The Connecting Progress Line */}
            <div style={{ position: 'absolute', top: 32, left: 40, right: 40, height: 2, background: 'rgba(0,0,0,0.06)' }}>
               {/* Progress Fill */}
               <div style={{ 
                 position: 'absolute', top: 0, left: 0, height: '100%', 
                 width: `${(activeJourneyStep / 2) * 100}%`,
                 background: 'linear-gradient(90deg, #4A1525, #B8476F)',
                 transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
               }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, position: 'relative', zIndex: 1 }}>
              {[
                { title: 'Setini Oluştur', desc: 'Konseptinize uygun modeli seçin veya tamamen baştan yaratın.', icon: '1' },
                { title: 'Anlık Takip Et', desc: 'Tüm üretim sürecini adım adım izleyin, sürprizlerle karşılaşmayın.', icon: '2' },
                { title: 'Güvenle Teslim Al', desc: 'Tam zamanında, belirlediğiniz şekilde kapınızda.', icon: '3' }
              ].map((step, idx) => {
                 const isActive = activeJourneyStep === idx;
                 const isPast = activeJourneyStep > idx;
                 
                 return (
                  <div key={idx} style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isActive || isPast ? 1 : 0.4,
                    transform: isActive ? 'translateY(-12px)' : 'translateY(0)'
                  }}>
                    {/* Node / Dot */}
                    <div style={{ 
                      width: 64, height: 64, borderRadius: 32, marginBottom: 32,
                      background: isActive ? '#4A1525' : isPast ? '#B8476F' : '#F5F5F7',
                      color: isActive || isPast ? '#FFF' : '#86868B',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, fontWeight: 800,
                      boxShadow: isActive ? '0 16px 32px rgba(74,21,37,0.3)' : '0 4px 12px rgba(0,0,0,0.05)',
                      border: '4px solid #FFF', zIndex: 2, transition: 'all 0.8s ease'
                    }}>
                      {isPast ? '✓' : step.icon}
                    </div>

                    {/* Content Card */}
                    <div style={{
                      background: isActive ? '#FFFFFF' : 'transparent',
                      padding: isActive ? '32px 24px' : '16px 24px',
                      borderRadius: 24,
                      boxShadow: isActive ? '0 24px 48px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      width: '100%'
                    }}>
                      <h3 style={{ 
                        fontSize: 22, fontWeight: 800, 
                        color: isActive ? '#4A1525' : '#1D1D1F', 
                        marginBottom: 12, transition: 'color 0.8s ease'
                      }}>{step.title}</h3>
                      <p style={{ fontSize: 15, color: isActive ? '#86868B' : '#A1A1A6', lineHeight: 1.6 }}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 80 }}>
             <button className="btn-luxury-shimmer hover-scale" style={{
              color: '#FFFFFF', borderRadius: 999, padding: '18px 48px', fontSize: 18, fontWeight: 700, border: 'none',
              cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 12px 32px rgba(74,21,37,0.2)'
             }} onClick={() => navigate('/siparis')}>
              Hemen Başlayın
             </button>
             
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 16, background: 'rgba(74,21,37,0.05)', border: '1px solid rgba(74,21,37,0.1)', fontSize: 14, fontWeight: 700, color: '#4A1525' }}>
               <span>📍</span> Konya içi mağaza teslimi bulunmaktadır.
             </div>
          </div>
        </div>
      </section>

      {/* SIHIRLI ANLAR (BENTO GRID REELS SIMULATION) */}
      <section className="reveal-up" style={{ padding: '80px 16px', background: '#FFFFFF', position: 'relative' }}>
         <div style={{ maxWidth: 1000, margin: '0 auto' }}>
           <div style={{ textAlign: 'center', marginBottom: 56 }}>
             <h2 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#4A1525', marginBottom: 16 }}>
               {s.magicMomentsTitle}
             </h2>
             <p style={{ fontSize: 18, color: '#86868B', maxWidth: 600, margin: '0 auto' }}>{s.magicMomentsSubtitle}</p>
           </div>

           <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: 24,
              gridAutoRows: '280px'
           }}>
              {s.bentoVideos.map((item, idx) => (
                <div key={idx} className="hover-scale" style={{ 
                  gridColumn: item.type === 'large' ? '1 / -1' : 'auto',
                  gridRow: item.type === 'large' ? 'span 2' : 'span 1',
                  borderRadius: 32, overflow: 'hidden', position: 'relative',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.06)', cursor: 'pointer',
                  transform: 'translateZ(0)'
                }} onClick={() => setLightboxImg(item.img)}>
                  {item.img.match(/\.(mp4|webm)$/i) || item.img.startsWith('data:video') ? (
                    <video src={item.img} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                           onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} 
                           onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  ) : (
                    <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                         onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} 
                         onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  )}
                  
                  {/* Camsı Alt Şerit */}
                  <div style={{ 
                    position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                    color: '#FFF', pointerEvents: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
                  }}>
                     <div>
                       <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>{item.subtitle}</div>
                       <div style={{ fontSize: item.type === 'large' ? 28 : 20, fontWeight: 800 }}>{item.title}</div>
                     </div>
                     
                     <div style={{ 
                        width: item.type === 'large' ? 48 : 36, height: item.type === 'large' ? 48 : 36, 
                        borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)'
                     }}>
                        <svg width={item.type === 'large' ? 20 : 14} height={item.type === 'large' ? 20 : 14} viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                     </div>
                  </div>
                </div>
              ))}
           </div>
         </div>
      </section>

      {/* APPLE STYLE GOOGLE REVIEWS WITH IMAGES */}
      <section className="reveal-up" style={{ background: '#F5F5F7', paddingTop: 100, paddingBottom: 100, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
             <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', color: '#4A1525', marginBottom: 16 }}>Google Yorumlarımız.</h2>
             <p style={{ fontSize: 18, color: '#86868B' }}>Türkiye'nin her yerinden, en mutlu anlardan kareler.</p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 32, padding: 48, boxShadow: '0 16px 40px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #E5E5EA', paddingBottom: 32, marginBottom: 32 }}>
               <div>
                  <div style={{ fontWeight: 700, fontSize: 22, color: '#4A1525', marginBottom: 8 }}>Nas Çikolata | Özel Tasarım Kız İsteme & Bebek Çikolataları (Konya)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 700 }}>5.0</span>
                    <span style={{ color: '#FBBC05', fontSize: 20, letterSpacing: '2px' }}>★★★★★</span>
                    <span style={{ fontSize: 14, color: '#86868B', marginLeft: 8 }}>Google Değerlendirmeleri</span>
                  </div>
               </div>
               <div style={{ background: '#4285F4', color: '#FFF', width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 24, flexShrink: 0 }}>G</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {s.googleReviews.map((review, i) => (
                <div key={i} style={{ display: 'flex', gap: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 22, background: review.avatarBg, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18, flexShrink: 0 }}>
                    {review.letter}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                       <span style={{ fontWeight: 600, fontSize: 16, color: '#1D1D1F' }}>{review.name}</span>
                       <span style={{ color: '#86868B', fontSize: 13 }}>• {review.date}</span>
                    </div>
                    <div style={{ color: '#FBBC05', fontSize: 14, letterSpacing: '2px', marginBottom: 8 }}>★★★★★</div>
                    <p style={{ color: '#1D1D1F', fontSize: 15, lineHeight: 1.5, marginBottom: 12 }}>{review.text}</p>
                    
                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                       <div style={{ display: 'flex', gap: 8 }}>
                          {review.images.map((img, idx) => (
                             <img key={idx} src={img} alt="Müşteri Görseli" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', cursor: 'pointer' }} onClick={() => setLightboxImg(img.replace('w=200&h=200', 'w=1000&h=1000'))} />
                          ))}
                       </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* View All on Google */}
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
              <a href="https://www.google.com/maps/search/Nas+%C3%87ikolata+Konya" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-block',
                background: '#F5F5F7',
                color: '#4285F4',
                padding: '12px 32px',
                borderRadius: 999,
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: 16,
                border: '1px solid rgba(66, 133, 244, 0.2)',
                transition: 'all 0.3s ease'
              }} onMouseEnter={e => e.currentTarget.style.background = '#E5E5EA'} onMouseLeave={e => e.currentTarget.style.background = '#F5F5F7'}>
                Tüm Yorumları Google'da Gör &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ GLASS ACCORDION */}
      <section className="reveal-up" style={{ background: '#FAFAFA', padding: '100px 16px' }}>
         <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
               <h2 style={{ fontSize: 36, fontWeight: 800, color: '#4A1525', letterSpacing: '-0.02em', marginBottom: 12 }}>Aklınıza Takılanlar.</h2>
               <p style={{ fontSize: 18, color: '#86868B' }}>Sipariş sürecinizle ilgili en çok merak edilenler.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               {s.faqData.map((faq, idx) => {
                 const isOpen = openFaq === idx;
                 return (
                   <div key={idx} style={{ 
                     background: isOpen ? '#FFFFFF' : 'rgba(255,255,255,0.6)', 
                     backdropFilter: 'saturate(180%) blur(20px)',
                     borderRadius: 24, border: '1px solid rgba(0,0,0,0.04)',
                     boxShadow: isOpen ? '0 12px 32px rgba(0,0,0,0.06)' : 'none',
                     overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                   }}>
                      <button 
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        style={{ 
                          width: '100%', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                          fontSize: 18, fontWeight: 700, color: isOpen ? '#4A1525' : '#1D1D1F', transition: 'color 0.3s'
                        }}
                      >
                         {faq.q}
                         <div style={{ 
                           width: 32, height: 32, borderRadius: 16, background: isOpen ? '#4A1525' : '#F5F5F7', flexShrink: 0,
                           display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                           transform: isOpen ? 'rotate(45deg)' : 'rotate(0)'
                         }}>
                            <span style={{ color: isOpen ? '#FFF' : '#4A1525', fontSize: 20, lineHeight: 1, marginTop: -2 }}>+</span>
                         </div>
                      </button>
                      <div style={{ 
                          maxHeight: isOpen ? 500 : 0, opacity: isOpen ? 1 : 0, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                          padding: isOpen ? '0 32px 32px' : '0 32px', color: '#86868B', fontSize: 16, lineHeight: 1.6
                      }}>
                         {faq.a}
                      </div>
                   </div>
                 );
               })}
            </div>
         </div>
      </section>

      {/* COMPACT FOOTER */}
      <footer style={{ background: '#FAFAFA', padding: '60px 24px 40px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24 }}>
          <img src="/logo.png" alt="Nas Çikolata" style={{ height: 40, opacity: 0.6 }} />
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32, color: '#4A1525' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
              <span style={{ fontSize: 20 }}>📍</span> Meram, Konya
            </div>
            <a href="https://wa.me/905300000000" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: '#4A1525', textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> 
              WhatsApp Destek
            </a>
            <a href="tel:+905300000000" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: '#4A1525', textDecoration: 'none' }}>
              <span style={{ fontSize: 20 }}>📞</span> Telefon Et
            </a>
          </div>

          <div style={{ color: '#86868B', fontSize: 13, marginTop: 16 }}>
            © 2026 Nas Çikolata. Tüm hakları saklıdır. <br/>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Özel Tasarım Kız İsteme & Bebek Çikolataları</span>
          </div>
        </div>
      </footer>

      {/* FOMO TOAST (MINIMAL) */}
      <div className={`fomo-toast ${fomoVisible ? 'show' : ''}`} style={{ 
        border: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.9)', 
        boxShadow: '0 12px 32px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '16px 20px'
      }}>
        <div style={{ fontSize: 24 }}>🛍️</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1D1D1F' }}>{fomoCurrent.name} siparişini oluşturdu.</div>
          <div style={{ fontSize: 12, color: '#86868B' }}>{fomoCurrent.item}</div>
        </div>
      </div>
    </div>
  );
}
