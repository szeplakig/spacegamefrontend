import { create } from "zustand";

interface BuildState {
  x: number | null;
  y: number | null;
  entityId: string | null;
  setBuildModal: (x: number, y: number, entityId: string) => void;
  isSet: () => boolean;
}

const useBuildStore = create<BuildState>((set, get) => ({
  x: null,
  y: null,
  entityId: null,
  setBuildModal: (x: number, y: number, entityId: string) =>
    set({ x, y, entityId }),
  isSet: () => {
    const { x, y, entityId } = get();
    return x !== undefined && y !== undefined && entityId !== undefined;
  },
}));

export default useBuildStore;
