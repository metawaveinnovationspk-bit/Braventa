import { useEffect, useState, type FormEvent, type RefObject } from 'react';
import { AlertCircle, Check, CheckCircle2, Copy, Info, Send } from 'lucide-react';
import {
  ENQUIRY_TYPE_OPTIONS,
  INTERNATIONAL_COUNTRIES,
  type EnquiryTypeOption,
} from '../data/braventaData';
import { RevealSection } from './RevealSection';
import {
  validateEnquiryInput,
  type EnquiryFormInput,
  type EnquiryValidationErrors,
  type ValidatedEnquiry,
} from '../utils/enquiryValidation';

interface EnquirySectionProps {
  selectedEnquiryType: EnquiryTypeOption;
  onEnquiryTypeChange: (type: EnquiryTypeOption) => void;
  nameInputRef: RefObject<HTMLInputElement | null>;
}

interface SubmissionSuccessState {
  referenceId: string;
  recordedAt: string;
  deliveryMode: 'webhook_dispatched' | 'recorded_locally_no_email_gateway';
  enquiry: ValidatedEnquiry;
  formattedSummary: string;
}

const INITIAL_FORM_STATE: Omit<EnquiryFormInput, 'enquiryType'> = {
  fullName: '',
  company: '',
  businessEmail: '',
  country: '',
  message: '',
};

export function EnquirySection({
  selectedEnquiryType,
  onEnquiryTypeChange,
  nameInputRef,
}: EnquirySectionProps) {
  const [formValues, setFormValues] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<EnquiryValidationErrors>({});
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<SubmissionSuccessState | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    if (!hasSubmittedOnce) return;
    const validation = validateEnquiryInput({
      ...formValues,
      enquiryType: selectedEnquiryType,
    });
    setErrors(validation.errors);
  }, [formValues, selectedEnquiryType, hasSubmittedOnce]);

  const handleFieldChange = (field: keyof typeof INITIAL_FORM_STATE, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (serverError) {
      setServerError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmittedOnce(true);
    setServerError(null);

    const payload: EnquiryFormInput = {
      ...formValues,
      enquiryType: selectedEnquiryType,
    };

    const validation = validateEnquiryInput(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (data?.errors && typeof data.errors === 'object') {
          setErrors(data.errors);
        }
        setServerError(
          data?.message || 'Please check the highlighted fields and try again.',
        );
        return;
      }

      if (data.deliveryMode === 'webhook_dispatched') {
        const gtagFn = (window as { gtag?: (...args: unknown[]) => void }).gtag;
        if (typeof gtagFn === 'function') {
          gtagFn('event', 'generate_lead', {
            enquiry_type: selectedEnquiryType,
            country: data.enquiry?.country,
          });
        }
      }

      setSubmissionSuccess({
        referenceId: data.referenceId,
        recordedAt: data.recordedAt,
        deliveryMode: data.deliveryMode,
        enquiry: data.enquiry,
        formattedSummary: data.formattedSummary,
      });
      setFormValues(INITIAL_FORM_STATE);
      setHasSubmittedOnce(false);
    } catch {
      setServerError('Unable to reach the server. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySummary = async () => {
    if (!submissionSuccess) return;
    try {
      await navigator.clipboard.writeText(submissionSuccess.formattedSummary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      setCopiedSummary(false);
    }
  };

  const handleResetSuccess = () => {
    setSubmissionSuccess(null);
    setCopiedSummary(false);
    setServerError(null);
    setErrors({});
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-[68px] bg-white"
    >
      <RevealSection className="mx-auto max-w-6xl px-4 py-18 sm:px-6 sm:py-22 lg:px-8 lg:py-26">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Heading & Context */}
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.04em] text-[#075E50]">
              Distribution &amp; Business Enquiries
            </p>
            <h2
              id="contact-heading"
              className="mt-3 font-display text-[clamp(1.75rem,3vw,2.4rem)] font-bold leading-tight tracking-tight text-[#123C34]"
            >
              Let&apos;s Connect.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#123C34]/80">
              For product information, distribution opportunities and commercial enquiries, connect
              with us.
            </p>

            <div className="mt-8 border-t border-[#123C34]/12 pt-6 text-sm leading-relaxed text-[#123C34]/75">
              <p className="font-semibold text-[#123C34]">BRAVENTA · Fluralaner Tablets</p>
              <p className="mt-1">Manufactured by VELTRION Animal Health · Made in Thailand</p>
            </div>
          </div>

          {/* Right 6-Field Business Enquiry Form */}
          <div className="rounded-2xl border border-[#123C34]/10 bg-[#F4F7F6] p-6 shadow-[0_16px_45px_rgba(18,60,52,0.05)] sm:p-8 lg:col-span-7">
            {submissionSuccess ? (
              <div aria-live="polite" className="space-y-6">
                <div className="flex items-start gap-3.5 border-b border-[#123C34]/12 pb-5">
                  <CheckCircle2
                    className="mt-0.5 h-6 w-6 shrink-0 text-[#075E50]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-mono text-xs font-medium text-[#075E50]">
                      Reference: {submissionSuccess.referenceId}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-bold text-[#123C34]">
                      {submissionSuccess.deliveryMode === 'webhook_dispatched'
                        ? 'Enquiry Sent'
                        : 'Enquiry Validated & Recorded'}
                    </h3>
                  </div>
                </div>

                {submissionSuccess.deliveryMode === 'recorded_locally_no_email_gateway' ? (
                  <div className="flex items-start gap-2.5 rounded-xl border border-[#075E50]/20 bg-white p-4 text-sm leading-relaxed text-[#123C34]/85">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#075E50]" aria-hidden="true" />
                    <p>
                      Your enquiry has been validated and saved on this server under reference{' '}
                      <span className="font-mono font-medium text-[#123C34]">
                        {submissionSuccess.referenceId}
                      </span>
                      . Because an external email or CRM integration is not yet connected to this
                      deployment, no email has been transmitted. Please copy your formatted summary
                      below.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-[#123C34]/85">
                    Thank you, {submissionSuccess.enquiry.fullName}. Your enquiry has been
                    submitted under reference{' '}
                    <span className="font-mono font-medium text-[#123C34]">
                      {submissionSuccess.referenceId}
                    </span>
                    .
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#123C34]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#123C34] transition-colors hover:border-[#075E50] hover:text-[#075E50] cursor-pointer"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="h-4 w-4 text-[#075E50]" aria-hidden="true" />
                        <span>Summary Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetSuccess}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#075E50] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#123C34] cursor-pointer"
                  >
                    Send Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {serverError ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm text-red-900"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                    <span>{serverError}</span>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="enquiry-full-name"
                      className="block text-sm font-medium text-[#123C34]"
                    >
                      Full Name <span className="text-[#075E50]">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      id="enquiry-full-name"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      value={formValues.fullName}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={errors.fullName ? 'error-full-name' : undefined}
                      placeholder="Your full name"
                      className={`mt-1.5 block w-full min-h-[44px] rounded-xl border bg-white px-4 py-2.5 text-sm text-[#123C34] placeholder:text-[#123C34]/40 focus:outline-2 focus:outline-offset-0 ${
                        errors.fullName
                          ? 'border-red-600 focus:outline-red-600'
                          : 'border-[#123C34]/15 focus:border-[#075E50] focus:outline-[#075E50]'
                      }`}
                    />
                    {errors.fullName ? (
                      <p
                        id="error-full-name"
                        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.fullName}</span>
                      </p>
                    ) : null}
                  </div>

                  {/* Company / Organisation */}
                  <div>
                    <label
                      htmlFor="enquiry-company"
                      className="block text-sm font-medium text-[#123C34]"
                    >
                      Company / Organisation <span className="text-[#075E50]">*</span>
                    </label>
                    <input
                      id="enquiry-company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      required
                      value={formValues.company}
                      onChange={(e) => handleFieldChange('company', e.target.value)}
                      aria-invalid={Boolean(errors.company)}
                      aria-describedby={errors.company ? 'error-company' : undefined}
                      placeholder="Company or clinic name"
                      className={`mt-1.5 block w-full min-h-[44px] rounded-xl border bg-white px-4 py-2.5 text-sm text-[#123C34] placeholder:text-[#123C34]/40 focus:outline-2 focus:outline-offset-0 ${
                        errors.company
                          ? 'border-red-600 focus:outline-red-600'
                          : 'border-[#123C34]/15 focus:border-[#075E50] focus:outline-[#075E50]'
                      }`}
                    />
                    {errors.company ? (
                      <p
                        id="error-company"
                        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.company}</span>
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Business Email */}
                  <div>
                    <label
                      htmlFor="enquiry-email"
                      className="block text-sm font-medium text-[#123C34]"
                    >
                      Business Email <span className="text-[#075E50]">*</span>
                    </label>
                    <input
                      id="enquiry-email"
                      name="businessEmail"
                      type="email"
                      autoComplete="email"
                      required
                      value={formValues.businessEmail}
                      onChange={(e) => handleFieldChange('businessEmail', e.target.value)}
                      aria-invalid={Boolean(errors.businessEmail)}
                      aria-describedby={errors.businessEmail ? 'error-email' : undefined}
                      placeholder="name@company.com"
                      className={`mt-1.5 block w-full min-h-[44px] rounded-xl border bg-white px-4 py-2.5 text-sm text-[#123C34] placeholder:text-[#123C34]/40 focus:outline-2 focus:outline-offset-0 ${
                        errors.businessEmail
                          ? 'border-red-600 focus:outline-red-600'
                          : 'border-[#123C34]/15 focus:border-[#075E50] focus:outline-[#075E50]'
                      }`}
                    />
                    {errors.businessEmail ? (
                      <p
                        id="error-email"
                        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.businessEmail}</span>
                      </p>
                    ) : null}
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      htmlFor="enquiry-country"
                      className="block text-sm font-medium text-[#123C34]"
                    >
                      Country <span className="text-[#075E50]">*</span>
                    </label>
                    <input
                      id="enquiry-country"
                      name="country"
                      type="text"
                      list="country-suggestions"
                      autoComplete="country-name"
                      required
                      value={formValues.country}
                      onChange={(e) => handleFieldChange('country', e.target.value)}
                      aria-invalid={Boolean(errors.country)}
                      aria-describedby={errors.country ? 'error-country' : undefined}
                      placeholder="Your country"
                      className={`mt-1.5 block w-full min-h-[44px] rounded-xl border bg-white px-4 py-2.5 text-sm text-[#123C34] placeholder:text-[#123C34]/40 focus:outline-2 focus:outline-offset-0 ${
                        errors.country
                          ? 'border-red-600 focus:outline-red-600'
                          : 'border-[#123C34]/15 focus:border-[#075E50] focus:outline-[#075E50]'
                      }`}
                    />
                    <datalist id="country-suggestions">
                      {INTERNATIONAL_COUNTRIES.map((countryName) => (
                        <option key={countryName} value={countryName} />
                      ))}
                    </datalist>
                    {errors.country ? (
                      <p
                        id="error-country"
                        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.country}</span>
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Enquiry Type */}
                <div>
                  <label
                    htmlFor="enquiry-type"
                    className="block text-sm font-medium text-[#123C34]"
                  >
                    Enquiry Type <span className="text-[#075E50]">*</span>
                  </label>
                  <select
                    id="enquiry-type"
                    name="enquiryType"
                    required
                    value={selectedEnquiryType}
                    onChange={(e) => onEnquiryTypeChange(e.target.value as EnquiryTypeOption)}
                    aria-invalid={Boolean(errors.enquiryType)}
                    aria-describedby={errors.enquiryType ? 'error-enquiry-type' : undefined}
                    className={`mt-1.5 block w-full min-h-[44px] rounded-xl border bg-white px-4 py-2.5 text-sm text-[#123C34] focus:outline-2 focus:outline-offset-0 ${
                      errors.enquiryType
                        ? 'border-red-600 focus:outline-red-600'
                        : 'border-[#123C34]/15 focus:border-[#075E50] focus:outline-[#075E50]'
                    }`}
                  >
                    {ENQUIRY_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.enquiryType ? (
                    <p
                      id="error-enquiry-type"
                      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{errors.enquiryType}</span>
                    </p>
                  ) : null}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="enquiry-message"
                    className="block text-sm font-medium text-[#123C34]"
                  >
                    Message <span className="text-[#075E50]">*</span>
                  </label>
                  <textarea
                    id="enquiry-message"
                    name="message"
                    rows={4}
                    required
                    value={formValues.message}
                    onChange={(e) => handleFieldChange('message', e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'error-message' : undefined}
                    placeholder="Share your product enquiry, distribution market, or commercial request."
                    className={`mt-1.5 block w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#123C34] placeholder:text-[#123C34]/40 focus:outline-2 focus:outline-offset-0 ${
                      errors.message
                        ? 'border-red-600 focus:outline-red-600'
                        : 'border-[#123C34]/15 focus:border-[#075E50] focus:outline-[#075E50]'
                    }`}
                  />
                  {errors.message ? (
                    <p
                      id="error-message"
                      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{errors.message}</span>
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#123C34]/60">
                    Fields marked with <span className="text-[#075E50]">*</span> are required.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#075E50] px-6 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(7,94,80,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#123C34] disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075E50]"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Enquiry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </RevealSection>
    </section>
  );
}
