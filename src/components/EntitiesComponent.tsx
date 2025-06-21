// src/components/EntityItem.tsx

import React from "react";
import "./EntityItem.css";
import type { EntitiesComponentData } from "../types/index";
import EntityItem from "./EntityItem";

interface EntititesComponentProps {
  x: number;
  y: number;
  component: EntitiesComponentData;
  buildOnEntity: (x: number, y: number, entityId: string) => void;
}

const EntititesComponent: React.FC<EntititesComponentProps> = ({
  component,
  x,
  y,
  buildOnEntity,
}) => {
  return (
    <div style={{ marginBottom: "10px" }}>
      <span>
        <b>
          {component.title} ({component.entities.length}):
        </b>
      </span>
      <ul className="nested-entities">
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
};

export default EntititesComponent;
