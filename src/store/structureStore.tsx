import { BuiltStructure, StructureTemplate } from "../components/Structure";
import { create } from "zustand";

interface StructureState {
  builtStructures: { [structureId: string]: BuiltStructure };
  structureTemplates: { [structure_type: string]: StructureTemplate };
  
}

const useStructureStore = create<StructureState>((set) => ({
  builtStructures: {},
  structureTemplates: {},
}));

export default useStructureStore;
