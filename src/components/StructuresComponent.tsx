// src/components/EntityItem.tsx

import React from "react";
import "./EntityItem.css";
import {  StructuresComponentData } from '../types/index';
import EntityItem from "./EntityItem";

interface StructuresComponentProps {
  component: StructuresComponentData;
}

const StructuresComponent: React.FC<StructuresComponentProps> = ({
  component,
}) => {
  return (
    <div>
        <span>
            <b>{component.title}</b> slots: {component.structure_slots}
        </span>
    </div>
  );
};

export default StructuresComponent;
