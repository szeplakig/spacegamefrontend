// src/components/EntityItem.tsx

import React from "react";
import "./EntityItem.css";
import { EntitiesComponentData } from "../types/index";
import EntityItem from "./EntityItem";

interface EntititesComponentProps {
  component: EntitiesComponentData;
}

const EntititesComponent: React.FC<EntititesComponentProps> = ({
  component,
}) => {
  return (
    <div>
      <span>
        <b>{component.title}:</b>
      </span>
      <ul className="nested-entities">
        {component.entities.map((subEntity) => (
          <EntityItem key={subEntity.entity_id} entity={subEntity} />
        ))}
      </ul>
    </div>
  );
};

export default EntititesComponent;
