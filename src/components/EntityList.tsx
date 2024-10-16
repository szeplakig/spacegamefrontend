// src/components/EntityList.tsx

import React from 'react';
import EntityItem from './EntityItem';
import { Entity } from '../types';
import './EntityList.css'; // Import component styles

interface EntityListProps {
  entities: Entity[];
  title: string;
}

const EntityList: React.FC<EntityListProps> = ({ entities, title }) => (
  <div className="entity-list">
    <h2>{title}</h2>
    {entities.map((entity) => (
      <EntityItem key={entity.entity_id} entity={entity} />
    ))}
  </div>
);

export default EntityList;
