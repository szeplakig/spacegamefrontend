import { useEffect, useState, useRef } from "react";
import { Stage, Layer, Circle, Group } from "react-konva";

const SolarSystem = ({ data }: { data: any }) => {
  const [time, setTime] = useState(Date.now());
  const requestRef = useRef<number | null>(null);

  // Animation loop
  const animate = () => {
    setTime(Date.now());
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth * 0.5,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth * 0.5,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window?.removeEventListener("resize", handleResize);
  }, []);

  // Center of the canvas
  const centerX = canvasSize.width / 2;
  const centerY = canvasSize.height / 2;

  // Extract entities
  const primaryEntities = findEntitiesByTitle(
    data.components,
    "Primary Entities"
  );
  const secondaryEntities = findEntitiesByTitle(
    data.components,
    "Secondary Entities"
  );

  const maxMoonRadius =
    Math.max(
      ...secondaryEntities.map(
        (planet) =>
          (findEntitiesByTitle(planet.components, "Moons").length + 1) * 15 + 5
      )
    ) * 2.25;
  const maxRadius =
    Math.max(...secondaryEntities.map((planet, index) => 150 + index * 50)) *
      2.25 +
    maxMoonRadius;
  const minDimension = Math.min(canvasSize.width, canvasSize.height);

  const stage = (
    <Stage
      width={canvasSize.width}
      height={canvasSize.height}
      scale={{
        x: minDimension / maxRadius,
        y: minDimension / maxRadius,
      }}
      offset={{
        x: centerX - maxRadius / 2,
        y: centerY - maxRadius / 2,
      }}
    >
      <Layer>
        {/* Render stars */}
        <Circle x={centerX} y={centerY} radius={10} fill="black" />
        <Circle x={centerX} y={centerY} radius={maxRadius} stroke="black" />
        {primaryEntities.map((star, index) => (
          <Star
            key={star.entity_id}
            data={star}
            centerX={centerX}
            centerY={centerY}
            index={index}
            totalStars={primaryEntities.length}
            time={time}
          />
        ))}

        {/* Render planets orbiting the solar system center */}
        {secondaryEntities.map((planet, index) => (
          <Planet
            key={planet.entity_id}
            data={planet}
            centerX={centerX}
            centerY={centerY}
            orbitRadius={150 + index * 50} // Adjust as needed
            index={index}
            count={secondaryEntities.length}
            time={time}
          />
        ))}
      </Layer>
    </Stage>
  );
  // calculate max radius of the solar system and zoom out if needed

  return stage;
};

interface StarData {
  entity_id: string;
  title: string;
}

const Star = ({
  data,
  centerX,
  centerY,
  index,
  totalStars,
  time,
}: {
  data: StarData;
  centerX: number;
  centerY: number;
  index: number;
  totalStars: number;
  time: number;
}) => {
  const radius = 20; // Adjust as needed
  const color = "yellow";

  // Position multiple stars around the center or at the center if only one star
  const angle =
    totalStars > 1 ? (index * (360 / totalStars) * Math.PI) / 180 : 0;
  const distanceFromCenter = totalStars > 1 ? 50 : 0; // Adjust as needed
  const x = centerX + distanceFromCenter * Math.cos(angle + time / 1000);
  const y = centerY + distanceFromCenter * Math.sin(angle + time / 1000);

  return (
    <Group>
      {/* Star */}
      <Circle
        x={x}
        y={y}
        radius={radius}
        fill={color}
        stroke={"black"}
        strokeWidth={radius / 10}
      />
      {/* add a few perlin noise patterns in the color so it looks better */}

      {/* Star label */}
      {/* <Text x={x - radius} y={y - radius - 15} text={data.title} fill="black" /> */}
    </Group>
  );
};

const Planet = ({
  data,
  centerX,
  centerY,
  orbitRadius,
  index,
  count,
  time,
}: {
  data: {
    entity_id: string;
    title: string;
    orbitalPeriod?: number;
    components: any[];
  };
  centerX: number;
  centerY: number;
  orbitRadius: number;
  index: number;
  count: number;
  time: number;
}) => {
  // Orbital period in milliseconds (e.g., 60 seconds)
  let orbitalPeriod = data.orbitalPeriod || 60000; // Default to 60 seconds if not provided
  orbitalPeriod *= (index + 1) / Math.PI;
  const angle =
    ((time / orbitalPeriod + index / count) * 2 * Math.PI) % (2 * Math.PI);

  const x = centerX + orbitRadius * Math.cos(angle);
  const y = centerY + orbitRadius * Math.sin(angle);
  const radius = 10; // Adjust as needed
  const color = "blue";

  // Find moons
  const moonsComponent = data.components.find(
    (comp: { type: string; title: string }) =>
      comp.type === "entities" && comp.title === "Moons"
  );
  const moons = moonsComponent ? moonsComponent.entities : [];

  return (
    <Group>
      {/* Orbit path */}
      <Circle
        x={centerX}
        y={centerY}
        radius={orbitRadius}
        stroke="grey"
        dash={[4, 4]}
      />
      {/* Planet */}
      <Circle
        x={x}
        y={y}
        radius={radius}
        fill={color}
        stroke={"black"}
        strokeWidth={radius / 10}
      />

      {/* Moons */}
      {moons.map((moon: MoonData, idx: number) => (
        <Moon
          key={moon.entity_id}
          data={moon}
          centerX={x}
          centerY={y}
          orbitRadius={(idx + 1) * 15 + 5}
          index={idx}
          count={moons.length}
          time={time}
        />
      ))}
    </Group>
  );
};

interface MoonData {
  entity_id: string;
  title: string;
  orbitalPeriod?: number;
  components: any[];
}

const Moon = ({
  data,
  centerX,
  centerY,
  orbitRadius,
  index,
  count,
  time,
}: {
  data: MoonData;
  centerX: number;
  centerY: number;
  orbitRadius: number;
  index: number;
  count: number;
  time: number;
}) => {
  // Orbital period in milliseconds (e.g., 10 seconds)
  let orbitalPeriod = data.orbitalPeriod || 10000; // Default to 10 seconds if not provided
  orbitalPeriod *= (index + 1) / Math.PI;
  const angle =
    ((time / orbitalPeriod + index / count) * 2 * Math.PI) % (2 * Math.PI);

  const x = centerX + orbitRadius * Math.cos(angle);
  const y = centerY + orbitRadius * Math.sin(angle);
  const radius = 5; // Adjust as needed
  const color = "grey";

  return (
    <Group>
      {/* Orbit path */}
      <Circle
        x={centerX}
        y={centerY}
        radius={orbitRadius}
        stroke="lightgrey"
        dash={[2, 2]}
      />
      {/* Moon */}
      <Circle
        x={x}
        y={y}
        radius={radius}
        fill={color}
        stroke={"black"}
        strokeWidth={radius / 10}
      />
      {/* Moon label */}
      {/* <Text x={x - radius} y={y - radius - 5} text={data.title} fill="black" /> */}
    </Group>
  );
};

// Helper function to find entities by title
const findEntitiesByTitle = (components: any[], title: string) => {
  return components
    .filter((comp) => comp.title === title)
    .flatMap((comp) => comp.entities || []);
};

export { SolarSystem, Star, Planet, Moon, findEntitiesByTitle };
