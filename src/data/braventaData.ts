export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface ProductAttribute {
  label: string;
  value: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export type EnquiryTypeOption =
  | 'Product Information'
  | 'Distribution Enquiry'
  | 'Import / Wholesale Enquiry'
  | 'Business Partnership'
  | 'General Enquiry';

export const ENQUIRY_TYPE_OPTIONS: readonly EnquiryTypeOption[] = [
  'Product Information',
  'Distribution Enquiry',
  'Import / Wholesale Enquiry',
  'Business Partnership',
  'General Enquiry',
] as const;

export const HEADER_NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'product', label: 'Product', href: '#product' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'manufacturer', label: 'Manufacturer', href: '#manufacturer' },
  { id: 'contact', label: 'Contact', href: '#contact' },
] as const;

export const FOOTER_NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'product', label: 'Product', href: '#product' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'manufacturer', label: 'Manufacturer', href: '#manufacturer' },
  { id: 'contact', label: 'Contact', href: '#contact' },
] as const;

export const PRODUCT_ATTRIBUTES: readonly ProductAttribute[] = [
  { label: 'Brand', value: 'BRAVENTA' },
  { label: 'Active Ingredient', value: 'Fluralaner' },
  { label: 'Form', value: 'Tablets' },
  { label: 'Category', value: 'Veterinary Use' },
  { label: 'Manufacturer', value: 'VELTRION Animal Health' },
  { label: 'Country of Manufacture', value: 'Thailand' },
] as const;

export const AEO_FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'What is Braventa?',
    answer:
      'BRAVENTA is a veterinary pharmaceutical product brand offering Fluralaner Tablets for veterinary use, presented for international veterinary healthcare and distribution markets.',
  },
  {
    question: "What is Braventa's active ingredient and form?",
    answer:
      'BRAVENTA is formulated as Fluralaner Tablets, categorized strictly for Veterinary Use.',
  },
  {
    question: 'Who manufactures Braventa and where is it made?',
    answer:
      'BRAVENTA Fluralaner Tablets are manufactured in Thailand by VELTRION Animal Health.',
  },
  {
    question: 'How can distributors and importers enquire about Braventa?',
    answer:
      'Veterinary pharmaceutical distributors, importers, wholesalers, and veterinary businesses can request product information or discuss distribution partnerships through the Business Enquiries form below.',
  },
] as const;

export const PRODUCT_IMAGES = {
  heroPackaging: '/src/assets/images/braventa_hero_packaging_clean_1795635584483.jpg',
  productAngle: '/src/assets/images/braventa_product_angle_clean_1795635585117.jpg',
  veterinaryEditorial: '/src/assets/images/veterinary_care_editorial_1795635565608.jpg',
  thailandOrigin: '/src/assets/images/thailand_pharma_origin_clean_1795635585114.jpg',
} as const;

export const INTERNATIONAL_COUNTRIES: readonly string[] = [
  'Australia',
  'Bahrain',
  'Bangladesh',
  'Belgium',
  'Brazil',
  'Cambodia',
  'Canada',
  'Chile',
  'Colombia',
  'Egypt',
  'France',
  'Germany',
  'India',
  'Indonesia',
  'Ireland',
  'Italy',
  'Japan',
  'Jordan',
  'Kenya',
  'Kuwait',
  'Laos',
  'Malaysia',
  'Mexico',
  'Morocco',
  'Myanmar',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'Oman',
  'Pakistan',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Saudi Arabia',
  'Singapore',
  'South Africa',
  'South Korea',
  'Spain',
  'Sri Lanka',
  'Switzerland',
  'Taiwan',
  'Thailand',
  'Turkey',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Vietnam',
  'Other Country / Territory',
] as const;

export type LegalDocumentKey = 'privacy' | 'terms' | 'disclaimer';

export interface LegalDocument {
  key: LegalDocumentKey;
  title: string;
  updatedNote: string;
  paragraphs: readonly string[];
}

export const LEGAL_DOCUMENTS: Record<LegalDocumentKey, LegalDocument> = {
  privacy: {
    key: 'privacy',
    title: 'Privacy Policy',
    updatedNote: 'Corporate Website Data Notice',
    paragraphs: [
      'This corporate website for BRAVENTA collects business contact details voluntarily submitted through the Business Enquiries form—specifically your full name, company or organisation, business email, country, enquiry type, and message.',
      'Submitted information is used solely to review and respond to legitimate product information requests, import and wholesale discussions, distribution enquiries, and business collaboration correspondence regarding Braventa Fluralaner Tablets.',
      'We do not sell or disclose submitted business contact information to unrelated third-party marketers.',
    ],
  },
  terms: {
    key: 'terms',
    title: 'Terms & Conditions',
    updatedNote: 'Corporate Information & Commercial Use',
    paragraphs: [
      'This website serves as an international corporate product presentation for BRAVENTA Fluralaner Tablets, manufactured in Thailand by VELTRION Animal Health, intended for veterinary pharmaceutical distributors, importers, wholesalers, and veterinary professionals.',
      'Nothing on this website constitutes a direct retail offer, veterinary prescribing instruction, or implied regulatory approval in any specific jurisdiction.',
      'All BRAVENTA brand identifiers and corporate attributions remain the property of VELTRION Animal Health.',
    ],
  },
  disclaimer: {
    key: 'disclaimer',
    title: 'Veterinary-Use Disclaimer',
    updatedNote: 'Important Veterinary Pharmaceutical Notice',
    paragraphs: [
      'BRAVENTA (Fluralaner Tablets) is a veterinary pharmaceutical product intended strictly for Veterinary Use. It is not for human use.',
      'This corporate website presents verified product identity, active ingredient, dosage form, manufacturer attribution, and Thailand manufacturing origin only. Tablet strengths, pack sizes, dosage instructions, target species indications, and regulatory dossiers are not published generically online.',
      'Qualified veterinary professionals, licensed importers, and commercial distributors may request official product documentation directly through the Business Enquiries form.',
    ],
  },
};
