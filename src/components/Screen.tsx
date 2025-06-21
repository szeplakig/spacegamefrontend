// src/components/Screen.tsx

import React, { useEffect } from "react";
import EntityItem from "./EntityItem";
import "./Screen.css";
import useEntityStore from "../store/entityStore";

interface ScreenProps {
  isLoggedIn: boolean;
  buildOnEntity: (x: number, y: number, entityId: string) => void;
}

const Screen: React.FC<ScreenProps> = ({ isLoggedIn, buildOnEntity }) => {
  const entityStore = useEntityStore();
  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);

  // Handle keydown events for navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    let newX = x;
    let newY = y;

    switch (event.key) {
      case "ArrowUp":
        newY += 1;
        event.preventDefault(); // Prevent default scrolling behavior
        break;
      case "ArrowDown":
        newY -= 1;
        event.preventDefault();
        break;
      case "ArrowLeft":
        newX -= 1;
        event.preventDefault();
        break;
      case "ArrowRight":
        newX += 1;
        event.preventDefault();
        break;
      default:
        return; // Do nothing for other keys
    }

    // Update coordinates
    setX(newX);
    setY(newY);
  };

  useEffect(() => {
    // Add event listener on component mount
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [x, y]); // Re-register the event listener when x or y changes

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    entityStore.loadEntity(x, y);
  }, [x, y, isLoggedIn]);

  return (
    <div className="screen-container">
      <div className="coordinates-display">
        Current Coordinates: ({x}, {y})
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100vw",
          height: "100vh",
        }}
      >
        <div
          className="content"
          style={{
            padding: "20px",
            backgroundColor: "#f0f0f0",
          }}
        >
          {entityStore.entity &&
            entityStore.entity.components &&
            entityStore.entity.components.length > 0 && (
              <EntityItem
                entity={entityStore.entity}
                x={x}
                y={y}
                buildOnEntity={buildOnEntity}
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default Screen;
