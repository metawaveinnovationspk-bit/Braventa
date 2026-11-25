import { useEffect } from 'react';
import { X } from 'lucide-react';
import { LEGAL_DOCUMENTS, type LegalDocumentKey } from '../data/braventaData';

interface LegalModalProps {
  activeDocumentKey: LegalDocumentKey | null;
  onClose: () => void;
}

export function LegalModal({ activeDocumentKey, onClose }: LegalModalProps) {
  useEffect(() => {
    if (!activeDocumentKey) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDocumentKey, onClose]);

  if (!activeDocumentKey) {
    return null;
  }

  const doc = LEGAL_DOCUMENTS[activeDocumentKey];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#123C34]/60 p-4 backdrop-blur-[2px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-lg border border-[#123C34]/15 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-[#123C34]/12 pb-4">
          <div>
            <p className="text-xs font-medium tracking-wider uppercase text-[#075E50]">
              {doc.updatedNote}
            </p>
            <h2
              id="legal-modal-title"
              className="mt-1 font-display text-xl font-bold text-[#123C34]"
            >
              {doc.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${doc.title}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#123C34]/15 text-[#123C34] transition-colors hover:bg-[#F4F7F6] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075E50]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#123C34]/85">
          {doc.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-6 flex justify-end border-t border-[#123C34]/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[40px] items-center justify-center rounded-md bg-[#075E50] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#123C34] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
