import { useState } from "react";

export interface Modal {
  isOpen: boolean;
  whyIsOpen: string | number;
  onClose: () => void;
}

export function useModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return { isModalOpen, openModal, closeModal };
}
