// src/components/EntitiesComponent.tsx

import React from "react";
import type { EntitiesComponentData } from "../types";
import EntityItem from "./EntityItem";

interface EntitiesComponentProps {
  x: number;
  y: number;
  component: EntitiesComponentData;
  buildOnEntity: (x: number, y: number, entityId: string) => void;
}

const EntitiesComponent: React.FC<EntitiesComponentProps> = ({
  component,
  x,
  y,
  buildOnEntity,
}) => (
  <div className="mb-2">
    <span className="font-bold">
      {component.title} ({component.entities.length}):
    </span>

    <ul className="ml-5 pl-2 border-l border-dashed border-gray-300">
      {component.entities.map((subEntity) => (
        <EntityItem
          key={subEntity.entity_id}
          entity={subEntity}
          x={x}
          y={y}
          buildOnEntity={buildOnEntity}
        />
      ))}
    </ul>
  </div>
);

export default EntitiesComponent;
