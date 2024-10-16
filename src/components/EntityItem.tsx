// src/components/EntityItem.tsx

import React from "react";
import "./EntityItem.css";
import {
  Entity,
  isResourceComponentData,
  isEntitiesComponentData,
  isStructureComponentData,
} from "../types";
import ResourceComponent from "./ResourceComponent";
import EntititesComponent from "./EntitiesComponent";
import StructuresComponent from "./StructuresComponent";

interface EntityItemProps {
  entity: Entity;
}

const EntityItem: React.FC<EntityItemProps> = ({ entity }) => {
  const renderComponents = (components: Entity["components"]) => {
    return (
      <ul>
        {components.map((component, i) => (
          <li key={component.title}>
            {isResourceComponentData(component) && (
              <ResourceComponent component={component} />
            )}
            {isEntitiesComponentData(component) &&
              component.entities &&
              component.entities.length > 0 && (
                <EntititesComponent component={component} />
              )}
            {isStructureComponentData(component) &&
              component.structure_slots > 0 && (
                <StructuresComponent component={component} />
              )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="entity-item">
      <p className="entity-title">
        {entity.title} (ID: {entity.entity_id})
      </p>
      {entity.components &&
        entity.components.length > 0 &&
        renderComponents(entity.components)}
    </div>
  );
};

export default EntityItem;
