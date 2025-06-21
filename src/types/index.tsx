// src/types/index.d.ts

// Define an Entity that contains components
export interface Entity {
  title: string;
  entity_id: string;
  entity_slot_categories: string[];
  components: ComponentData[];
}

// ResourceComponentData for resources like minerals, energy, etc.
export type ResourceComponentData = {
  type: "resource"; // Literal type "resource"
  title: string;
  value: number;
  resource_type: string;
};

// StructureComponentData for structures (like buildings or facilities)
export type StructureSlotComponentData = {
  type: "structure_slot"; // Literal type "structures"
  title: string;
  structure_slots: number;
  allowed_structure_types: string[];
};

// EntitiesComponentData for nested entities
export type EntitiesComponentData = {
  type: "entities"; // Literal type "entities"
  title: string;
  entities: Entity[];
};

export type FeaturesComponentData = {
  type: "features"; // Literal type "features"
  title: string;
  components: ComponentData[];
};

// ComponentData is a union type of all component data types
export type ComponentData =
  | ResourceComponentData
  | StructureSlotComponentData
  | EntitiesComponentData
  | FeaturesComponentData;

// ScreenData holds data about the screen (like Solar System)
export interface ScreenData {
  data: {
    title: string;
    entity_id: string;
    entity_slot_categories: string[];
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

export function isStructureSlotComponentData(
  component: ComponentData
): component is StructureSlotComponentData {
  return component.type === "structure_slot";
}
