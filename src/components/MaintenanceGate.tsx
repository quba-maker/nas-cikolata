import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [bypassed, setBypassed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // If the URL contains ?dev=nas, bypass the maintenance screen and save to localStorage
    const params = new URLSearchParams(location.search);
    if (params.get('dev') === 'nas') {
      localStorage.setItem('nas_dev_bypass', 'true');
      setBypassed(true);
      // Optional: remove query param to clean the URL
      window.history.replaceState({}, '', location.pathname);
    } else {
      // Check if bypass was already saved
      if (localStorage.getItem('nas_dev_bypass') === 'true') {
        setBypassed(true);
      }
    }
  }, [location]);

  if (bypassed) {
    return <>{children}</>;
  }

  // Maintenance Screen
  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--nas-cream)',
      padding: 'var(--space-xl)',
      textAlign: 'center'
    }}>
      <div className="glass-block" style={{ padding: 'var(--space-2xl)', maxWidth: 480, width: '100%', background: '#fff' }}>
        <img src="/logo.png" alt="Nas Çikolata" style={{ width: '80%', maxWidth: 240, height: 'auto', marginBottom: 'var(--space-xl)' }} />
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--nas-bordeaux)', marginBottom: 'var(--space-md)' }}>
          Çok Yakında!
        </h1>
        <p style={{ fontSize: 16, color: 'var(--gray-600)', lineHeight: 1.6 }}>
          Kız isteme setlerinde yeni nesil sipariş yönetimi sistemi çok yakında. Sizlere premium bir arayüz ve sistem sunmak için son güncellemeleri yapıyoruz.
        </p>
      </div>
    </div>
  );
}
