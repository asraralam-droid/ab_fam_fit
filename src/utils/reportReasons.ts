export type ReportReasonCode =
  | 'abusive'
  | 'harassment'
  | 'hate_speech'
  | 'spam'
  | 'inappropriate'
  | 'misinformation'
  | 'profanity'
  | 'other';

export const REPORT_REASON_OPTIONS: {
  value: ReportReasonCode;
  label: string;
}[] = [
  { value: 'abusive', label: 'Abusive or threatening behavior' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech or discrimination' },
  { value: 'spam', label: 'Spam or scam' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'misinformation', label: 'False or misleading information' },
  { value: 'profanity', label: 'Offensive language or slang' },
  { value: 'other', label: 'Other' }
];

export function getReportReasonLabel(code: ReportReasonCode) {
  return (
    REPORT_REASON_OPTIONS.find((o) => o.value === code)?.label ?? 'Other'
  );
}

export function buildReportReasonText(
  code: ReportReasonCode,
  description?: string
) {
  const label = getReportReasonLabel(code);
  if (code === 'other' && description?.trim()) {
    return `${label}: ${description.trim()}`;
  }
  return label;
}
