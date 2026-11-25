export interface SectionBounds {
  id: string;
  top: number;
  bottom: number;
}

export interface ScrollSpyInput {
  scrollY: number;
  viewportHeight: number;
  documentHeight: number;
  headerHeight: number;
  sections: readonly SectionBounds[];
}

export function computeActiveSection({
  scrollY,
  viewportHeight,
  documentHeight,
  headerHeight,
  sections,
}: ScrollSpyInput): string {
  if (sections.length === 0) {
    return 'home';
  }

  // At the very top of the page, always highlight the first section
  if (scrollY <= 24) {
    return sections[0].id;
  }

  // At the bottom of the page, always highlight the final section (e.g. Contact)
  if (viewportHeight > 0 && scrollY + viewportHeight >= documentHeight - 24) {
    return sections[sections.length - 1].id;
  }

  // Anchor line slightly below the sticky header (30% into the visible viewport below header)
  const triggerLine = scrollY + headerHeight + Math.min(180, Math.max(60, viewportHeight * 0.22));

  let activeId = sections[0].id;
  for (const section of sections) {
    if (section.top <= triggerLine) {
      activeId = section.id;
    } else {
      break;
    }
  }

  return activeId;
}
