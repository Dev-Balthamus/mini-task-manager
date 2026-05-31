import { useState } from "react";
import { useTasksJSON } from "./useTasksJSON";

export interface Modal {
  isOpen: boolean;
  whyIsOpen: string | number;
  onClose: () => void;
}

export function useModal() {
  const { onReloadTasks } = useTasksJSON();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    onReloadTasks();
  };

  return { isModalOpen, openModal, closeModal };
}
