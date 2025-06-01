// src/components/EntityItem.tsx

import React, { useEffect, useState } from "react";
import "./EntityItem.css";
import {
  Entity,
  isResourceComponentData,
  isEntitiesComponentData,
  isStructureSlotComponentData,
} from "../types";
import ResourceComponent from "./ResourceComponent";
import EntititesComponent from "./EntitiesComponent";
import { StructuresData } from "./Structure";
import StructureSlotComponent from "./StructureSlotComponent";

interface EntityItemProps {
  entity: Entity;
  x: number;
  y: number;
  buildOnEntity: (x: number, y: number, entityId: string) => void;
}

interface ResourceSlotUsage {
  energy: number;
  minerals: number;
  alloys: number;
  antimatter: number;
  research: number;
  authority: number;
}

const EntityItem: React.FC<EntityItemProps> = ({
  entity,
  x,
  y,
  buildOnEntity,
}) => {
  const [structuresData, setStructuresData] = useState<StructuresData | null>(
    null
  );
  const [currentFetchTimeout, setCurrentFetchTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [resourceSlotUsage, setResourceSlotUsage] = useState<ResourceSlotUsage>(
    {
      energy: 0,
      minerals: 0,
      alloys: 0,
      antimatter: 0,
      research: 0,
      authority: 0,
    }
  );
  const [structureTypes, setStructureTypes] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    function fetchData() {
      fetch(
        `http://localhost:8000/v1/entity/${entity.entity_id}/structures?x=${x}&y=${y}`,
        {
          credentials: "include",
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          return response.json();
        })
        .then((data) => {
          setStructuresData(data);

          const nextResourceSlotUsage = {
            energy: 0,
            minerals: 0,
            alloys: 0,
            antimatter: 0,
            research: 0,
            authority: 0,
          };
          setResourceSlotUsage(nextResourceSlotUsage);

          const nextStructureTypes: { [key: string]: number } = {};
          for (const structure of (data as StructuresData).built_structures) {
            if (!nextStructureTypes[structure.structure_type]) {
              nextStructureTypes[structure.structure_type] = 0;
            }
            nextStructureTypes[structure.structure_type] += 1;
            for (const component of structure.production_components) {
              if (component.type === "resource_production") {
                nextResourceSlotUsage[
                  component.resource_type as keyof ResourceSlotUsage
                ] += component.slot_usage;
              }
            }
          }
          setStructureTypes(nextStructureTypes);
        })
        .catch((error) => {});
    }

    if (currentFetchTimeout) {
      clearTimeout(currentFetchTimeout);
    }
    setCurrentFetchTimeout(
      setTimeout(() => {
        fetchData();
      }, 500)
    );
    return () => {
      if (currentFetchTimeout) {
        clearTimeout(currentFetchTimeout);
      }
    };
  }, [entity, x, y]);

  const renderComponents = (components: Entity["components"]) => {
    return (
      <ul>
        {components.map((component, i) => (
          <li key={component.title}>
            {isResourceComponentData(component) && component.value > 0 && (
              <ResourceComponent
                component={component}
                resourceSlotUsage={resourceSlotUsage}
              />
            )}
            {isEntitiesComponentData(component) &&
              component.entities &&
              component.entities.length > 0 && (
                <EntititesComponent
                  component={component}
                  x={x}
                  y={y}
                  buildOnEntity={buildOnEntity}
                />
              )}
            {isStructureSlotComponentData(component) && (
              <StructureSlotComponent
                component={component}
                structureTypes={structureTypes}
              />
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="entity-item">
      <p
        className="entity-title"
        style={{
          display: "inline-block",
        }}
      >
        {entity.title}
      </p>
      <p
        style={{
          display: "inline-block",
          marginLeft: "10px",
        }}
      >
        (ID: {entity.entity_id})
      </p>
      {structuresData &&
        (
          structuresData.structure_templates.length > 0 ||
          structuresData.structure_templates.length > 0
        ) && (
          <button
            onClick={() => buildOnEntity(x, y, entity.entity_id)}
            style={{
              display: "inline-block",
              float: "right",
              padding: "0.5rem",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            🛠
          </button>
        )}
      {entity.components &&
        entity.components.length > 0 &&
        renderComponents(entity.components)}
    </div>
  );
};

export default EntityItem;
