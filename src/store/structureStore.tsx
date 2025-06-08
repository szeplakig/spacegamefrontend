import {
  StructuresData,
} from "../components/Structure";
import { create } from "zustand";

interface StructureState {
  structures: {
    [x: number]: { [y: number]: { [entityId: string]: StructuresData } };
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
      self.structures[x] !== undefined &&
      self.structures[x][y] !== undefined &&
      self.structures[x][y][entityId] !== undefined
    ) {
      return self.structures[x][y][entityId];
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
        if (self.structures[x] === undefined) {
          self.structures[x] = {};
        }
        if (self.structures[x][y] === undefined) {
          self.structures[x][y] = {};
        }
        self.structures[x][y][entityId] = value;
        set({ structures: self.structures });
      });
  },
}));

export default useStructureStore;
