import { create } from "zustand";

interface ModalState {
  modal: number;
  setModal: (modal: number) => void;
}

const useModalStore = create<ModalState>((set) => ({
  modal: 0,
  setModal: (modal: number) => set({ modal }),
}));

export default useModalStore;
