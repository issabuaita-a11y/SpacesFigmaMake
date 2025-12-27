
import { NodeData, NodeType, Space } from '../types';

export const SPACES: Space[] = [
  { 
    id: 'space-1', 
    name: 'Product Engineering', 
    isPublic: false, 
    members: ['alice@company.com', 'mike@company.com'],
    description: 'Main engineering roadmap and specs.',
    backgroundColor: '#f8fafc' // Slate
  },
  { 
    id: 'space-2', 
    name: 'Marketing Campaign', 
    isPublic: true, 
    members: ['sarah@marketing.com'],
    description: 'Q1 public facing assets and strategy.',
    backgroundColor: '#fffbf0' // Cream
  },
  { 
    id: 'space-3', 
    name: 'Personal Life', 
    isPublic: false, 
    members: [],
    description: 'My private journal and goals.',
    backgroundColor: '#f0fdf4' // Mint
  },
];

const USERS = [
  { id: 'u1', initials: 'JD', color: 'bg-indigo-500', name: 'John Doe' },
  { id: 'u2', initials: 'AS', color: 'bg-pink-500', name: 'Alice Smith' },
  { id: 'u3', initials: 'MK', color: 'bg-emerald-500', name: 'Mike Kerr' },
  { id: 'u4', initials: 'LZ', color: 'bg-orange-500', name: 'Lisa Zhang' },
];

export const INITIAL_NODES: NodeData[] = [
  // --- SPACE 1: Product Engineering ---
  {
    id: 'folder-1',
    spaceId: 'space-1',
    type: NodeType.FOLDER,
    title: 'Product Roadmap',
    parentId: null,
    position: { x: 120, y: 120 },
    width: 280,
    height: 160,
    collapsed: true,
    collaborators: [USERS[0], USERS[1], USERS[2]]
  },
  {
    id: 'page-1',
    spaceId: 'space-1',
    type: NodeType.PAGE,
    title: 'Q4 Features Spec',
    content: '<h1>Q4 Features</h1><p>We need to focus on the <strong>spatial canvas</strong> performance.</p>',
    parentId: 'folder-1',
    position: { x: 80, y: 320 },
    width: 240,
    height: 120
  },
  {
    id: 'timeline-1',
    spaceId: 'space-1',
    type: NodeType.TIMELINE,
    title: 'Launch Schedule',
    content: 'Timeline view placeholder...',
    parentId: 'folder-1',
    position: { x: 360, y: 320 },
    width: 240,
    height: 160
  },
  
  // --- SPACE 2: Marketing ---
  {
    id: 'folder-2',
    spaceId: 'space-2',
    type: NodeType.FOLDER,
    title: 'Q1 Campaigns',
    parentId: null,
    position: { x: 400, y: 160 },
    width: 240,
    height: 160,
    collapsed: true,
    collaborators: [USERS[1], USERS[3]]
  },
  {
    id: 'page-2',
    spaceId: 'space-2',
    type: NodeType.PAGE,
    title: 'Brand Guidelines',
    content: '<h1>Brand Guidelines</h1>',
    parentId: 'folder-2',
    position: { x: 400, y: 360 },
    width: 240
  },

  // --- SPACE 3: Personal ---
  {
    id: 'folder-3',
    spaceId: 'space-3',
    type: NodeType.FOLDER,
    title: 'Journal & Goals',
    parentId: null,
    position: { x: 600, y: 200 },
    width: 240,
    height: 200,
    collapsed: true,
    collaborators: [USERS[0]]
  },
];
