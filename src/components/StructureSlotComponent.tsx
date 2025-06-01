// src/components/StructureSlotComponent.tsx

import React from "react";
import { StructureSlotComponentData } from "../types/index";

interface StructureSlotComponentProps {
  component: StructureSlotComponentData;
  structureTypes: { [key: string]: number };
}

const StructureSlotComponent: React.FC<StructureSlotComponentProps> = ({
  component,
  structureTypes,
}) => {
  const matchingStructureTypes = Object.keys(structureTypes).filter(
    (type) => component.allowed_structure_types.indexOf(type) !== -1
  );
  const structureCount = matchingStructureTypes.reduce(
    (acc, type) => acc + structureTypes[type],
    0
  );
  return (
    <div>
      <span>
        <b>{component.title}:</b>
        <span
          style={{
            marginLeft: "5px",
          }}
        >
          ({structureCount} / {component.structure_slots})
        </span>
      </span>
    </div>
  );
};

export default StructureSlotComponent;
