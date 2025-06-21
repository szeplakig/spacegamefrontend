import React, { useEffect } from "react";
import EntityItem from "./EntityItem";
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
        event.preventDefault();
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
    <div className="flex flex-col h-screen">
      <div className="text-center p-2 text-lg font-bold bg-gray-100 border-b border-gray-300">
        Current Coordinates: ({x}, {y})
      </div>
      <div className="flex flex-1 w-screen">
        <div className="flex flex-1 justify-center items-start p-5 bg-gray-100">
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
