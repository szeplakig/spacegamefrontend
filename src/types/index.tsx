// src/types/index.d.ts

// Define an Entity that contains components
export interface Entity {
  category: string;
  title: string;
  entity_id: string;
  components: ComponentData[];
}

// ResourceComponentData for resources like minerals, energy, etc.
export type ResourceComponentData = {
  type: "resource";  // Literal type "resource"
  category: string;
  title: string;
  value: number;
};

// StructureComponentData for structures (like buildings or facilities)
export type StructuresComponentData = {
  type: "structures";  // Literal type "structures"
  category: string;
  title: string;
  structure_type: string;
  structure_slots: number;
};

// EntitiesComponentData for nested entities
export type EntitiesComponentData = {
  type: "entities";  // Literal type "entities"
  category: string;
  title: string;
  entities: Entity[];
};

// ComponentData is a union type of all component data types
export type ComponentData =
  | ResourceComponentData
  | StructuresComponentData
  | EntitiesComponentData;

// ScreenData holds data about the screen (like Solar System)
export interface ScreenData {
  data: {
    category: string;
    title: string;
    entity_id: string;
    components: ComponentData[];
  };
}

// Type guards to check specific component types

// Check if the component is ResourceComponentData
export function isResourceComponentData(
  component: ComponentData
): component is ResourceComponentData {
  return component.type === "resource";
}

// Check if the component is EntitiesComponentData
export function isEntitiesComponentData(
  component: ComponentData
): component is EntitiesComponentData {
  return component.type === "entities";
}

// Check if the component is StructureComponentData
export function isStructureComponentData(
  component: ComponentData
): component is StructuresComponentData {
  return component.type === "structures";
}
