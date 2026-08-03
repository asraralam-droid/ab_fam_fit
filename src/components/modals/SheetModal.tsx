import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const sheetMotion = {
  initial: { y: 40, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 40, opacity: 0 }
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
  /** Wider sheet (e.g. admin program editor) */
  wide?: boolean;
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
  wide = false
}: SheetModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
          onClick={closeOnOverlay ? onClose : undefined}>
          <motion.div
            {...sheetMotion}
            onClick={(e) => e.stopPropagation()}
            className={`bg-surface w-full ${wide ? 'max-w-lg' : 'max-w-[420px]'} rounded-t-3xl max-h-[90vh] overflow-y-auto ${
              noPadding ? '' : 'p-5 pb-8'
            } ${panelClassName}`}>
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
}
