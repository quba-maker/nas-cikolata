import { useApp } from '../store/AppContext';

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
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
