import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import AdminProducts from './AdminProducts';
import AdminAccounting from './AdminAccounting';
import AdminSettings from './AdminSettings';
import AdminLandingSettings from './AdminLandingSettings';

export default function AdminManagement() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    { label: '🛍️ Ürünler', path: '/admin/yonetim/urunler' },
    { label: '💰 Muhasebe', path: '/admin/yonetim/muhasebe' },
    { label: '⚙️ Ayarlar', path: '/admin/yonetim/ayarlar' },
    { label: '🖥️ Açılış Sayfası', path: '/admin/yonetim/karsilama' },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div style={{ padding: 'var(--space-md)', paddingBottom: 0 }}>
        <div className="tab-bar">
          {tabs.map(t => (
            <button
              key={t.path}
              className={`tab-btn ${pathname.startsWith(t.path) ? 'active' : ''}`}
              onClick={() => navigate(t.path)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Routes>
        <Route path="/" element={<AdminProducts />} />
        <Route path="/urunler" element={<AdminProducts />} />
        <Route path="/muhasebe" element={<AdminAccounting />} />
        <Route path="/ayarlar" element={<AdminSettings />} />
        <Route path="/karsilama" element={<AdminLandingSettings />} />
      </Routes>
    </div>
  );
}
