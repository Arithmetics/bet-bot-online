import { useTheme } from "@geist-ui/react";
import React from "react";

type StatProps = {
  top: React.ReactNode;
  middle: React.ReactNode;
  bottom: React.ReactNode;
  alert?: boolean;
};

export const Stat = ({ top, middle, bottom, alert }: StatProps) => {
  const { palette } = useTheme();
  return (
    <div
      style={{
        position: "relative",
        flex: "1 1 0%",
      }}
    >
      <dl
        style={{
          margin: 0,
        }}
      >
        <dt
          style={{
            fontWeight: 500,
            fontSize: "10px",
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          {top}
        </dt>
        <dd
          style={{
            fontWeight: 600,
            fontSize: "16px",
            margin: 0,
            color: alert ? palette.alert : "inherit",
          }}
        >
          {middle}
        </dd>
        <dd
          style={{
            fontSize: "10px",
            marginBottom: "6px",
            margin: 0,
          }}
        >
          {bottom}
        </dd>
      </dl>
    </div>
  );
};
