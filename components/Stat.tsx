import { useTheme } from "@geist-ui/react";
import { GeistUIThemesPalette } from "@geist-ui/react/dist/themes/presets";
import React from "react";

type StatProps = {
  top: React.ReactNode;
  middle: React.ReactNode;
  bottom: React.ReactNode;
  // alert?: boolean;
  color?: keyof GeistUIThemesPalette;
};

export const Stat = ({ top, middle, bottom, color }: StatProps) => {
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
            color: color ? palette[color] : "inherit",
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
