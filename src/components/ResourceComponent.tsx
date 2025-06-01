// src/components/EntityItem.tsx

import React from "react";
import "./EntityItem.css";
import { ResourceComponentData } from "../types/index";

interface ResourceSlotUsage {
  energy: number;
  minerals: number;
  alloys: number;
  antimatter: number;
  research: number;
  authority: number;
}

interface ResourceComponentProps {
  component: ResourceComponentData;
  resourceSlotUsage: ResourceSlotUsage;
}

const ResourceComponent: React.FC<ResourceComponentProps> = ({
  component,
  resourceSlotUsage,
}) => {
  return (
    <span>
      <b>{component.title}: </b>
      {
        resourceSlotUsage[component.resource_type as keyof ResourceSlotUsage]
      } / {component.value}
    </span>
  );
};

export default ResourceComponent;
