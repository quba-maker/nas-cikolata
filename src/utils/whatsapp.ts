import { useApp } from '../store/AppContext';

export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('90')) return cleaned;
  if (cleaned.startsWith('0')) return `90${cleaned.substring(1)}`;
  return `90${cleaned}`;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = normalizePhone(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
}

export function openWhatsApp(phone: string, message: string) {
  window.open(buildWhatsAppUrl(phone, message), '_blank');
}

export function fillTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((str, [key, val]) => str.replace(new RegExp(`{${key}}`, 'g'), val), template);
}

export function useWhatsappTemplates() {
  const { state } = useApp();
  return state.settings.whatsappTemplates;
}
