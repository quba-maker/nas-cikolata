// ============================================================
// NAS ÇİKOLATA — Data Types
// ============================================================

export type OrderStatus = 'onay' | 'kapora' | 'hazirlaniyor' | 'hazir' | 'teslim';
export type ProductType = 'set' | 'buket' | 'sandik' | 'etiket' | 'anne-gulu' | 'kahve-yani';
export type BadgeType = 'indirim' | 'cok-satilan' | 'cok-tercih-edilen' | null;
export type BouquetKind = 'buket' | 'kutu';
export type PartnerId = 'ortak1' | 'ortak2';

export interface Product {
  id: string;
  type: ProductType;
  categoryId: string;
  subCategoryId?: string;
  name: string;
  description: string;
  setContents?: {
    buketIcerigi?: string[];
    sandikIcerigi?: string[];
    anneGulu?: string[];
    kahveYani?: string[];
  };
  includedRoseCount?: number;
  includedChocolateCount?: number;
  tags?: string[];
  price: number;
  oldPrice?: number;
  cost: number;
  imageUrl: string;
  gallery: string[];
  badge: BadgeType;
  sortOrder: number;
  isActive: boolean;
  // For etiket
  hasCustomImage?: boolean;
  customImageLabel?: string;
  // For sandik / buket
  freeSlots?: number;  // kaç adede kadar ücretsiz
  bouquetKind?: BouquetKind;
  subType?: string; // şakayık, gül, yapay-gül vb.
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  coverText?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  productType: ProductType;
  sortOrder: number;
  isActive: boolean;
}

export interface OrderExtra {
  label: string;
  qty: number;
  unitPrice: number;
  unitCost: number;
  total: number;
  totalCost: number;
  isFree: boolean;
}

export interface Order {
  id: string;                    // 5-char unique code
  status: OrderStatus;
  createdAt: string;             // ISO date
  lastUpdated: string;

  // Customer info
  bride: string;
  groom: string;
  phone: string;                 // without leading 90
  eventDate: string;             // ISO date
  deliveryDate: string;          // ISO date

  // Order type
  orderType: 'set' | 'custom';
  categoryId: string;
  categoryName: string;

  // Selected products
  selectedSet?: Product;
  selectedBouquet?: Product;
  selectedBox?: Product;
  selectedLabel?: Product;
  customLabelImage?: string;

  // Quantities & extras
  chocolateCount: number;        // extras on top of set default
  roseCount: number;             // anne gülü
  extras: OrderExtra[];

  // Pricing
  basePrice: number;
  totalPrice: number;
  totalCost: number;
  deposit?: number;              // 30% of totalPrice
  depositPaid: boolean;
  depositIban?: string;

  // Process tracking
  pleksiOrdered: boolean;
  pleksiOrderedAt?: string;
  productionPhotos: string[];    // base64 or url
  programPhotos: string[];

  // Admin notes
  notes: string;

  // Kapora tracking
  customerNotifiedDeposit: boolean;
  customerSentDeposit: boolean;

  // Google review
  googleReviewSent: boolean;
}

export interface PaymentRecord {
  id: string;
  orderId?: string;
  partnerId: PartnerId;
  amount: number;
  type: 'kapora' | 'kalan' | 'kar-payi' | 'maliyet' | 'diger';
  description: string;
  date: string;
  isAuto: boolean;
}

export interface IbanInfo {
  id: string;
  partnerId: PartnerId;
  bankName: string;
  holderName: string;
  iban: string;
  isDefault: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  body: string;
}

export interface LandingSettings {
  marqueeText: string;
  badgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  varietyTitle: string;
  varietySubtitle: string;
  featuredCollections: Array<{ // For Zengin Urun Cesitliligi cards
    id: string;
    title: string;
    desc: string;
    images: string[];
  }>;
  magicMomentsTitle: string;
  magicMomentsSubtitle: string;
  bentoVideos: Array<{
    title: string;
    subtitle: string;
    type: 'large' | 'small';
    img: string;
  }>;
  faqData: Array<{
    q: string;
    a: string;
  }>;
  googleReviews: Array<{
    name: string;
    date: string;
    text: string;
    letter: string;
    avatarBg: string;
    images?: string[];
  }>;
}

export interface AppSettings {
  firmName: string;
  firmWhatsapp: string;
  pleksiWhatsapp: string;
  googleReviewUrl: string;
  depositRate: number;
  rosePriceDefault: number;
  roseFreeSlotsDefault: number;
  customOrderBouquetImg: string;
  customOrderBoxImg: string;
  customOrderSakayikImg: string;
  customOrderGulImg: string;
  orderTrackingBaseUrl: string;

  ibans: IbanInfo[];
  whatsappTemplates: WhatsAppTemplate[];

  // Landing page content
  landingHeroTitle: string;
  landingHeroSubtitle: string;
  landingHeroImages: string[];
  
  productTags: string[];
  productBadges?: string[];
  
  // NEW: Advanced CMS Landing Settings
  landing: LandingSettings;

  // Partners
  partner1Name: string;
  partner1Share: number;           // 0.5
  partner2Name: string;
  partner2Share: number;           // 0.5
}

export interface AppState {
  orders: Order[];
  products: Product[];
  categories: Category[];
  subCategories: SubCategory[];
  payments: PaymentRecord[];
  settings: AppSettings;
}
