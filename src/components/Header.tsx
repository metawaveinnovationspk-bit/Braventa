import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { HEADER_NAV_ITEMS } from '../data/braventaData';

interface HeaderProps {
  activeSection: string;
  onNavigateToSection: (sectionId: string) => void;
  onPrimaryEnquiryClick: () => void;
}

interface IndicatorGeometry {
  left: number;
  width: number;
  visible: boolean;
}

export function Header({
  activeSection,
  onNavigateToSection,
  onPrimaryEnquiryClick,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<IndicatorGeometry>({
    left: 0,
    width: 0,
    visible: false,
  });

  const navRef = useRef<HTMLElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileOpen]);

  const updateIndicator = useCallback(() => {
    const targetId = hoveredId ?? activeSection;
    const targetEl = linkRefs.current[targetId];
    const navEl = navRef.current;

    if (!targetEl || !navEl) {
      setIndicator((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const navRect = navEl.getBoundingClientRect();
    const linkRect = targetEl.getBoundingClientRect();

    // Inset the bar slightly for crisp typographic alignment
    const horizontalInset = 10;
    const nextLeft = linkRect.left - navRect.left + horizontalInset;
    const nextWidth = Math.max(12, linkRect.width - horizontalInset * 2);

    setIndicator({
      left: nextLeft,
      width: nextWidth,
      visible: true,
    });
  }, [activeSection, hoveredId]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const handleLinkClick = (sectionId: string) => {
    setMobileOpen(false);
    setHoveredId(null);
    onNavigateToSection(sectionId);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-white transition-shadow duration-200 ${
        isScrolled
          ? 'border-b border-[#123C34]/12 shadow-[0_6px_24px_rgba(18,60,52,0.06)]'
          : 'border-b border-[#123C34]/10'
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Clean single-element Brand Wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('home');
          }}
          className="font-display text-lg font-bold tracking-[0.08em] text-[#075E50] transition-opacity duration-150 hover:opacity-85 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#075E50]"
        >
          BRAVENTA
        </a>

        {/* Zone 2: Minimal Navigation Rail with Smooth Sliding Indicator */}
        <nav
          ref={navRef}
          aria-label="Primary navigation"
          onMouseLeave={() => setHoveredId(null)}
          className="relative hidden md:flex items-center gap-1 lg:gap-2"
        >
          {HEADER_NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const isHovered = hoveredId === item.id;
            return (
              <a
                key={item.id}
                ref={(el) => {
                  linkRefs.current[item.id] = el;
                }}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.id);
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onFocus={() => setHoveredId(item.id)}
                onBlur={() => setHoveredId(null)}
                aria-current={isActive ? 'location' : undefined}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075E50] ${
                  isActive
                    ? 'bg-[#075E50]/[0.06] text-[#075E50]'
                    : isHovered
                      ? 'bg-[#F4F7F6] text-[#075E50]'
                      : 'text-[#123C34]/75 hover:text-[#075E50]'
                }`}
              >
                {item.label}
              </a>
            );
          })}

          {/* Smooth sliding underline indicator */}
          <span
            aria-hidden="true"
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: `${indicator.width}px`,
              opacity: indicator.visible ? 1 : 0,
            }}
            className="pointer-events-none absolute -bottom-[1px] left-0 h-[2px] rounded-full bg-[#075E50] transition-[transform,width,opacity] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onPrimaryEnquiryClick();
            }}
            className="group hidden sm:inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-[#075E50] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#123C34] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075E50]"
          >
            <span>Business Enquiry</span>
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#123C34]/15 text-[#123C34] transition-colors hover:bg-[#F4F7F6] md:hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075E50]"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen ? (
        <div
          id="mobile-navigation-drawer"
          className="border-t border-[#123C34]/10 bg-white px-4 pb-6 pt-3 shadow-[0_16px_32px_rgba(18,60,52,0.08)] md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {HEADER_NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.id);
                  }}
                  aria-current={isActive ? 'location' : undefined}
                  className={`flex min-h-[44px] items-center justify-between rounded-lg px-3.5 py-2.5 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-[#075E50]/[0.07] text-[#075E50]'
                      : 'text-[#123C34]/85 hover:bg-[#F4F7F6] hover:text-[#075E50]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className="text-xs font-semibold text-[#075E50]">Active</span>
                  ) : null}
                </a>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-[#123C34]/10 pt-4">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onPrimaryEnquiryClick();
              }}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#075E50] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#123C34] cursor-pointer"
            >
              <span>Business Enquiry</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
