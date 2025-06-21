export interface ResourceRequirementComponent {
  type: "resource_requirement";
  title: string;
  value: number;
}

export interface ResearchRequirementComponent {
  type: "research_requirement";
  title: string;
}

export type StructureRequirementComponent =
  | ResourceRequirementComponent
  | ResearchRequirementComponent;

export interface ResourceProductionComponent {
  type: "resource_production";
  category: string;
  title: string;
  resource_type: string;
  slot_usage: number;
  value: number;
  scaling_factor: number;
}

export type StructureProductionComponent = ResourceProductionComponent;

export interface StructureTemplate {
  structure_type: string;
  title: string;
  description: string;
  production_components: StructureProductionComponent[];
  requirement_components: StructureRequirementComponent[];
}

export interface BuiltStructure extends StructureTemplate {
  structure_id: string;
  level: number;
}

export interface StructuresData {
  built_structures: BuiltStructure[];
  structure_templates: StructureTemplate[];
  other_templates: { [key: string]: string };
}
