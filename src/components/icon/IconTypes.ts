import Icons from "./icons.json";

export type IconName = keyof typeof Icons;

export type IconProps = {
  size: number | { width: number; height: number };
  color: string;
  name: IconName;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export type IconType = {
  viewbox: string;
  fill: string;
  paths: Array<{
    d: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: string;
    strokeLinecap?: "butt" | "round" | "square" | "inherit";
    strokeLinejoin?: "round" | "inherit" | "miter" | "bevel";
    cx?: string;
    cy?: string;
    r?: string;
    color?: string;
    x?: string;
    y?: string;
    width?: string;
    height?: string;
    content?: Array<{
      d: string;
      fill?: string;
      stroke?: string;
      strokeWidth?: string;
      strokeLinecap?: "butt" | "round" | "square" | "inherit";
      strokeLinejoin?: "round" | "inherit" | "miter" | "bevel";
      cx?: string;
      cy?: string;
      r?: string;
      color?: string;
      x?: string;
      y?: string;
      width?: string;
      height?: string;
    }>;
  }>;
};
