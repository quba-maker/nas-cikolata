import type { OrderStatus } from '../types';

export function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export function daysUntil(iso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function today(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  onay: 'Onay Bekliyor',
  kapora: 'Kapora Bekleniyor',
  hazirlaniyor: 'Hazırlanıyor',
  hazir: 'Hazır',
  teslim: 'Teslim Edildi',
};

export const STATUS_PROGRESS: Record<OrderStatus, number> = {
  onay: 10,
  kapora: 30,
  hazirlaniyor: 60,
  hazir: 90,
  teslim: 100,
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  onay: 'var(--gray-400)',
  kapora: 'var(--orange-500)',
  hazirlaniyor: 'var(--blue-500)',
  hazir: 'var(--green-500)',
  teslim: '#8B5CF6',
};

export function getInitials(bride: string, groom: string): string {
  return `${bride.charAt(0).toUpperCase()}${groom.charAt(0).toUpperCase()}`;
}

export function prepProgress(eventDate: string): number {
  const days = daysUntil(eventDate);
  if (days >= 14) return 5;
  if (days === 2) return 90;
  if (days <= 0) return 90;
  // Interpolate 5% -> 90% over 14 days to 2 days
  const progress = 5 + ((14 - days) / 12) * 85;
  return Math.min(90, Math.max(5, Math.round(progress)));
}
