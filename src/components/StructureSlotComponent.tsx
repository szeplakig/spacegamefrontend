// src/components/StructureSlotComponent.tsx

import React from "react";
import type { StructureSlotComponentData } from "../types";
import type { BuiltStructure } from "./Structure";

interface StructureSlotComponentProps {
  component: StructureSlotComponentData;
  structureTypes: { [key: string]: BuiltStructure[] };
}

const StructureSlotComponent: React.FC<StructureSlotComponentProps> = ({
  component,
  structureTypes,
}) => {
  const structures: BuiltStructure[] = [];

  for (const [type, _structures] of Object.entries(structureTypes)) {
    if (component.allowed_structure_types.includes(type)) {
      structures.push(..._structures);
    }
  }

  return (
    <div className="mb-2">
      <b>{component.title}:</b>
      <span className="ml-1">
        ({structures.length} / {component.structure_slots})
      </span>

      <ul className="ml-7 list-disc">
        {structures.map((structure) => (
          <li key={structure.structure_id}>{structure.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default StructureSlotComponent;
