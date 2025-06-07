import { Entity } from "index";
import { create } from "zustand";

interface EntityState {
  entity: Entity | null;
  loadEntity: (x: number, y: number) => void;
}

const useEntityStore = create<EntityState>((set) => ({
  entity: null,
  loadEntity: (x: number, y: number) => {
    fetch(`http://localhost:8000/v1/systems?x=${x}&y=${y}`, {
      credentials: "include",
    })
      .then((response) => {
        return response.json();
      })
      .then((entity) =>
        set({
          entity,
        })
      );
  },
}));

export default useEntityStore;
