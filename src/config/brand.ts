import heroShowroomImg from '../assets/images/hero_automotive_showroom_1794632026561.jpg';
import consultingLoungeImg from '../assets/images/consulting_private_lounge_1794632027457.jpg';

export const BRAND_CONFIG = {
  companyName: 'AS AUTO DREAMS',
  companySubtitle: 'CONSULTORIA + INTERMEDIAÇÃO',
  fullTitle: 'AS Auto Dreams Consultoria + Intermediação',
  ceoName: 'Anderson Santana',
  ceoRole: 'CEO e Proprietário',
  logoPath: '/images/logo-as-auto-dreams.png',
  heroImagePath: heroShowroomImg,
  loungeImagePath: consultingLoungeImg,
  whatsappNumber: '559286278729',
  whatsappDisplay: '(92) 98627-8729',
  whatsappBaseUrl: 'https://wa.me/559286278729',
  instagramHandle: '@as.autodreams',
  instagramUrl: 'https://www.instagram.com/as.autodreams',
  facebookName: 'AS Auto Dreams',
  facebookUrl: 'https://www.facebook.com/share/1DkRTjXg5s/',
} as const;

export function buildWhatsAppUrl(message?: string): string {
  if (!message) {
    return BRAND_CONFIG.whatsappBaseUrl;
  }
  return `${BRAND_CONFIG.whatsappBaseUrl}?text=${encodeURIComponent(message)}`;
}

export function buildVehicleWhatsAppMessage(vehicleLabel: string): string {
  return `Olá! Tenho interesse no veículo ${vehicleLabel} anunciado na AS Auto Dreams. Poderia me passar mais informações?`;
}
