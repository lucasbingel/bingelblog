// types/react-window.d.ts
declare module "react-window" {
  import * as React from "react";

  export interface ListChildComponentProps {
    index: number;
    style: React.CSSProperties;
  }

  export interface FixedSizeListProps {
    height: number;
    width: number | string;
    itemCount: number;
    itemSize: number;
    className?: string;
    children: React.ComponentType<ListChildComponentProps>;
  }

  export class FixedSizeList extends React.Component<FixedSizeListProps> {}

  export interface VariableSizeListProps {
    height: number;
    width: number | string;
    itemCount: number;
    className?: string;
    itemSize: (index: number) => number;
    children: React.ComponentType<ListChildComponentProps>;
  }

  export class VariableSizeList extends React.Component<VariableSizeListProps> {}
}
