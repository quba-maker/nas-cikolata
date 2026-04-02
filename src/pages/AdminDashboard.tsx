import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminBottomNav from '../components/AdminBottomNav';
import AdminHome from './admin/AdminHome';
import AdminOrders from './admin/AdminOrders';
import AdminManagement from './admin/AdminManagement';

// Simple PIN gate
const ADMIN_PIN = '1234';

function PinGate({ onAuth }: { onAuth: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const check = () => {
    if (pin === ADMIN_PIN) { onAuth(); }
    else { setError('Yanlış PIN'); setPin(''); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--nas-bordeaux-3), var(--nas-bordeaux))',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-xl)',
    }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>🔐</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>Admin Paneli</h1>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 40 }}>PIN kodunuzu girin</p>
      <div className="card" style={{ width: '100%', maxWidth: 360, padding: 'var(--space-xl)' }}>
        <div className="input-group">
          <label className="input-label">Admin PIN</label>
          <input
            type="password"
            className="input-field"
            placeholder="••••"
            value={pin}
            onChange={e => { setPin(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && check()}
            maxLength={8}
            style={{ textAlign: 'center', fontSize: 24, letterSpacing: '0.3em' }}
          />
        </div>
        {error && <div className="form-error" style={{ marginBottom: 10 }}>⚠️ {error}</div>}
        <button className="btn btn-primary w-full btn-lg" onClick={check} disabled={!pin}>
          Giriş Yap →
        </button>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--gray-400)' }}>
          Varsayılan PIN: 1234
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('nas_admin') === '1');

  if (!authed) {
    return <PinGate onAuth={() => { sessionStorage.setItem('nas_admin', '1'); setAuthed(true); }} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nas-cream)', paddingBottom: 'var(--bottom-nav-h)' }}>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/siparisler/*" element={<AdminOrders />} />
        <Route path="/yonetim/*" element={<AdminManagement />} />
      </Routes>
      <AdminBottomNav />
    </div>
  );
}
