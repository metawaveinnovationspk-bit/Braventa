import { ENQUIRY_TYPE_OPTIONS, type EnquiryTypeOption } from '../data/braventaData.ts';

export interface EnquiryFormInput {
  fullName: string;
  company: string;
  businessEmail: string;
  country: string;
  enquiryType: string;
  message: string;
}

export type EnquiryFieldName = keyof EnquiryFormInput;

export type EnquiryValidationErrors = Partial<Record<EnquiryFieldName, string>>;

export interface ValidatedEnquiry {
  fullName: string;
  company: string;
  businessEmail: string;
  country: string;
  enquiryType: EnquiryTypeOption;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: EnquiryValidationErrors;
  sanitized: ValidatedEnquiry | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeText(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeMessage(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

export function isValidEnquiryType(value: string): value is EnquiryTypeOption {
  return (ENQUIRY_TYPE_OPTIONS as readonly string[]).includes(value);
}

export function validateEnquiryInput(input: Partial<EnquiryFormInput>): ValidationResult {
  const fullName = normalizeText(input.fullName);
  const company = normalizeText(input.company);
  const businessEmail = normalizeText(input.businessEmail).toLowerCase();
  const country = normalizeText(input.country);
  const enquiryTypeRaw = normalizeText(input.enquiryType);
  const message = normalizeMessage(input.message);

  const errors: EnquiryValidationErrors = {};

  if (fullName.length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  } else if (fullName.length > 120) {
    errors.fullName = 'Full name must be 120 characters or fewer.';
  }

  if (company.length < 2) {
    errors.company = 'Please enter your company or organisation name.';
  } else if (company.length > 160) {
    errors.company = 'Company or organisation must be 160 characters or fewer.';
  }

  if (!businessEmail) {
    errors.businessEmail = 'Please enter your business email address.';
  } else if (!EMAIL_PATTERN.test(businessEmail) || businessEmail.length > 180) {
    errors.businessEmail = 'Please enter a valid business email address.';
  }

  if (country.length < 2) {
    errors.country = 'Please enter your country or territory.';
  } else if (country.length > 100) {
    errors.country = 'Country name must be 100 characters or fewer.';
  }

  if (!enquiryTypeRaw || !isValidEnquiryType(enquiryTypeRaw)) {
    errors.enquiryType = 'Please select an enquiry type.';
  }

  if (message.length < 15) {
    errors.message = 'Please enter at least 15 characters describing your enquiry.';
  } else if (message.length > 3000) {
    errors.message = 'Message must be 3,000 characters or fewer.';
  }

  const isValid = Object.keys(errors).length === 0;

  if (!isValid || !isValidEnquiryType(enquiryTypeRaw)) {
    return {
      isValid: false,
      errors,
      sanitized: null,
    };
  }

  return {
    isValid: true,
    errors: {},
    sanitized: {
      fullName,
      company,
      businessEmail,
      country,
      enquiryType: enquiryTypeRaw,
      message,
    },
  };
}

export function generateEnquiryReference(date: Date = new Date(), sequenceSeed?: number): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const suffixNum =
    typeof sequenceSeed === 'number'
      ? Math.abs(Math.floor(sequenceSeed)) % 10000
      : Math.floor(1000 + Math.random() * 9000);
  const suffix = String(suffixNum).padStart(4, '0');
  return `BRV-${year}${month}${day}-${suffix}`;
}

export function formatEnquirySummary(
  enquiry: ValidatedEnquiry,
  referenceId: string,
  recordedAtIso: string,
): string {
  return [
    'BRAVENTA — BUSINESS ENQUIRY SUMMARY',
    `Reference ID: ${referenceId}`,
    `Recorded At (UTC): ${recordedAtIso}`,
    `Product: BRAVENTA (Fluralaner Tablets · Veterinary Use)`,
    `Manufacturer: VELTRION Animal Health (Made in Thailand)`,
    '----------------------------------------',
    `Full Name: ${enquiry.fullName}`,
    `Company / Organisation: ${enquiry.company}`,
    `Business Email: ${enquiry.businessEmail}`,
    `Country: ${enquiry.country}`,
    `Enquiry Type: ${enquiry.enquiryType}`,
    'Message:',
    enquiry.message,
  ].join('\n');
}
