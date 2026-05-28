import React from 'react';
import { Icon } from '@shared/components/ui/Icon';

interface DeleteModalProps {
  goalTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ goalTitle, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-[400] bg-black/[0.62] flex items-center justify-center p-6"
    onClick={onCancel}
  >
    <div
      className="bg-c-surface2 rounded-[22px] p-7 pb-6 w-full max-w-[320px] shadow-modal"
      onClick={e => e.stopPropagation()}
    >
      <div className="w-[52px] h-[52px] rounded-2xl bg-danger-muted grid place-items-center mb-4">
        <Icon name="trash" size={24} color="#FF6B7A" stroke={1.8} />
      </div>
      <h3 className="text-xl font-bold text-c-text1 mb-2">Delete Goal?</h3>
      <p className="text-c-text2 text-base mb-7 leading-[1.55]">
        <strong className="text-c-text1">{goalTitle}</strong>{' '}
        and all its progress logs will be permanently removed.
      </p>
      <div className="flex gap-2.5">
        <button
          onClick={onCancel}
          className="flex-1 py-[13px] bg-c-surface border border-c-border rounded-xl text-c-text1 text-base font-semibold cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-[13px] bg-danger border-none rounded-xl text-white text-base font-bold cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);
