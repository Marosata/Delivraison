'use client';

import { useState } from 'react';

type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  commandeId: string;
  adresse: string;
};

export default function DeleteModal({ isOpen, onClose, onConfirm, commandeId, adresse }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050505] p-6 text-zinc-100">
        <h3 className="text-lg font-semibold">Confirmer suppression</h3>
        <p className="mt-2 text-sm text-zinc-300">
          Êtes-vous sûr de vouloir supprimer la commande à <strong>{adresse}</strong> ?
          Cette action est irréversible.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-white/10"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
