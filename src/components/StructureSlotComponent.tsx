// src/components/StructureSlotComponent.tsx

import React from "react";
import type { StructureSlotComponentData } from "../types/index";
import type { BuiltStructure } from "./Structure";

interface StructureSlotComponentProps {
  component: StructureSlotComponentData;
  structureTypes: { [key: string]: BuiltStructure[] };
}

const StructureSlotComponent: React.FC<StructureSlotComponentProps> = ({
  component,
  structureTypes,
}) => {
  const structures = [];
  for (const [type, _structures] of Object.entries(structureTypes)) {
    if (component.allowed_structure_types.indexOf(type) !== -1) {
      structures.push(..._structures);
    }
  }

  return (
    <div style={{ marginBottom: "10px" }}>
      <span>
        <b>{component.title}:</b>
        <span
          style={{
            marginLeft: "5px",
          }}
        >
          ({structures.length} / {component.structure_slots})
        </span>
        <ul style={{ paddingLeft: "30px", listStyle: "initial" }}>
          {structures.map((structure) => (
            <li key={structure.structure_id}>{structure.title}</li>
          ))}
        </ul>
      </span>
    </div>
  );
};

export default StructureSlotComponent;
