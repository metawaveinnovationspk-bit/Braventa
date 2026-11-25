import { ArrowRight } from 'lucide-react';
import { PRODUCT_IMAGES } from '../data/braventaData';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onExploreProduct: () => void;
  onBusinessEnquiry: () => void;
}

export function HeroSection({ onExploreProduct, onBusinessEnquiry }: HeroSectionProps) {
  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="scroll-mt-[68px] bg-white"
    >
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pb-22 sm:pt-14 lg:px-8 lg:pb-26 lg:pt-18">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Typography & Actions */}
          <div className="lg:col-span-6">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium tracking-[0.04em] text-[#075E50]">
              <span className="whitespace-nowrap">Fluralaner Tablets</span>
              <span className="text-[#123C34]/25" aria-hidden="true">
                ·
              </span>
              <span className="whitespace-nowrap">Veterinary Use</span>
              <span className="text-[#123C34]/25" aria-hidden="true">
                ·
              </span>
              <span className="whitespace-nowrap">Made in Thailand</span>
            </p>

            <h1
              id="hero-heading"
              className="mt-4 font-display text-[clamp(2.15rem,4.4vw,3.65rem)] font-bold leading-[1.08] tracking-tight text-[#123C34]"
            >
              <span className="mb-1.5 block text-[clamp(0.875rem,1.2vw,1rem)] font-semibold tracking-[0.1em] text-[#075E50]">
                BRAVENTA
              </span>
              Advancing Veterinary Care.
            </h1>

            <p className="mt-5 max-w-xl text-[clamp(1rem,1.25vw,1.125rem)] leading-relaxed text-[#123C34]/80">
              Introducing Braventa Fluralaner Tablets — a veterinary pharmaceutical product
              manufactured in Thailand by VELTRION Animal Health.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={onBusinessEnquiry}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#075E50] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(7,94,80,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#123C34] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075E50]"
              >
                <span>Business Enquiry</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onExploreProduct}
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#123C34]/20 bg-white px-6 py-3 text-sm font-semibold text-[#123C34] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#075E50] hover:text-[#075E50] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075E50]"
              >
                Explore Braventa
              </button>
            </div>

            <dl className="mt-9 grid grid-cols-1 gap-4 border-t border-[#123C34]/12 pt-5 sm:grid-cols-[1fr_1.4fr_0.8fr] sm:gap-5">
              <div>
                <dt className="text-xs font-medium text-[#123C34]/60">Product</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[#123C34]">
                  BRAVENTA Fluralaner Tablets
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#123C34]/60">Manufacturer</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[#123C34]">
                  VELTRION Animal Health
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#123C34]/60">Origin</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[#123C34]">
                  Made in Thailand
                </dd>
              </div>
            </dl>
          </div>

          {/* Right Packaging Visual Showcase */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-[#123C34]/10 bg-[#F4F7F6] shadow-[0_24px_60px_rgba(18,60,52,0.08)]">
              <ResilientImage
                src={PRODUCT_IMAGES.heroPackaging}
                alt="BRAVENTA Fluralaner Tablets veterinary pharmaceutical carton and blister pack manufactured in Thailand by VELTRION Animal Health"
                fallbackTitle="BRAVENTA — Fluralaner Tablets"
                fallbackSubtitle="Veterinary Use · VELTRION Animal Health · Made in Thailand"
                className="aspect-[4/3] w-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
