import React from "react";

type StatProps = {
  top: React.ReactNode;
  middle: React.ReactNode;
  bottom: React.ReactNode;
};

export const Stat = ({ top, middle, bottom }: StatProps) => (
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
