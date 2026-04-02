import { formatCurrency } from '../data/seedData';

interface PriceBarProps {
  basePrice: number;
  extras?: { label: string; amount: number }[];
  total: number;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

export default function PriceBar({
  basePrice, extras = [], total,
  onBack, onNext, nextLabel = 'Devam Et', backLabel = 'Geri',
  nextDisabled = false, loading = false,
}: PriceBarProps) {
  return (
    <div className="price-bar">
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div className="price-bar__info">
          <span className="price-bar__label">Toplam Tutar</span>
          <span className="price-bar__amount">{formatCurrency(total)}</span>
          {extras.length > 0 && (
            <span className="price-bar__detail">
              Set: {formatCurrency(basePrice)}
              {extras.map((e, i) => ` + ${e.label}: ${formatCurrency(e.amount)}`).join('')}
            </span>
          )}
        </div>
        <div className="price-bar__actions">
          {onBack && (
            <button className="btn btn-secondary btn-sm" onClick={onBack}>
              ← {backLabel}
            </button>
          )}
          {onNext && (
            <button
              className="btn btn-primary"
              onClick={onNext}
              disabled={nextDisabled || loading}
              style={{ minWidth: 120 }}
            >
              {loading ? '...' : `${nextLabel} →`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
