import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'আপনি কি নিশ্চিত?',
  description = 'এই তথ্যটি স্থায়ীভাবে মুছে যাবে। আপনি কি এগিয়ে যেতে চান?',
  confirmText = 'হ্যাঁ, মুছে ফেলুন',
  cancelText = 'বাতিল',
  variant = 'danger',
  isLoading = false
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      icon={AlertTriangle}
      maxWidth="sm"
    >
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant={variant}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
