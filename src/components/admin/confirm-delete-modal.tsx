"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  open: boolean;
  itemLabel: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteModal({ open, itemLabel, onClose, onConfirm }: ConfirmDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete record" size="sm">
      <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-700">
        <Trash2 className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">
          This will permanently remove <span className="font-semibold">{itemLabel}</span>. This action
          cannot be undone.
        </p>
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" fullWidth onClick={onClose}>Cancel</Button>
        <Button variant="danger" fullWidth loading={loading} onClick={handleConfirm}>Delete</Button>
      </div>
    </Modal>
  );
}