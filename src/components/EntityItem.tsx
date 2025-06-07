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
import { BuiltStructure, StructuresData } from "./Structure";
import StructureSlotComponent from "./StructureSlotComponent";

interface EntityItemProps {
  entity: Entity;
  x: number;
  y: number;
  buildOnEntity: (
    x: number,
    y: number,
    entityId: string,
  ) => void;
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
    [key: string]: BuiltStructure[];
  }>({});

  useEffect(() => {
    function set(responseData: StructuresData) {
      setStructuresData(responseData);

      const nextResourceSlotUsage = {
        energy: 0,
        minerals: 0,
        alloys: 0,
        antimatter: 0,
        research: 0,
        authority: 0,
      };
      setResourceSlotUsage(nextResourceSlotUsage);

      const nextStructureTypes: { [key: string]: BuiltStructure[] } = {};
      for (const structure of (responseData as StructuresData)
        .built_structures) {
        if (!nextStructureTypes[structure.structure_type]) {
          nextStructureTypes[structure.structure_type] = [];
        }
        nextStructureTypes[structure.structure_type].push(structure);
        for (const component of structure.production_components) {
          if (component.type === "resource_production") {
            nextResourceSlotUsage[
              component.resource_type as keyof ResourceSlotUsage
            ] += component.slot_usage;
          }
        }
      }
      setStructureTypes(nextStructureTypes);
    }

    async function fetchData() {
      if (!entity || !entity.entity_id) {
        return;
      }
      const previousStructuresData = localStorage.getItem(
        `structures_data_${entity.entity_id}`
      );
      if (previousStructuresData) {
        const cachedData: StructuresData = JSON.parse(previousStructuresData);
        set(cachedData);
      }
      const response = await fetch(
        `http://localhost:8000/v1/entity/${entity.entity_id}/structures?x=${x}&y=${y}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const responseData = await response.json();
      localStorage.setItem(
        `structures_data_${entity.entity_id}`,
        JSON.stringify(responseData)
      );
      set(responseData);
    }

    if (currentFetchTimeout) {
      clearTimeout(currentFetchTimeout);
    }
    fetchData();
    setCurrentFetchTimeout(
      setTimeout(() => {
        fetchData();
      }, Math.random() * 250 + 350)
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
          fontWeight: "bold",
          fontSize: "1.2rem",
          marginBottom: "10px",
        }}
      >
        {entity.title}
      </p>
      {structuresData &&
        (structuresData.structure_templates.length > 0 ||
          structuresData.built_structures.length > 0) && (
          <button
            onClick={() =>
              buildOnEntity(
                x,
                y,
                entity.entity_id,
              )
            }
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
