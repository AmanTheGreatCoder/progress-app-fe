import React from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 overflow-hidden flex flex-col justify-end">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        className="relative bg-card rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[90dvh]"
        style={{
          animation: 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="p-4 pt-3 pb-2 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>

        <div className="px-4 pb-2 shrink-0 flex justify-between items-center">
          <h2 className="text-[20px] font-[700] tracking-[-0.4px]">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-muted-foreground active:opacity-70">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {children}
        </div>

        {footer && (
          <div className="p-6 bg-card border-t border-border pb-safe shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
