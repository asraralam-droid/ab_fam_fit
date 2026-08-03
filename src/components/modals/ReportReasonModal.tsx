import React, { useEffect, useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { CenteredModal } from './CenteredModal';
import {
  REPORT_REASON_OPTIONS,
  type ReportReasonCode
} from '../../utils/reportReasons';

export type ReportTarget =
  | {
      type: 'post';
      postId: string;
      authorName: string;
      preview?: string;
    }
  | {
      type: 'user';
      userId: string;
      userName: string;
    };

export type ReportReasonModalProps = {
  open: boolean;
  target: ReportTarget | null;
  onClose: () => void;
  onSubmit: (payload: {
    reasonCode: ReportReasonCode;
    description?: string;
  }) => void;
};

const inputClass =
  'w-full h-11 px-3 rounded-xl bg-surface-2 border border-border text-text focus:border-primary outline-none transition-all text-sm';
const labelClass = 'text-xs font-bold text-text-muted mb-1.5 block';

export function ReportReasonModal({
  open,
  target,
  onClose,
  onSubmit
}: ReportReasonModalProps) {
  const [reasonCode, setReasonCode] = useState<ReportReasonCode>('abusive');
  const [otherDetails, setOtherDetails] = useState('');

  useEffect(() => {
    if (open) {
      setReasonCode('abusive');
      setOtherDetails('');
    }
  }, [open, target]);

  if (!target) return null;

  const title =
    target.type === 'post' ? 'Report post' : 'Report user';
  const subtitle =
    target.type === 'post' ?
      `Why are you reporting this post by ${target.authorName}?` :
      `Why are you reporting ${target.userName}?`;

  const handleSubmit = () => {
    if (reasonCode === 'other' && !otherDetails.trim()) {
      return;
    }
    onSubmit({
      reasonCode,
      description: reasonCode === 'other' ? otherDetails.trim() : undefined
    });
  };

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      maxWidth="md"
      panelClassName="max-w-[420px]">
      
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center flex-shrink-0">
          <CircleAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text">{title}</h3>
          <p className="text-sm text-text-muted mt-1">{subtitle}</p>
        </div>
      </div>

      {target.type === 'post' && target.preview &&
      <p className="text-sm text-text-muted bg-surface-2 border border-border rounded-xl p-3 mb-4 line-clamp-3">
          "{target.preview}"
        </p>
      }

      <div className="mb-4">
        <label className={labelClass} htmlFor="report-reason">
          Reason
        </label>
        <select
          id="report-reason"
          value={reasonCode}
          onChange={(e) => setReasonCode(e.target.value as ReportReasonCode)}
          className={inputClass}>
          
          {REPORT_REASON_OPTIONS.map((opt) =>
          <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )}
        </select>
      </div>

      {reasonCode === 'other' &&
      <div className="mb-4">
          <label className={labelClass} htmlFor="report-other-details">
            Please describe the issue
          </label>
          <textarea
          id="report-other-details"
          value={otherDetails}
          onChange={(e) => setOtherDetails(e.target.value)}
          placeholder="Tell us why you are submitting this report..."
          rows={4}
          maxLength={500}
          className="w-full p-3 rounded-xl bg-surface-2 border border-border text-text focus:border-primary outline-none text-sm resize-none" />
        
          <p className="text-[10px] text-text-muted text-right mt-1">
            {otherDetails.length} / 500
          </p>
        </div>
      }

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-xl border border-border text-text font-bold text-sm hover:bg-surface-2 transition-colors">
          
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={reasonCode === 'other' && !otherDetails.trim()}
          className="flex-1 h-11 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          
          Submit report
        </button>
      </div>
    </CenteredModal>);

}
