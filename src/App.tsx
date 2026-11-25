import { useCallback, useEffect, useRef, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { EnquirySection } from './components/EnquirySection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { LegalModal } from './components/LegalModal';
import { ManufacturerSection } from './components/ManufacturerSection';
import { ProductSection } from './components/ProductSection';
import type { EnquiryTypeOption, LegalDocumentKey } from './data/braventaData';
import { computeActiveSection, type SectionBounds } from './utils/scrollSpy';

const TRACKED_SECTIONS = ['home', 'product', 'about', 'manufacturer', 'contact'] as const;
const HEADER_HEIGHT = 68;

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [selectedEnquiryType, setSelectedEnquiryType] =
    useState<EnquiryTypeOption>('Distribution Enquiry');
  const [legalModalKey, setLegalModalKey] = useState<LegalDocumentKey | null>(null);
  const [isNotFoundRoute, setIsNotFoundRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname !== '/' && window.location.pathname !== '/index.html';
  });

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const manualScrollLockUntil = useRef<number>(0);

  useEffect(() => {
    if (isNotFoundRoute) return;

    let rafId = 0;

    const syncActiveSectionFromScroll = () => {
      if (Date.now() < manualScrollLockUntil.current) {
        return;
      }

      const sectionBounds: SectionBounds[] = [];
      for (const id of TRACKED_SECTIONS) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          sectionBounds.push({
            id,
            top,
            bottom: top + rect.height,
          });
        }
      }

      const nextActive = computeActiveSection({
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        headerHeight: HEADER_HEIGHT,
        sections: sectionBounds,
      });

      setActiveSection((prev) => (prev === nextActive ? prev : nextActive));
    };

    const handleScrollOrResize = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(syncActiveSectionFromScroll);
    };

    syncActiveSectionFromScroll();
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isNotFoundRoute]);

  const scrollToSection = useCallback((sectionId: string, focusNameInput = false) => {
    const target = document.getElementById(sectionId);
    if (target) {
      // Lock scroll-spy briefly so smooth scroll doesn't flicker intermediate tabs
      manualScrollLockUntil.current = Date.now() + 750;
      setActiveSection(sectionId);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (focusNameInput) {
      setTimeout(() => {
        nameInputRef.current?.focus({ preventScroll: true });
      }, 450);
    }
  }, []);

  const handleSelectEnquiry = useCallback(
    (enquiryType: EnquiryTypeOption) => {
      setSelectedEnquiryType(enquiryType);
      scrollToSection('contact', true);
    },
    [scrollToSection],
  );

  if (isNotFoundRoute) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F7F6] px-4 text-center text-[#123C34]">
        <p className="font-mono text-xs font-medium text-[#075E50]">404 — Page Not Found</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-[#123C34]">
          BRAVENTA Corporate Website
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#123C34]/75">
          The requested path does not exist on this site. Return to the main BRAVENTA Fluralaner
          Tablets corporate page.
        </p>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/');
            setIsNotFoundRoute(false);
          }}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#075E50] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#123C34]"
        >
          Return to Home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#123C34]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[#075E50] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <Header
        activeSection={activeSection}
        onNavigateToSection={(id) => scrollToSection(id)}
        onPrimaryEnquiryClick={() => handleSelectEnquiry('Distribution Enquiry')}
      />

      <main id="main-content">
        <HeroSection
          onExploreProduct={() => scrollToSection('product')}
          onBusinessEnquiry={() => handleSelectEnquiry('Distribution Enquiry')}
        />

        <ProductSection onSelectEnquiry={handleSelectEnquiry} />

        <AboutSection />

        <ManufacturerSection onSelectEnquiry={handleSelectEnquiry} />

        <EnquirySection
          selectedEnquiryType={selectedEnquiryType}
          onEnquiryTypeChange={setSelectedEnquiryType}
          nameInputRef={nameInputRef}
        />
      </main>

      <Footer
        onNavigateToSection={(id) => scrollToSection(id)}
        onOpenLegalDocument={setLegalModalKey}
      />

      <LegalModal
        activeDocumentKey={legalModalKey}
        onClose={() => setLegalModalKey(null)}
      />
    </div>
  );
}
