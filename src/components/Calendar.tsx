import { useState, useEffect, useCallback } from 'react';
import '../styles/calendar.css';
import { toISODate, today, addDays } from '../utils/helpers';

interface CalendarProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  allowedHighlight?: 'availability' | 'delivery';
  eventDate?: string; // for delivery calendar: allows only eventDate and eventDate-1
  onClose?: () => void;
}

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

type DayState = 'past' | 'urgent' | 'hurry' | 'free' | 'unavailable' | 'allowed';

function getDayState(isoDate: string, mode: 'availability' | 'delivery', eventDate?: string): DayState {
  const todayStr = today();
  if (isoDate < todayStr) return 'past';

  if (mode === 'delivery' && eventDate) {
    const dayBefore = addDays(eventDate, -1);
    if (isoDate === eventDate || isoDate === dayBefore) return 'allowed';
    return 'unavailable';
  }

  // availability mode
  const diff = Math.ceil((new Date(isoDate).getTime() - new Date(todayStr).getTime()) / 86400000);
  if (diff <= 2) return 'urgent';
  if (diff <= 6) return 'hurry';
  return 'free';
}

export default function Calendar({ value, onChange, minDate, maxDate, allowedHighlight = 'availability', eventDate, onClose }: CalendarProps) {
  const initDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  const [legendText, setLegendText] = useState('');

  const getDays = useCallback(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const last = new Date(viewYear, viewMonth + 1, 0);

    // Monday-based grid
    let startDow = first.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const cells: (string | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= last.getDate(); d++) {
      cells.push(toISODate(new Date(viewYear, viewMonth, d)));
    }
    // Fill to complete week
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDay = (iso: string) => {
    const state = getDayState(iso, allowedHighlight, eventDate);
    if (state === 'past' || state === 'unavailable') return;

    onChange(iso);

    if (state === 'urgent') {
      setLegendText('⚠️ Acil sipariş talebi — lütfen bizimle iletişime geçin!');
    } else {
      setLegendText('');
    }
    onClose?.();
  };

  const days = getDays();

  return (
    <div className="calendar-wrap animate-scale-in" onClick={e => e.stopPropagation()}>
      <div className="calendar-header">
        <button className="calendar-nav" onClick={prevMonth}>‹</button>
        <span className="calendar-title">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="calendar-nav" onClick={nextMonth}>›</button>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map(d => (
          <div key={d} className="calendar-day-label">{d}</div>
        ))}
        {days.map((iso, i) => {
          if (!iso) return <div key={i} />;
          const state = getDayState(iso, allowedHighlight, eventDate);
          const isSelected = iso === value;
          const disabled = state === 'past' || state === 'unavailable';
          const classNames = [
            'calendar-day',
            state !== 'past' && state !== 'unavailable' ? state : '',
            isSelected ? 'selected' : '',
            disabled ? 'past' : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={iso}
              className={classNames}
              disabled={disabled}
              onClick={() => handleDay(iso)}
            >
              {new Date(iso + 'T00:00:00').getDate()}
            </button>
          );
        })}
      </div>

      {allowedHighlight === 'availability' && (
        <div className="calendar-legend">
          <div className="calendar-legend-item">
            <div className="calendar-legend-dot" style={{ background: 'var(--red-500)' }} />
            <span>Acil</span>
          </div>
          <div className="calendar-legend-item">
            <div className="calendar-legend-dot" style={{ background: 'var(--orange-500)' }} />
            <span>Acele Edin!</span>
          </div>
          <div className="calendar-legend-item">
            <div className="calendar-legend-dot" style={{ background: 'var(--green-500)' }} />
            <span>Müsait</span>
          </div>
        </div>
      )}

      {allowedHighlight === 'delivery' && (
        <div className="calendar-legend">
          <div className="calendar-legend-item">
            <div className="calendar-legend-dot" style={{ background: 'var(--nas-bordeaux)' }} />
            <span>Seçilebilir (Teslim günü veya 1 gün önce)</span>
          </div>
        </div>
      )}

      {legendText && (
        <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--red-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--red-500)', fontWeight: 500 }}>
          {legendText}
        </div>
      )}
    </div>
  );
}
