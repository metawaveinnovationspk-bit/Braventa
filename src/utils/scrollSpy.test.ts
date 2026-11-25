import test from 'node:test';
import assert from 'node:assert/strict';
import { computeActiveSection, type SectionBounds } from './scrollSpy.ts';

const SAMPLE_SECTIONS: SectionBounds[] = [
  { id: 'home', top: 0, bottom: 720 },
  { id: 'product', top: 720, bottom: 1480 },
  { id: 'about', top: 1480, bottom: 2150 },
  { id: 'manufacturer', top: 2150, bottom: 2700 },
  { id: 'contact', top: 2700, bottom: 3450 },
];

test('selects first section at top of page', () => {
  const active = computeActiveSection({
    scrollY: 0,
    viewportHeight: 900,
    documentHeight: 3650,
    headerHeight: 68,
    sections: SAMPLE_SECTIONS,
  });
  assert.equal(active, 'home');
});

test('selects product when scrolled past hero into product section', () => {
  const active = computeActiveSection({
    scrollY: 680,
    viewportHeight: 900,
    documentHeight: 3650,
    headerHeight: 68,
    sections: SAMPLE_SECTIONS,
  });
  assert.equal(active, 'product');
});

test('selects manufacturer when scrolled into manufacturer band', () => {
  const active = computeActiveSection({
    scrollY: 2060,
    viewportHeight: 900,
    documentHeight: 3650,
    headerHeight: 68,
    sections: SAMPLE_SECTIONS,
  });
  assert.equal(active, 'manufacturer');
});

test('selects final contact section when scrolled to bottom even if last section is shorter than viewport', () => {
  const active = computeActiveSection({
    scrollY: 2750,
    viewportHeight: 900,
    documentHeight: 3650,
    headerHeight: 68,
    sections: SAMPLE_SECTIONS,
  });
  assert.equal(active, 'contact');
});
