import type { Entity } from "../types/index";
import { create } from "zustand";

interface EntityState {
  entity: Entity | null;
  loadEntity: (x: number, y: number) => void;
}

const useEntityStore = create<EntityState>((set) => ({
  entity: null,
  loadEntity: (x: number, y: number) => {
    set({ entity: null });
    fetch(`http://localhost:8000/v1/systems?x=${x}&y=${y}`, {
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .then((value) =>
        set({
          entity: value.data,
        })
      );
  },
}));

export default useEntityStore;
