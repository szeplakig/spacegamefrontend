// Resources.tsx
import React, { useEffect, useState } from "react";
import Resource from "./Resource";
import Emitter from "../utils/emitter";
import { EventType } from "../types";

interface ResourceDescriptor {
  amount: number;
  change: number;
  capacity: number | null;
  updated_at: string | null;
}

interface ResourcesData {
  energy: ResourceDescriptor;
  minerals: ResourceDescriptor;
  alloys: ResourceDescriptor;
  antimatter: ResourceDescriptor;
  research: ResourceDescriptor;
  authority: ResourceDescriptor;
}

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

  return Math.min(current_amount, resource.capacity || Infinity);
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
  const [data, setData] = useState<ResourcesData>(defaultResourcesData);
  const [displayData, setDisplayData] =
    useState<ResourcesData>(defaultResourcesData);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/v1/resources`, {
        credentials: "include",
      });
      if (!response.ok) {
        const data: { detail: string } = await response.json();
        console.error("HTTP error:", JSON.stringify(data));
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: ResourcesData = await response.json();
      setData(data);
      setError(null);
    } catch (error: any) {
      setError(error.message || "Unknown error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    async function handler(payload: {
      x: number;
      y: number;
      entityId: string;
    }) {
      await fetchData();
    }

    Emitter.on(EventType.STRUCTURE_BUILT, handler);
    return () => {
      Emitter.off(EventType.STRUCTURE_BUILT, handler);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayData({
        ...data,
        energy: {
          ...data.energy,
          amount: calculateCurrentResourceValue(data.energy),
        },
        minerals: {
          ...data.minerals,
          amount: calculateCurrentResourceValue(data.minerals),
        },
        alloys: {
          ...data.alloys,
          amount: calculateCurrentResourceValue(data.alloys),
        },
        antimatter: {
          ...data.antimatter,
          amount: calculateCurrentResourceValue(data.antimatter),
        },
        research: {
          ...data.research,
          amount: calculateCurrentResourceValue(data.research),
        },
        authority: {
          ...data.authority,
          amount: calculateCurrentResourceValue(data.authority),
        },
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  if (error) {
    return <div>Error: {error}</div>;
  }

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
            number_of_resources={Object.keys(displayData).length}
          />
        ))}
    </div>
  );
};

export default Resources;
