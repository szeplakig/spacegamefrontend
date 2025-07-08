// src/components/ResourceComponent.tsx

import React from "react";
import type { ResourceComponentData } from "../types";
import type { BuiltStructure } from "./Structure";

interface ResourceSlotUsage {
  energy: number;
  minerals: number;
  alloys: number;
  antimatter: number;
  research: number;
  authority: number;
}

interface ResourceComponentProps {
  component: ResourceComponentData;
  resourceSlotUsage: ResourceSlotUsage;
  structureTypes: { [key: string]: BuiltStructure[] };
}

const ResourceComponent: React.FC<ResourceComponentProps> = ({
  component,
  resourceSlotUsage,
  structureTypes,
}) => {
  const structures = structureTypes[component.resource_type] ?? [];

  return (
    <div className="mb-2">
      <b>{component.title}: </b>
      {resourceSlotUsage[component.resource_type as keyof ResourceSlotUsage]} /{" "}
      {component.value}
      <ul className="ml-7 list-disc">
        {structures.map((structure) => (
          <li key={structure.structure_id}>{structure.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ResourceComponent;
