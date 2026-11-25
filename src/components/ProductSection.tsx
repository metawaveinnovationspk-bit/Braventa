import { ArrowRight } from 'lucide-react';
import {
  PRODUCT_ATTRIBUTES,
  PRODUCT_IMAGES,
  type EnquiryTypeOption,
} from '../data/braventaData';
import { ResilientImage } from './ResilientImage';
import { RevealSection } from './RevealSection';

interface ProductSectionProps {
  onSelectEnquiry: (enquiryType: EnquiryTypeOption) => void;
}

export function ProductSection({ onSelectEnquiry }: ProductSectionProps) {
  return (
    <section
      id="product"
      aria-labelledby="product-heading"
      className="scroll-mt-[68px] bg-[#F4F7F6]"
    >
      <RevealSection className="mx-auto max-w-6xl px-4 py-18 sm:px-6 sm:py-22 lg:px-8 lg:py-26">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Prominent Product Packaging Photography */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-[#123C34]/10 bg-white shadow-[0_20px_50px_rgba(18,60,52,0.06)]">
              <ResilientImage
                src={PRODUCT_IMAGES.productAngle}
                alt="BRAVENTA Fluralaner Tablets veterinary medicine carton beside silver blister pack"
                fallbackTitle="BRAVENTA Fluralaner Tablets"
                fallbackSubtitle="Veterinary Use · VELTRION Animal Health"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Clean Product Introduction & Identity */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3">
              <p className="text-xs font-medium tracking-[0.04em] text-[#075E50]">
                Product Introduction
              </p>
              <svg
                viewBox="0 0 36 16"
                className="h-4 w-9 text-[#15998A]/60"
                aria-hidden="true"
              >
                <polygon
                  points="6,2 12,5 12,11 6,14 0,11 0,5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <line x1="12" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="26" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>

            <h2
              id="product-heading"
              className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-tight text-[#123C34]"
            >
              BRAVENTA Fluralaner Tablets
            </h2>
            <p className="mt-1.5 text-base font-medium text-[#075E50] sm:text-lg">
              Veterinary Pharmaceutical Product · Veterinary Use
            </p>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#123C34]/80">
              Braventa is a veterinary pharmaceutical product formulated as Fluralaner Tablets for
              veterinary use. Manufactured in Thailand by VELTRION Animal Health, it is presented
              for veterinary pharmaceutical distributors, importers, and healthcare partners.
            </p>

            <dl className="mt-7 divide-y divide-[#123C34]/10 border-y border-[#123C34]/12">
              {PRODUCT_ATTRIBUTES.map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between gap-4 py-3 text-sm"
                >
                  <dt className="text-[#123C34]/65">{item.label}</dt>
                  <dd className="text-right font-semibold text-[#123C34]">{item.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => onSelectEnquiry('Product Information')}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#075E50] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#123C34] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075E50]"
              >
                <span>Request Product Information</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onSelectEnquiry('Distribution Enquiry')}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#123C34]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#123C34] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#075E50] hover:text-[#075E50] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075E50]"
              >
                Distribution Enquiry
              </button>
            </div>
          </div>
        </div>
      </RevealSection>
    </section>
  );
}
