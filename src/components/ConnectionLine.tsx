import React from 'react';
import { Coordinates } from '../types';

interface ConnectionLineProps {
  start: Coordinates;
  end: Coordinates;
  isCollapsed: boolean;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({ start, end, isCollapsed }) => {
  const midY = (start.y + end.y) / 2;
  
  const startX = start.x;
  const startY = start.y;
  const endX = end.x;
  const endY = end.y;

  const path = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

  return (
    <path
      d={path}
      fill="none"
      stroke="#cbd5e1"
      strokeWidth="2"
      strokeDasharray={isCollapsed ? "6 4" : "none"}
      vectorEffect="non-scaling-stroke"
      className="pointer-events-none transition-all duration-300"
      style={{ opacity: 0.4 }}
    />
  );
};
