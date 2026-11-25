import { ArrowRight } from 'lucide-react';
import { PRODUCT_IMAGES, type EnquiryTypeOption } from '../data/braventaData';
import { ResilientImage } from './ResilientImage';
import { RevealSection } from './RevealSection';

interface ManufacturerSectionProps {
  onSelectEnquiry: (enquiryType: EnquiryTypeOption) => void;
}

export function ManufacturerSection({ onSelectEnquiry }: ManufacturerSectionProps) {
  return (
    <section
      id="manufacturer"
      aria-labelledby="manufacturer-heading"
      className="scroll-mt-[68px] bg-[#123C34] text-white"
    >
      <RevealSection className="mx-auto max-w-6xl px-4 py-18 sm:px-6 sm:py-22 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <p className="text-xs font-medium tracking-[0.04em] text-[#8CD9CE]">
              Manufacturer &amp; Origin
            </p>
            <h2
              id="manufacturer-heading"
              className="mt-3 font-display text-[clamp(1.75rem,3vw,2.4rem)] font-bold leading-tight tracking-tight text-white"
            >
              Manufactured in Thailand. Presented to the World.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85">
              VELTRION Animal Health is the manufacturer of BRAVENTA Fluralaner Tablets in
              Thailand. We collaborate directly with veterinary pharmaceutical distributors,
              importers, and wholesale partners across international markets.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onSelectEnquiry('Business Partnership')}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#15998A] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#075E50] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span>Contact Manufacturer</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0D2E28]">
              <ResilientImage
                src={PRODUCT_IMAGES.thailandOrigin}
                alt="Modern pharmaceutical architecture in Thailand representing VELTRION Animal Health manufacturing origin"
                fallbackTitle="VELTRION Animal Health"
                fallbackSubtitle="BRAVENTA Fluralaner Tablets · Made in Thailand"
                className="aspect-video w-full object-cover"
                loading="lazy"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/12 px-5 py-4">
                <div>
                  <p className="font-display text-sm font-bold text-white">
                    VELTRION Animal Health
                  </p>
                  <p className="text-xs text-white/70">
                    Manufacturer of BRAVENTA Fluralaner Tablets · Made in Thailand
                  </p>
                </div>

                <svg
                  viewBox="0 0 120 32"
                  className="h-8 w-28 shrink-0"
                  aria-hidden="true"
                >
                  <line
                    x1="0"
                    y1="16"
                    x2="120"
                    y2="16"
                    stroke="#FFFFFF"
                    strokeOpacity="0.2"
                    strokeWidth="1"
                  />
                  <path
                    d="M40 16 Q 62 4, 92 10"
                    fill="none"
                    stroke="#8CD9CE"
                    strokeWidth="1.4"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M40 16 Q 22 6, 10 12"
                    fill="none"
                    stroke="#8CD9CE"
                    strokeWidth="1.4"
                    strokeDasharray="3 3"
                  />
                  <circle cx="40" cy="16" r="4" fill="#15998A" />
                  <circle cx="40" cy="16" r="7.5" fill="none" stroke="#8CD9CE" strokeWidth="1" />
                  <circle cx="10" cy="12" r="2" fill="#8CD9CE" />
                  <circle cx="92" cy="10" r="2" fill="#8CD9CE" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
    </section>
  );
}
