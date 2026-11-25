import { FOOTER_NAV_ITEMS, type LegalDocumentKey } from '../data/braventaData';

interface FooterProps {
  onNavigateToSection: (sectionId: string) => void;
  onOpenLegalDocument: (key: LegalDocumentKey) => void;
}

export function Footer({ onNavigateToSection, onOpenLegalDocument }: FooterProps) {
  return (
    <footer className="border-t border-[#123C34]/10 bg-[#F4F7F6] text-[#123C34]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-base font-bold tracking-[0.06em] text-[#075E50]">
              BRAVENTA
            </p>
            <p className="mt-1.5 text-sm text-[#123C34]/80">
              Fluralaner Tablets · Veterinary Use
            </p>
            <p className="mt-2 text-xs text-[#123C34]/65">
              Manufactured by VELTRION Animal Health · Made in Thailand.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-6 text-sm">
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToSection(item.id);
                  }}
                  className="text-[#123C34]/75 transition-colors hover:text-[#075E50]"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#123C34]/70">
              <button
                type="button"
                onClick={() => onOpenLegalDocument('privacy')}
                className="transition-colors hover:text-[#075E50] cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => onOpenLegalDocument('terms')}
                className="transition-colors hover:text-[#075E50] cursor-pointer"
              >
                Terms &amp; Conditions
              </button>
              <button
                type="button"
                onClick={() => onOpenLegalDocument('disclaimer')}
                className="transition-colors hover:text-[#075E50] cursor-pointer"
              >
                Veterinary-Use Disclaimer
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[#123C34]/10 pt-6 text-xs text-[#123C34]/60 sm:flex-row sm:items-center sm:justify-between">
          <p>Strictly for Veterinary Use. Not for human use.</p>
          <p>© {new Date().getFullYear()} VELTRION Animal Health</p>
        </div>
      </div>
    </footer>
  );
}
