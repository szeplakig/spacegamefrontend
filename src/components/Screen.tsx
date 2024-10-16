// src/components/Screen.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EntityItem from "./EntityItem";
import { ScreenData } from "../types";
import "./Screen.css";

const Screen: React.FC = () => {
  const [data, setData] = useState<ScreenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get current x and y from URL parameters, default to 0
  const x = parseInt(searchParams.get("x") || "0", 10);
  const y = parseInt(searchParams.get("y") || "0", 10);

  // Function to update coordinates and navigate
  const updateCoordinates = (newX: number, newY: number) => {
    navigate(`/?x=${newX}&y=${newY}`);
  };

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

    updateCoordinates(newX, newY);
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
    const fetchData = async () => {
      setLoading(true);
      try {
        // use cookies in fetch
        const response = await fetch(
          `http://localhost:8000/v1/systems?x=${x}&y=${y}`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          const data: { detail: string } = await response.json();
          console.error("HTTP error:", JSON.stringify(data));
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: ScreenData = await response.json();
        setData(data);
        setError(null);
      } catch (error: any) {
        setError(error.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [x, y]); // Re-fetch data when x or y changes

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="screen-container">
      <div className="coordinates-display">
        Current Coordinates: ({x}, {y})
      </div>
      <div className="content">
        {data && data.data.components && data.data.components.length > 0 && (
          <EntityItem entity={data.data} />
        )}
      </div>
    </div>
  );
};

export default Screen;
