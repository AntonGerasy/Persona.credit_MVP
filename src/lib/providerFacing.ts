const INTERNAL_QA_PATTERNS = [
  /synthetic\s+(qa\s+)?fixture/i,
  /synthetic specimen/i,
  /fabricated data/i,
  /qa[-\s]?only/i,
  /not for real[-\s]?world use/i,
  /prime thresholds?/i,
  /superior socio-economic resilience/i,
  /^\[\*\]$/,
];

export const isInternalQaConcern = (value: unknown): boolean => {
  const text = String(value ?? '').trim();
  return !!text && INTERNAL_QA_PATTERNS.some((pattern) => pattern.test(text));
};

export const providerFacingConcerns = (values: unknown): string[] => {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => String(value ?? '').replace(/^\s*\[\*\]\s*/, '').trim())
    .filter(Boolean)
    .filter((value) => !isInternalQaConcern(value));
};

export const normalizeProviderNarrative = (value: unknown): string => {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return text
    .replace(/financial stability and identity reliability are assessed at\s+\d+(?:\/100)?\.?/gi,
      'Financial stability and identity reliability are shown separately in the score breakdown.')
    .replace(/lenders? should/gi, 'A recipient may')
    .replace(/^\s*\[\*\]\s*/g, '')
    .trim();
};
