// src/components/EntityItem.tsx

import React from "react";
import "./EntityItem.css";
import type { ResourceComponentData } from "../types/index";
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
    <div style={{ marginBottom: "10px" }}>
      <b>{component.title}: </b>
      {
        resourceSlotUsage[component.resource_type as keyof ResourceSlotUsage]
      } / {component.value}
      <ul style={{ paddingLeft: "30px", listStyle: "initial" }}>
        {structures.map((structure) => (
          <li key={structure.structure_id}>{structure.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ResourceComponent;
