import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatEnquirySummary,
  generateEnquiryReference,
  isValidEnquiryType,
  validateEnquiryInput,
} from './enquiryValidation.ts';

test('rejects empty submission with field-level errors for all 6 required fields', () => {
  const result = validateEnquiryInput({
    fullName: '',
    company: '   ',
    businessEmail: '',
    country: '',
    enquiryType: '',
    message: '',
  });

  assert.equal(result.isValid, false);
  assert.equal(result.sanitized, null);
  assert.ok(result.errors.fullName);
  assert.ok(result.errors.company);
  assert.ok(result.errors.businessEmail);
  assert.ok(result.errors.country);
  assert.ok(result.errors.enquiryType);
  assert.ok(result.errors.message);
});

test('rejects invalid email and unsupported enquiry type', () => {
  const result = validateEnquiryInput({
    fullName: 'Dr. Somchai Wattana',
    company: 'Bangkok Vet Supply Co.',
    businessEmail: 'invalid-email',
    country: 'Thailand',
    enquiryType: 'Retail Purchase',
    message: 'Requesting product information and distribution details for Braventa.',
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.businessEmail);
  assert.ok(result.errors.enquiryType);
  assert.equal(result.errors.fullName, undefined);
  assert.equal(result.errors.company, undefined);
  assert.equal(result.errors.country, undefined);
  assert.equal(result.errors.message, undefined);
});

test('accepts and normalizes valid 6-field commercial enquiry payload', () => {
  const result = validateEnquiryInput({
    fullName: '  Elena   Rostova  ',
    company: '  EuroVet   Distribution GmbH ',
    businessEmail: '  Elena.Rostova@EuroVet.Example  ',
    country: 'Germany',
    enquiryType: 'Import / Wholesale Enquiry',
    message: '  We distribute veterinary pharmaceuticals and would like commercial terms for Braventa.  ',
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.sanitized, {
    fullName: 'Elena Rostova',
    company: 'EuroVet Distribution GmbH',
    businessEmail: 'elena.rostova@eurovet.example',
    country: 'Germany',
    enquiryType: 'Import / Wholesale Enquiry',
    message: 'We distribute veterinary pharmaceuticals and would like commercial terms for Braventa.',
  });
});

test('isValidEnquiryType permits only the five approved options', () => {
  assert.equal(isValidEnquiryType('Product Information'), true);
  assert.equal(isValidEnquiryType('Distribution Enquiry'), true);
  assert.equal(isValidEnquiryType('Import / Wholesale Enquiry'), true);
  assert.equal(isValidEnquiryType('Business Partnership'), true);
  assert.equal(isValidEnquiryType('General Enquiry'), true);
  assert.equal(isValidEnquiryType('Buy Now'), false);
});

test('generateEnquiryReference produces deterministic UTC format when seed provided', () => {
  const ref = generateEnquiryReference(new Date('2026-11-25T10:15:00.000Z'), 42);
  assert.equal(ref, 'BRV-20261125-0042');
});

test('formatEnquirySummary includes verified product attribution and submitted details', () => {
  const summary = formatEnquirySummary(
    {
      fullName: 'Tariq Al-Mansoor',
      company: 'Gulf Veterinary Partners',
      businessEmail: 'tariq@gulfvet.example',
      country: 'United Arab Emirates',
      enquiryType: 'Distribution Enquiry',
      message: 'Seeking distribution onboarding requirements for Braventa Fluralaner Tablets.',
    },
    'BRV-20261125-1234',
    '2026-11-25T10:15:00.000Z',
  );

  assert.match(summary, /Reference ID: BRV-20261125-1234/);
  assert.match(summary, /VELTRION Animal Health \(Made in Thailand\)/);
  assert.match(summary, /Distribution Enquiry/);
  assert.match(summary, /Gulf Veterinary Partners/);
});
