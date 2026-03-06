'use client';

import { useState } from 'react';

import { deleteCommandeAction } from '@/app/admin/commandes/actions';
import DeleteModal from '@/components/admin/DeleteModal';

type DeleteButtonProps = {
  commandeId: string;
  adresse: string;
};

export default function DeleteButton({ commandeId, adresse }: DeleteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async () => {
    const result = await deleteCommandeAction(commandeId);
    if (result.ok) {
      // Refresh or redirect
      window.location.reload();
    } else {
      alert(result.message);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-red-400 hover:underline text-xs"
      >
        Supprimer
      </button>
      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        commandeId={commandeId}
        adresse={adresse}
      />
    </>
  );
}
