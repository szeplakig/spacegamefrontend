// src/components/EntityItem.tsx

import React from "react";
import "./EntityItem.css";
import { ResourceComponentData } from "../types/index";

interface ResourceComponentProps {
  component: ResourceComponentData;
}

const ResourceComponent: React.FC<ResourceComponentProps> = ({ component }) => {
  return (
    <span>
      <b>{component.title}: </b>
      {component.value}
    </span>
  );
};

export default ResourceComponent;
