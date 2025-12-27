import React, { useRef, useState, useEffect } from 'react';
import { Coordinates, NodeData, NodeType } from '../types';
import { NodeCard } from './NodeCard';
import { ConnectionLine } from './ConnectionLine';
import { Plus, Minus, Maximize, Search, FolderPlus, X, MousePointer2, Hand, Group } from 'lucide-react';

interface CanvasProps {
  nodes: NodeData[];
  activeSpaceId: string;
  selectedNodeIds: string[];
  onNodeSelect: (id: string, multi: boolean) => void;
  onMultiSelect: (ids: string[]) => void;
  onNodeMove: (id: string, newPos: Coordinates) => void;
  onReparentNode: (nodeId: string, parentId: string | null) => void;
  onNodeResize: (id: string, width: number, height: number) => void;
  onNodeCollapse: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onDeleteNode: (id: string) => void;
  onBackgroundClick: () => void;
  onAddProject: (position: Coordinates) => void;
  onRenameNode: (id: string) => void;
  renamingNodeId: string | null;
  onCommitRename: (id: string, newTitle: string) => void;
  onNodeIconChange: (id: string, icon: string) => void;
  backgroundColor: string;
  onColorChange: (color: string) => void;
  onCreateGroup: () => void;
}

const CANVAS_COLORS = [
  { id: 'white', value: '#ffffff', label: 'White' },
  { id: 'slate', value: '#f8fafc', label: 'Slate' },
  { id: 'cream', value: '#fffbf0', label: 'Cream' },
  { id: 'mint', value: '#f0fdf4', label: 'Mint' },
  { id: 'sky', value: '#f0f9ff', label: 'Sky' },
  { id: 'rose', value: '#fff1f2', label: 'Rose' },
  { id: 'lavender', value: '#f5f3ff', label: 'Lavender' },
];

const GRID_SIZE = 40;

// Minimum dimensions for different node types
const MIN_DIMENSIONS = {
  [NodeType.FOLDER]: { width: 200, height: 160 },
  [NodeType.GROUP]: { width: 180, height: 120 },
  [NodeType.PAGE]: { width: 200, height: 120 },
  [NodeType.TIMELINE]: { width: 200, height: 120 },
  [NodeType.CALENDAR]: { width: 200, height: 120 },
};

export const Canvas: React.FC<CanvasProps> = ({ 
  nodes, 
  activeSpaceId,
  selectedNodeIds,
  onNodeSelect,
  onMultiSelect,
  onNodeMove,
  onReparentNode,
  onNodeResize,
  onNodeCollapse,
  onAddChild,
  onDeleteNode,
  onBackgroundClick,
  onAddProject,
  onRenameNode,
  renamingNodeId,
  onCommitRename,
  onNodeIconChange,
  backgroundColor,
  onColorChange,
  onCreateGroup
}) => {
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState<Coordinates>({ x: 0, y: 0 });
  const [interactionMode, setInteractionMode] = useState<'select' | 'pan'>('pan');
  const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
  const lastMousePos = useRef<Coordinates>({ x: 0, y: 0 });
  const dragStartData = useRef<{ nodeId: string, startNodePos: Coordinates, startMousePos: Coordinates } | null>(null);
  const resizeStartData = useRef<{ nodeId: string, startWidth: number, startHeight: number, startMousePos: Coordinates } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const zoomRef = useRef(zoom);
  const panOffsetRef = useRef(panOffset);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    zoomRef.current = zoom;
    panOffsetRef.current = panOffset;
  }, [zoom, panOffset]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const getContentBounds = () => {
    if (nodes.length === 0) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(node => {
        const w = node.width || 240;
        const h = node.height || 160;
        minX = Math.min(minX, node.position.x);
        maxX = Math.max(maxX, node.position.x + w);
        minY = Math.min(minY, node.position.y);
        maxY = Math.max(maxY, node.position.y + h);
    });
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  };

  const fitToScreen = () => {
     if (!containerRef.current) return;
     const bounds = getContentBounds();
     const { width: viewportW, height: viewportH } = containerRef.current.getBoundingClientRect();
     if (!bounds) {
         setZoom(1);
         setPanOffset({ x: viewportW/2, y: viewportH/2 });
         return;
     }
     const PADDING = 100;
     const availableW = Math.max(100, viewportW - PADDING * 2);
     const availableH = Math.max(100, viewportH - PADDING * 2);
     let newZoom = Math.min(availableW / bounds.width, availableH / bounds.height);
     newZoom = Math.min(newZoom, 1.0);
     newZoom = Math.max(newZoom, 0.2);
     const newPanX = (viewportW / 2) - (bounds.cx * newZoom);
     const newPanY = (viewportH / 2) - (bounds.cy * newZoom);
     setZoom(newZoom);
     setPanOffset({ x: newPanX, y: newPanY });
  };

  useEffect(() => {
    const timer = setTimeout(() => { fitToScreen(); }, 10);
    return () => clearTimeout(timer);
  }, [activeSpaceId]);

  const clampOffset = (newX: number, newY: number, currentZoom: number): Coordinates => {
    if (!containerRef.current) return { x: newX, y: newY };
    const viewport = containerRef.current.getBoundingClientRect();
    const bounds = getContentBounds();
    if (!bounds) {
        const cx = viewport.width / 2;
        const cy = viewport.height / 2;
        const limit = 2000;
        return { x: Math.max(cx - limit, Math.min(cx + limit, newX)), y: Math.max(cy - limit, Math.min(cy + limit, newY)) };
    }
    const margin = 200;
    const minScreenCX = -margin;
    const maxScreenCX = viewport.width + margin;
    const minScreenCY = -margin;
    const maxScreenCY = viewport.height + margin;
    const proposedScreenCX = bounds.cx * currentZoom + newX;
    const proposedScreenCY = bounds.cy * currentZoom + newY;
    let safeScreenCX = proposedScreenCX;
    let safeScreenCY = proposedScreenCY;
    if (proposedScreenCX < minScreenCX) safeScreenCX = minScreenCX;
    if (proposedScreenCX > maxScreenCX) safeScreenCX = maxScreenCX;
    if (proposedScreenCY < minScreenCY) safeScreenCY = minScreenCY;
    if (proposedScreenCY > maxScreenCY) safeScreenCY = maxScreenCY;
    return { x: safeScreenCX - (bounds.cx * currentZoom), y: safeScreenCY - (bounds.cy * currentZoom) };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const ZOOM_SPEED = 0.006;
        const MIN_ZOOM = 0.1;
        const MAX_ZOOM = 1.5;
        const currentZoom = zoomRef.current;
        const currentPan = panOffsetRef.current;
        const zoomFactor = Math.exp(-e.deltaY * ZOOM_SPEED);
        const newZoom = Math.min(Math.max(currentZoom * zoomFactor, MIN_ZOOM), MAX_ZOOM);
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldX = (mouseX - currentPan.x) / currentZoom;
        const worldY = (mouseY - currentPan.y) / currentZoom;
        let newPanX = mouseX - worldX * newZoom;
        let newPanY = mouseY - worldY * newZoom;
        const clamped = clampOffset(newPanX, newPanY, newZoom);
        setZoom(newZoom);
        setPanOffset(clamped);
      } else {
        const currentPan = panOffsetRef.current;
        const newPanX = currentPan.x - e.deltaX;
        const newPanY = currentPan.y - e.deltaY;
        const clamped = clampOffset(newPanX, newPanY, zoomRef.current);
        setPanOffset(clamped);
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [nodes]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button === 0) {
      if (interactionMode === 'pan') {
         if (!draggedNodeId && !resizingNodeId) {
             setIsPanning(true);
             lastMousePos.current = { x: e.clientX, y: e.clientY };
         }
      } else {
         if (!draggedNodeId && !resizingNodeId) {
             const rect = containerRef.current?.getBoundingClientRect();
             if (rect) {
                const x = (e.clientX - rect.left - panOffset.x) / zoom;
                const y = (e.clientY - rect.top - panOffset.y) / zoom;
                setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
             }
         }
      }
    }
  };

  const handleNodeDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (interactionMode === 'select') return;
    const node = nodes.find(n => n.id === id);
    if (node) {
        setDraggedNodeId(id);
        dragStartData.current = {
            nodeId: id,
            startNodePos: { ...node.position },
            startMousePos: { x: e.clientX, y: e.clientY }
        };
    }
  };

  const handleNodeResizeStart = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      const node = nodes.find(n => n.id === id);
      if (node) {
          setResizingNodeId(id);
          resizeStartData.current = {
              nodeId: id,
              startWidth: node.width || 240,
              startHeight: node.height || 160,
              startMousePos: { x: e.clientX, y: e.clientY }
          };
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (resizingNodeId && resizeStartData.current) {
        const { nodeId, startWidth, startHeight, startMousePos } = resizeStartData.current;
        const node = nodes.find(n => n.id === nodeId);
        
        // Get minimum dimensions for this node type
        const minDims = node ? (MIN_DIMENSIONS[node.type] || { width: 200, height: 120 }) : { width: 200, height: 120 };
        
        const dx = (e.clientX - startMousePos.x) / zoom;
        const dy = (e.clientY - startMousePos.y) / zoom;
        
        // Apply minimum dimensions
        const rawW = Math.max(minDims.width, startWidth + dx);
        const rawH = Math.max(minDims.height, startHeight + dy);
        
        const snappedW = Math.round(rawW / GRID_SIZE) * GRID_SIZE;
        const snappedH = Math.round(rawH / GRID_SIZE) * GRID_SIZE;
        
        onNodeResize(nodeId, snappedW, snappedH);
    } else if (dragStartData.current && interactionMode === 'pan') {
        const { nodeId, startNodePos, startMousePos } = dragStartData.current;
        const dx = (e.clientX - startMousePos.x) / zoom;
        const dy = (e.clientY - startMousePos.y) / zoom;
        const rawX = startNodePos.x + dx;
        const rawY = startNodePos.y + dy;
        const snappedX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;
        onNodeMove(nodeId, { x: snappedX, y: snappedY });
    } else if (selectionBox) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            const x = (e.clientX - rect.left - panOffset.x) / zoom;
            const y = (e.clientY - rect.top - panOffset.y) / zoom;
            setSelectionBox(prev => prev ? ({ ...prev, currentX: x, currentY: y }) : null);
        }
    } else if (isPanning) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      const newPanX = panOffset.x + deltaX;
      const newPanY = panOffset.y + deltaY;
      const clamped = clampOffset(newPanX, newPanY, zoom);
      setPanOffset(clamped);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    if (draggedNodeId && dragStartData.current) {
        const draggedNode = nodes.find(n => n.id === draggedNodeId);
        if (draggedNode && draggedNode.type !== NodeType.GROUP) {
            const nW = draggedNode.width || 240;
            const nH = draggedNode.height || 160;
            const centerX = draggedNode.position.x + nW / 2;
            const centerY = draggedNode.position.y + nH / 2;
            const groups = nodes.filter(n => n.type === NodeType.GROUP && n.id !== draggedNodeId);
            let targetGroupId: string | null = null;
            for (const group of groups) {
                const gX = group.position.x;
                const gY = group.position.y;
                const gW = group.width || 240;
                const gH = group.height || 160;
                if (centerX >= gX && centerX <= gX + gW && centerY >= gY && centerY <= gY + gH) {
                    targetGroupId = group.id;
                    break;
                }
            }
            if (targetGroupId) {
                if (draggedNode.parentId !== targetGroupId) {
                    onReparentNode(draggedNode.id, targetGroupId);
                }
            } else {
                if (draggedNode.parentId) {
                    onReparentNode(draggedNode.id, null);
                }
            }
        }
    }

    if (selectionBox) {
        const x1 = Math.min(selectionBox.startX, selectionBox.currentX);
        const x2 = Math.max(selectionBox.startX, selectionBox.currentX);
        const y1 = Math.min(selectionBox.startY, selectionBox.currentY);
        const y2 = Math.max(selectionBox.startY, selectionBox.currentY);
        const newSelectedIds: string[] = [];
        nodes.forEach(node => {
            const nX = node.position.x;
            const nY = node.position.y;
            const nW = node.width || 240;
            const nH = node.height || 160;
            if (nX < x2 && nX + nW > x1 && nY < y2 && nY + nH > y1) {
                newSelectedIds.push(node.id);
            }
        });
        if (Math.abs(x2 - x1) > 5 || Math.abs(y2 - y1) > 5) {
             onMultiSelect(newSelectedIds);
        } else {
             onMultiSelect([]);
        }
        setSelectionBox(null);
    }
    setIsPanning(false);
    setDraggedNodeId(null);
    setResizingNodeId(null);
    dragStartData.current = null;
    resizeStartData.current = null;
  };

  const renderConnections = () => {
    return nodes.map(node => {
      if (!node.parentId) return null;
      const parent = nodes.find(n => n.id === node.parentId);
      if (!parent || parent.type === NodeType.GROUP) return null;
      if (parent.collapsed) return null;
      const pW = parent.width || 240;
      const pH = parent.height || 160;
      const nW = node.width || 240;
      const start = { x: parent.position.x + pW / 2, y: parent.position.y + pH };
      const end = { x: node.position.x + nW / 2, y: node.position.y };
      return (
        <ConnectionLine key={`conn-${parent.id}-${node.id}`} start={start} end={end} isCollapsed={false} />
      );
    });
  };

  const groupNodes = nodes.filter(n => n.type === NodeType.GROUP);
  const contentNodes = nodes.filter(n => n.type !== NodeType.GROUP);
  const sortedRenderNodes = [...groupNodes, ...contentNodes];

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full overflow-hidden relative transition-colors duration-500 ${interactionMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
      style={{ backgroundColor }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          willChange: 'transform'
        }}
      >
        <div className="absolute" style={{ left: 0, top: 0 }}>
            <div 
                className={`absolute pointer-events-none transition-all duration-300`}
                style={{ 
                    left: -5000, top: -5000, width: 10000, height: 10000,
                    backgroundImage: `linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    opacity: (draggedNodeId || resizingNodeId) ? 0.25 : 0.08
                }} 
            />

            <svg className="absolute top-[-5000px] left-[-5000px] w-[10000px] h-[10000px] overflow-visible pointer-events-none z-0">
               <g transform="translate(5000, 5000)">
                 {renderConnections()}
               </g>
            </svg>

            {selectionBox && (
                <div 
                    className="absolute bg-blue-500/10 border-2 border-blue-500/50 pointer-events-none z-50 rounded-lg"
                    style={{
                        left: Math.min(selectionBox.startX, selectionBox.currentX),
                        top: Math.min(selectionBox.startY, selectionBox.currentY),
                        width: Math.abs(selectionBox.currentX - selectionBox.startX),
                        height: Math.abs(selectionBox.currentY - selectionBox.startY)
                    }}
                />
            )}

            <div className="">
                {sortedRenderNodes.map(node => {
                  if (node.parentId) {
                      const parent = nodes.find(n => n.id === node.parentId);
                      if (parent && parent.type !== NodeType.GROUP && parent.collapsed) return null;
                  }
                  return (
                      <NodeCard
                        key={node.id}
                        node={node}
                        isSelected={selectedNodeIds.includes(node.id)}
                        onSelect={onNodeSelect}
                        onDragStart={handleNodeDragStart}
                        onResizeStart={handleNodeResizeStart}
                        onToggleCollapse={onNodeCollapse}
                        onAddChild={onAddChild}
                        onDelete={onDeleteNode}
                        onRename={onRenameNode}
                        isRenaming={renamingNodeId === node.id}
                        onCommitRename={onCommitRename}
                        onIconChange={onNodeIconChange}
                      />
                  );
                })}
            </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between pointer-events-none z-50">
        <div className="bg-slate-900/95 backdrop-blur-xl text-white p-1.5 rounded-2xl shadow-2xl flex items-center gap-1 pointer-events-auto border border-white/10">
            <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))} className="w-8 h-8 flex items-center justify-center hover:bg-white/15 rounded-xl transition-all duration-200"><Minus className="w-4 h-4" /></button>
            <span className="text-xs font-mono w-10 text-center select-none opacity-90">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))} className="w-8 h-8 flex items-center justify-center hover:bg-white/15 rounded-xl transition-all duration-200"><Plus className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <button onClick={fitToScreen} className="w-8 h-8 flex items-center justify-center hover:bg-white/15 rounded-xl transition-all duration-200 text-slate-300 hover:text-white" title="Fit Content">
                <Maximize className="w-4 h-4" />
            </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-2 transition-all duration-300">
            <div className={`flex items-center gap-1 bg-slate-100 p-1 rounded-xl ${isSearchOpen ? 'hidden sm:flex' : 'flex'}`}>
               <button 
                  onClick={() => setInteractionMode('select')} 
                  className={`p-2.5 rounded-lg transition-all duration-200 ${interactionMode === 'select' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                  title="Select (Box)"
               >
                  <MousePointer2 className="w-4 h-4" />
               </button>
               <button 
                  onClick={() => setInteractionMode('pan')} 
                  className={`p-2.5 rounded-lg transition-all duration-200 ${interactionMode === 'pan' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                  title="Pan & Drag"
               >
                  <Hand className="w-4 h-4" />
               </button>
            </div>

            <div className={`w-px h-7 bg-slate-200 mx-1 ${isSearchOpen ? 'hidden sm:block' : 'block'}`}></div>

            <div className={`flex items-center transition-all duration-300 ease-out ${isSearchOpen ? 'w-64' : 'w-9'}`}>
                {!isSearchOpen ? (
                    <button onClick={() => setIsSearchOpen(true)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200">
                        <Search className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="flex items-center w-full px-2">
                        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                        <input ref={searchInputRef} className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400 h-9" placeholder="Search..." onBlur={(e) => !e.target.value && setIsSearchOpen(false)} onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)} />
                        <button onClick={() => setIsSearchOpen(false)} className="ml-1 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"><X className="w-3.5 h-3.5" /></button>
                    </div>
                )}
            </div>

            {selectedNodeIds.length >= 2 && !isSearchOpen && (
                <>
                    <div className="w-px h-7 bg-slate-200 mx-1"></div>
                    <button 
                        onClick={onCreateGroup}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200 font-medium text-xs shadow-sm hover:shadow-md animate-in fade-in zoom-in-95"
                    >
                        <Group className="w-4 h-4" /> Group
                    </button>
                </>
            )}

            <div className="w-px h-7 bg-slate-200 mx-1"></div>

            <button 
              onClick={() => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const centerX = -panOffset.x + (rect.width/2);
                    const centerY = -panOffset.y + (rect.height/2);
                    const rawX = centerX / zoom;
                    const rawY = centerY / zoom;
                    const snappedX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
                    const snappedY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;
                    onAddProject({ x: snappedX, y: snappedY });
                }
              }}
              className="bg-slate-900 text-white rounded-xl hover:bg-slate-800 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 px-4 py-2.5"
            >
                <FolderPlus className="w-4 h-4" />
                {!isSearchOpen && <span className="text-xs">New Project</span>}
            </button>
        </div>

        <div className="pointer-events-auto relative">
            <button onClick={() => setShowColorPicker(!showColorPicker)} className="w-14 h-14 bg-white/95 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 transition-all duration-200">
               <div className="w-7 h-7 rounded-full ring-2 ring-white shadow-md" style={{ backgroundColor }} />
            </button>
            {showColorPicker && (
                <div className="absolute bottom-full right-0 mb-4 bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 flex flex-col gap-3 animate-in slide-in-from-bottom-4 fade-in zoom-in-95 duration-200 min-w-max">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Canvas Color</span>
                    <div className="grid grid-cols-4 gap-2.5">
                        {CANVAS_COLORS.map(color => (
                            <button 
                              key={color.id} 
                              onClick={() => { onColorChange(color.value); setShowColorPicker(false); }} 
                              className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 ${backgroundColor === color.value ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 border-blue-400' : 'border-slate-200 hover:scale-105 hover:border-slate-300'}`} 
                              style={{ backgroundColor: color.value }} 
                              title={color.label} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};