import type { StructuresData } from "../components/Structure";
import { create } from "zustand";

interface StructureState {
  structures: {
    [entityId: string]: { [x: number]: { [y: number]: StructuresData } };
  };
  getStructures: (
    x: number | null,
    y: number | null,
    entityId: string | null
  ) => StructuresData | null;
  loadStructures: (
    x: number | null,
    y: number | null,
    entityId: string | null
  ) => void;
  reloadEntityStructures: (entityId: string | null) => void;
}

const useStructureStore = create<StructureState>((set, get) => ({
  structures: {},
  getStructures: (
    x: number | null,
    y: number | null,
    entityId: string | null
  ): StructuresData | null => {
    if (x === null || y === null || entityId === null) throw Error();
    const self = get();
    if (
      self.structures[entityId] !== undefined &&
      self.structures[entityId][x] !== undefined &&
      self.structures[entityId][x][y] !== undefined
    ) {
      return self.structures[entityId][x][y];
    }
    return null;
  },
  loadStructures: (
    x: number | null,
    y: number | null,
    entityId: string | null
  ) => {
    if (x === null || y === null || entityId === null) throw Error();
    const self = get();
    fetch(
      `http://localhost:8000/v1/entity/${entityId}/structures?x=${x}&y=${y}`,
      {
        credentials: "include",
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((value: StructuresData) => {
        if (self.structures[entityId] === undefined) {
          self.structures[entityId] = {};
        }
        if (self.structures[entityId][x] === undefined) {
          self.structures[entityId][x] = {};
        }
        self.structures[entityId][x][y] = value;
        set({ structures: self.structures });
      });
  },
  reloadEntityStructures: (entityId: string | null) => {
    if (entityId === null) throw Error();
    const self = get();
    Object.keys(self.structures[entityId]).forEach((xStr) => {
      const x = parseInt(xStr, 10);
      const yCoords = self.structures[entityId][x];
      if (yCoords) {
        Object.keys(yCoords).forEach((yStr) => {
          const y = parseInt(yStr, 10);
          self.loadStructures(x, y, entityId);
        });
      }
    });
  },
}));

export default useStructureStore;
