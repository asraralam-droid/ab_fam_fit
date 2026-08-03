import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const sheetMotion = {
  initial: { y: 40, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 40, opacity: 0 }
};

const centeredMotion = {
  initial: { scale: 0.96, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.96, opacity: 0 }
};

export type SheetModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  /** Replaces default title row when set */
  header?: React.ReactNode;
  children: React.ReactNode;
  closeOnOverlay?: boolean;
  /** Extra classes on the sheet panel */
  panelClassName?: string;
  /** Hide default padding on panel (e.g. flex column layouts) */
  noPadding?: boolean;
  /** Omit built-in header row */
  hideHeader?: boolean;
  /** Wider panel for desktop admin forms */
  wide?: boolean;
  /** Bottom sheet (mobile) vs centered dialog (desktop admin default) */
  variant?: 'sheet' | 'centered';
};

export function SheetModal({
  open,
  onClose,
  title,
  header,
  children,
  closeOnOverlay = true,
  panelClassName = '',
  noPadding = false,
  hideHeader = false,
  wide = false,
  variant = 'centered'
}: SheetModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isCentered = variant === 'centered';
  const maxWidth = wide ? 'max-w-2xl' : 'max-w-lg';

  const content = (
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 z-[100] bg-black/50 flex ${
            isCentered ? 'items-center justify-center p-4 sm:p-6' : 'items-end justify-center'
          }`}
          onClick={closeOnOverlay ? onClose : undefined}>
          <motion.div
            {...(isCentered ? centeredMotion : sheetMotion)}
            onClick={(e) => e.stopPropagation()}
            className={`bg-surface w-full ${maxWidth} overflow-y-auto ${
              isCentered ? 'rounded-2xl shadow-2xl max-h-[min(90vh,900px)]' : 'rounded-t-3xl max-h-[90vh]'
            } ${noPadding ? '' : 'p-5 pb-6 sm:p-6 sm:pb-8'} ${panelClassName}`}>
            {!hideHeader &&
              (header ??
                (title ? (
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-text">{title}</h3>
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 -mr-2 text-text-muted hover:text-text"
                      aria-label="Close">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : null))}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}
