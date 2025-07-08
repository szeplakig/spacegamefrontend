// Resources.tsx
import React, { useEffect, useState } from "react";
import Resource from "./Resource";
import type {
  ResourceDescriptor,
  ResourcesData,
} from "../store/resourcesStore";

import { useResourcesStore } from "../store/resourcesStore";
function calculateCurrentResourceValue(resource: ResourceDescriptor): number {
  if (!resource.updated_at) {
    return resource.amount;
  }

  const updated_at_date = new Date(resource.updated_at);
  const current_date = new Date();
  const hours_passed =
    (current_date.getTime() - updated_at_date.getTime()) / 1000 / 60 / 60;
  const current_amount = Math.round(
    resource.amount + resource.change * hours_passed
  );

  return Math.min(
    current_amount,
    resource.capacity !== null ? resource.capacity : Infinity
  );
}

const defaultResourcesData: ResourcesData = {
  energy: { amount: 0, change: 0, capacity: null, updated_at: null },
  minerals: { amount: 0, change: 0, capacity: null, updated_at: null },
  alloys: { amount: 0, change: 0, capacity: null, updated_at: null },
  antimatter: { amount: 0, change: 0, capacity: null, updated_at: null },
  research: { amount: 0, change: 0, capacity: null, updated_at: null },
  authority: { amount: 0, change: 0, capacity: null, updated_at: null },
};

const Resources: React.FC = () => {
  const resourcesState = useResourcesStore();
  const [displayData, setDisplayData] =
    useState<ResourcesData>(defaultResourcesData);

  useEffect(() => {
    if (resourcesState.resourcesData === null) {
      resourcesState.updateResources();
    }
  }, []);

  useEffect(() => {
    if (resourcesState.resourcesData === null) {
      return;
    }
    function recalc() {
      setDisplayData({
        ...resourcesState.resourcesData,
        energy: {
          ...resourcesState.resourcesData.energy,
          amount: calculateCurrentResourceValue(
            resourcesState.resourcesData.energy
          ),
        },
        minerals: {
          ...resourcesState.resourcesData.minerals,
          amount: calculateCurrentResourceValue(
            resourcesState.resourcesData.minerals
          ),
        },
        alloys: {
          ...resourcesState.resourcesData.alloys,
          amount: calculateCurrentResourceValue(
            resourcesState.resourcesData.alloys
          ),
        },
        antimatter: {
          ...resourcesState.resourcesData.antimatter,
          amount: calculateCurrentResourceValue(
            resourcesState.resourcesData.antimatter
          ),
        },
        research: {
          ...resourcesState.resourcesData.research,
          amount: calculateCurrentResourceValue(
            resourcesState.resourcesData.research
          ),
        },
        authority: {
          ...resourcesState.resourcesData.authority,
          amount: calculateCurrentResourceValue(
            resourcesState.resourcesData.authority
          ),
        },
      });
    }
    const interval = setInterval(() => {
      recalc();
    }, 1000);
    recalc();

    return () => clearInterval(interval);
  }, [resourcesState]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        padding: "0.5rem",
      }}
    >
      {Object.entries(displayData)
        .filter(([key]) => key !== "updated_at")
        .map(([key, value]) => (
          <Resource
            key={key}
            title={key}
            amount={value.amount}
            change={value.change}
            capacity={value.capacity}
            number_of_resources={
              Object.keys(displayData).filter((k) => k !== "updated_at").length
            }
          />
        ))}
    </div>
  );
};

export default Resources;
