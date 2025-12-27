
export enum NodeType {
  FOLDER = 'FOLDER',
  PAGE = 'PAGE',
  TIMELINE = 'TIMELINE',
  CALENDAR = 'CALENDAR',
  GROUP = 'GROUP'
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Collaborator {
  id: string;
  initials: string;
  color: string; // Tailwind class e.g. 'bg-red-500'
  name: string;
}

export interface Space {
  id: string;
  name: string;
  isPublic: boolean;
  members: string[]; // Emails or names of people shared with
  description?: string;
  pictureUrl?: string;
  backgroundColor?: string; // Hex code or Tailwind class
}

export interface NodeData {
  id: string;
  spaceId: string; // Links node to a specific space
  type: NodeType;
  title: string;
  content?: string; // HTML or Markdown content
  parentId: string | null;
  position: Coordinates;
  width?: number;
  height?: number;
  collapsed?: boolean;
  collaborators?: Collaborator[];
  icon?: string; // Optional icon for the node (specifically Groups)
}

export interface AppState {
  nodes: NodeData[];
  selectedNodeId: string | null;
  canvasOffset: Coordinates;
}
