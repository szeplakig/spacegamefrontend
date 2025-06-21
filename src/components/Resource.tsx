import React from "react";
import { Tooltip } from "react-tooltip";
import { formatNumber } from "../utils/numberFormatter";

interface ResourceData {
  title: string;
  amount: number;
  change: number;
  capacity: number | null;
  number_of_resources: number;
}

const Resource: React.FC<ResourceData> = ({
  title,
  amount,
  change,
  capacity,
  number_of_resources,
}) => {
  const formattedAmount = formatNumber(amount);
  const formattedCapacity = capacity !== null ? formatNumber(capacity) : "∞";
  const formattedChange =
    change > 0
      ? `+${formatNumber(change)}`
      : change === 0
      ? "-"
      : formatNumber(change);

  const tooltipId = `tooltip-${title}`;

  return (
    <>
      <div
        data-tooltip-id={tooltipId}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: `calc(75% / ${number_of_resources})`,
          padding: "0.5rem",
          borderRadius: "8px",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
          cursor: "default",
        }}
      >
        <div style={{ fontWeight: "bold" }}>
          {title
            .split("_")
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(" ")}
        </div>
        <hr style={{ width: "100%" }} />
        <div>
          {formattedAmount} ({formattedChange}) / {formattedCapacity}
        </div>
      </div>
      <Tooltip id={tooltipId} place="top">
        <div>
          <strong>Amount:</strong> {amount}
        </div>
        <div>
          <strong>Capacity:</strong> {capacity !== null ? capacity : "∞"}
        </div>
        <div>
          <strong>Change:</strong> {change} / hr
        </div>
      </Tooltip>
    </>
  );
};

export default Resource;
