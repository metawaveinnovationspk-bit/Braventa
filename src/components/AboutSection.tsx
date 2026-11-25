import { AEO_FAQ_ITEMS, PRODUCT_IMAGES } from '../data/braventaData';
import { ResilientImage } from './ResilientImage';
import { RevealSection } from './RevealSection';

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-[68px] bg-white"
    >
      <RevealSection className="mx-auto max-w-6xl px-4 py-18 sm:px-6 sm:py-22 lg:px-8 lg:py-26">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Curated Editorial Veterinary Photography */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-[#123C34]/10 bg-[#F4F7F6] shadow-[0_16px_40px_rgba(18,60,52,0.05)]">
              <ResilientImage
                src={PRODUCT_IMAGES.veterinaryEditorial}
                alt="Veterinarian caring for a companion dog in a modern veterinary clinic"
                fallbackTitle="Veterinary Pharmaceutical Care"
                fallbackSubtitle="BRAVENTA Fluralaner Tablets"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Concise Answer-Led Overview (AEO & GEO Clarity) */}
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-[0.04em] text-[#075E50]">
              About Braventa
            </p>
            <h2
              id="about-heading"
              className="mt-3 font-display text-[clamp(1.75rem,3vw,2.35rem)] font-bold leading-tight tracking-tight text-[#123C34]"
            >
              Clear Product Identity for International Veterinary Markets.
            </h2>

            <dl className="mt-7 divide-y divide-[#123C34]/10 border-t border-[#123C34]/12">
              {AEO_FAQ_ITEMS.map((item) => (
                <div key={item.question} className="py-4">
                  <dt className="font-display text-sm font-semibold text-[#123C34] sm:text-base">
                    {item.question}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-[#123C34]/75">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </RevealSection>
    </section>
  );
}
