import React, { useEffect, useState } from "react";
import type { Entity } from "../types";
import {
  isResourceComponentData,
  isEntitiesComponentData,
  isStructureSlotComponentData,
} from "../types";
import ResourceComponent from "./ResourceComponent";
import EntititesComponent from "./EntitiesComponent";
import type { BuiltStructure } from "./Structure";
import StructureSlotComponent from "./StructureSlotComponent";
import useStructureStore from "../store/structureStore";

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
  const strucutresStore = useStructureStore();
  const structures = useStructureStore((state) =>
    state.getStructures(x, y, entity.entity_id)
  );
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
    strucutresStore.loadStructures(x, y, entity.entity_id);
  }, [entity, x, y]);

  useEffect(() => {
    if (!structures) {
      return;
    }

    const nextResourceSlotUsage = {
      energy: 0,
      minerals: 0,
      alloys: 0,
      antimatter: 0,
      research: 0,
      authority: 0,
    } as ResourceSlotUsage;

    const nextStructureTypes: { [key: string]: BuiltStructure[] } = {};
    for (const structure of structures.built_structures) {
      let placed = false;
      for (const component of structure.production_components) {
        if (component.type === "resource_production") {
          nextResourceSlotUsage[
            component.resource_type as keyof ResourceSlotUsage
          ] += component.slot_usage;
          if (!nextStructureTypes[component.resource_type]) {
            nextStructureTypes[component.resource_type] = [];
          }
          if (component.slot_usage > 0) {
            nextStructureTypes[component.resource_type].push(structure);
            placed = true;
          }
        }
      }
      if (!placed) {
        if (!nextStructureTypes[structure.structure_type]) {
          nextStructureTypes[structure.structure_type] = [];
        }
        nextStructureTypes[structure.structure_type].push(structure);
      }
    }
    setResourceSlotUsage(nextResourceSlotUsage);
    setStructureTypes(nextStructureTypes);
  }, [structures, strucutresStore]);

  const renderComponents = (components: Entity["components"]) => (
    <ul className="ml-5 pl-2 border-l border-dashed border-gray-300">
      {components.map((component) => (
        <li key={component.title} className="mb-1">
          {isResourceComponentData(component) && component.value > 0 && (
            <ResourceComponent
              component={component}
              resourceSlotUsage={resourceSlotUsage}
              structureTypes={structureTypes}
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

  const hasStructuresLoaded = Boolean(
    strucutresStore.getStructures(x, y, entity.entity_id)
  );

  return (
    <div className="border border-gray-300 mb-2 p-2 rounded w-full max-w-[80vw]">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xl font-bold text-gray-800">{entity.title}</p>
        {hasStructuresLoaded && (
          <button
            onClick={() => buildOnEntity(x, y, entity.entity_id)}
            className={`p-2 text-center font-bold text-2xl cursor-pointer hover:bg-gray-200 rounded ${
              strucutresStore.getStructures(x, y, entity.entity_id)
                .built_structures.length > 0 ||
              strucutresStore.getStructures(x, y, entity.entity_id)
                .structure_templates.length > 0
                ? ""
                : "opacity-50"
            }`}
          >
            🛠
          </button>
        )}
      </div>
      {entity.components &&
        entity.components.length > 0 &&
        renderComponents(entity.components)}
    </div>
  );
};

export default EntityItem;
