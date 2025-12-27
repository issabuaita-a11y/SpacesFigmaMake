import React, { useState, useEffect } from "react";
import {
  INITIAL_NODES,
  SPACES as INITIAL_SPACES,
} from "./services/mockData";
import {
  NodeData,
  NodeType,
  Coordinates,
  Space,
} from "./types";
import { Canvas } from "./components/Canvas";
import { Editor } from "./components/Editor";
import { HomeView } from "./components/HomeView";
import { SpaceModal } from "./components/SpaceModal";
import { Home, Plus, Bell } from "lucide-react";

const getSaturatedColor = (pastelColor?: string) => {
  switch (pastelColor) {
    case "#f8fafc":
      return "#475569";
    case "#fffbf0":
      return "#d97706";
    case "#f0fdf4":
      return "#059669";
    case "#f0f9ff":
      return "#0284c7";
    case "#fff1f2":
      return "#e11d48";
    case "#f5f3ff":
      return "#7c3aed";
    case "#ffffff":
    default:
      return "#475569";
  }
};

export default function App() {
  const [nodes, setNodes] = useState<NodeData[]>(() => {
    const saved = localStorage.getItem("spatial-nodes");
    return saved ? JSON.parse(saved) : INITIAL_NODES;
  });

  const [spaces, setSpaces] = useState<Space[]>(() => {
    const saved = localStorage.getItem("spatial-spaces");
    return saved ? JSON.parse(saved) : INITIAL_SPACES;
  });

  const [activeNodeId, setActiveNodeId] = useState<
    string | null
  >(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<
    string[]
  >([]);
  const [renamingNodeId, setRenamingNodeId] = useState<
    string | null
  >(null);

  const [activeSpaceId, setActiveSpaceId] = useState<string>(
    () => {
      const saved = localStorage.getItem(
        "spatial-active-space",
      );
      return saved && spaces.some((s) => s.id === saved)
        ? saved
        : spaces[0]?.id || "space-1";
    },
  );

  const [viewMode, setViewMode] = useState<"home" | "canvas">(
    "home",
  );
  const [isSpaceModalOpen, setIsSpaceModalOpen] =
    useState(false);

  useEffect(() => {
    localStorage.setItem(
      "spatial-nodes",
      JSON.stringify(nodes),
    );
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem(
      "spatial-spaces",
      JSON.stringify(spaces),
    );
  }, [spaces]);

  useEffect(() => {
    localStorage.setItem("spatial-active-space", activeSpaceId);
  }, [activeSpaceId]);

  const visibleNodes = nodes.filter(
    (n) => n.spaceId === activeSpaceId,
  );
  const currentSpace = spaces.find(
    (s) => s.id === activeSpaceId,
  );
  const recentNodes = nodes.slice(0, 5);

  const switchToSpace = (id: string) => {
    setActiveSpaceId(id);
    setViewMode("canvas");
  };

  const switchToNode = (nodeId: string, spaceId: string) => {
    setActiveSpaceId(spaceId);
    setActiveNodeId(nodeId);
    setViewMode("canvas");
  };

  const handleOpenSpaceModal = () => setIsSpaceModalOpen(true);

  const handleCreateSpace = (data: {
    name: string;
    isPublic: boolean;
    members: string[];
    description: string;
    pictureUrl?: string;
  }) => {
    const newSpace: Space = {
      id: `space-${Date.now()}`,
      name: data.name,
      isPublic: data.isPublic,
      members: data.members,
      description: data.description,
      pictureUrl: data.pictureUrl,
      backgroundColor: "#f8fafc",
    };
    setSpaces([...spaces, newSpace]);
    setActiveSpaceId(newSpace.id);
    setViewMode("canvas");
    setIsSpaceModalOpen(false);
  };

  const handleRenameSpace = (id: string) => {
    const spaceToRename = spaces.find((s) => s.id === id);
    if (!spaceToRename) return;
    const newName = prompt(
      "Enter new space name:",
      spaceToRename.name,
    );
    if (newName && newName.trim()) {
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, name: newName.trim() } : s,
        ),
      );
    }
  };

  const handleSpaceColorChange = (newColor: string) => {
    if (!activeSpaceId) return;
    setSpaces((prev) =>
      prev.map((s) =>
        s.id === activeSpaceId
          ? { ...s, backgroundColor: newColor }
          : s,
      ),
    );
  };

  const handleDeleteSpace = (
    e: React.MouseEvent,
    id: string,
  ) => {
    e.preventDefault();
    if (spaces.length <= 1) {
      alert("You must have at least one space.");
      return;
    }
    if (
      confirm(
        "Are you sure you want to delete this space and all its contents?",
      )
    ) {
      setSpaces((prev) => prev.filter((s) => s.id !== id));
      setNodes((prev) => prev.filter((n) => n.spaceId !== id));
      if (activeSpaceId === id) {
        const nextSpace = spaces.find((s) => s.id !== id);
        if (nextSpace) setActiveSpaceId(nextSpace.id);
      }
    }
  };

  const handleNodeMove = (id: string, newPos: Coordinates) => {
    setNodes((prev) => {
      const movedNode = prev.find((n) => n.id === id);
      if (!movedNode) return prev;

      const dx = newPos.x - movedNode.position.x;
      const dy = newPos.y - movedNode.position.y;

      if (movedNode.type === NodeType.GROUP) {
        return prev.map((node) => {
          if (node.id === id) {
            return { ...node, position: newPos };
          }
          if (node.parentId === id) {
            return {
              ...node,
              position: {
                x: node.position.x + dx,
                y: node.position.y + dy,
              },
            };
          }
          return node;
        });
      }

      return prev.map((node) =>
        node.id === id ? { ...node, position: newPos } : node,
      );
    });
  };

  const handleReparentNode = (
    nodeId: string,
    parentId: string | null,
  ) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, parentId } : n,
      ),
    );
  };

  const handleNodeResize = (
    id: string,
    width: number,
    height: number,
  ) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, width, height } : node,
      ),
    );
  };

  const handleNodeSelect = (id: string, multi: boolean) => {
    if (multi) {
      setSelectedNodeIds((prev) =>
        prev.includes(id)
          ? prev.filter((nid) => nid !== id)
          : [...prev, id],
      );
    } else {
      setSelectedNodeIds([id]);
      const node = nodes.find((n) => n.id === id);
      if (
        node &&
        node.type !== NodeType.FOLDER &&
        node.type !== NodeType.GROUP
      ) {
        setActiveNodeId(id);
      }
    }
  };

  const handleMultiSelect = (ids: string[]) => {
    setSelectedNodeIds(ids);
  };

  const handleRenameNode = (id: string) =>
    setRenamingNodeId(id);

  const handleCommitRename = (id: string, newTitle: string) => {
    if (newTitle.trim()) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, title: newTitle.trim() } : n,
        ),
      );
    }
    setRenamingNodeId(null);
  };

  const handleNodeIconChange = (id: string, icon: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, icon } : n)),
    );
  };

  const handleNodeCollapse = (id: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? { ...node, collapsed: !node.collapsed }
          : node,
      ),
    );
  };

  const handleAddProject = (position: Coordinates) => {
    if (!currentSpace) return;
    const newId = `proj-${Date.now()}`;
    const newNode: NodeData = {
      id: newId,
      spaceId: activeSpaceId,
      type: NodeType.FOLDER,
      title: "New Project",
      parentId: null,
      position: position,
      width: 240,
      height: 160,
      collapsed: true,
      collaborators: [],
    };
    setNodes((prev) => [...prev, newNode]);
    setRenamingNodeId(newId);
  };

  const handleAddChild = (parentId: string) => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;
    const childCount = nodes.filter(
      (n) => n.parentId === parentId,
    ).length;
    const newPos = {
      x: parent.position.x + childCount * 40,
      y: parent.position.y + (parent.height || 160) + 40,
    };
    const newNode: NodeData = {
      id: `new-${Date.now()}`,
      spaceId: activeSpaceId,
      type: NodeType.PAGE,
      title: "Untitled Page",
      parentId: parentId,
      position: newPos,
      width: 240,
      content: "",
    };
    setNodes((prev) => [...prev, newNode]);
    if (parent.collapsed) handleNodeCollapse(parentId);
    setRenamingNodeId(newNode.id);
  };

  const handleDeleteNode = (id: string) => {
    const getDescendants = (nodeId: string): string[] => {
      const children = nodes.filter(
        (n) => n.parentId === nodeId,
      );
      let ids = [nodeId];
      children.forEach((child) => {
        ids = [...ids, ...getDescendants(child.id)];
      });
      return ids;
    };
    const idsToDelete = getDescendants(id);
    setNodes((prev) =>
      prev.filter((n) => !idsToDelete.includes(n.id)),
    );
    if (activeNodeId && idsToDelete.includes(activeNodeId))
      setActiveNodeId(null);
    setSelectedNodeIds([]);
  };

  const handleUpdateContent = (
    id: string,
    title: string,
    content: string,
  ) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, title, content } : n,
      ),
    );
  };

  const handleCreateGroup = () => {
    if (selectedNodeIds.length === 0) return;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    const selectedNodes = nodes.filter((n) =>
      selectedNodeIds.includes(n.id),
    );
    if (selectedNodes.length === 0) return;

    selectedNodes.forEach((n) => {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + (n.width || 240));
      maxY = Math.max(maxY, n.position.y + (n.height || 160));
    });

    const PADDING = 40;
    const newGroupId = `group-${Date.now()}`;
    const newGroup: NodeData = {
      id: newGroupId,
      spaceId: activeSpaceId,
      type: NodeType.GROUP,
      title: "New Group",
      parentId: null,
      position: { x: minX - PADDING, y: minY - PADDING },
      width: maxX - minX + PADDING * 2,
      height: maxY - minY + PADDING * 2,
      collapsed: false,
      icon: "layers",
    };

    setNodes((prev) => {
      const withGroup = [...prev, newGroup];
      return withGroup.map((n) => {
        if (selectedNodeIds.includes(n.id)) {
          return { ...n, parentId: newGroupId };
        }
        return n;
      });
    });

    setSelectedNodeIds([newGroup.id]);
    setRenamingNodeId(newGroup.id);
  };

  const activeNode = activeNodeId
    ? nodes.find((n) => n.id === activeNodeId)
    : null;

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-slate-50 text-slate-800 selection:bg-blue-200/50">
      <div
        className="absolute top-8 left-8 z-50 cursor-pointer group"
        onClick={() => setViewMode("home")}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors duration-200">
            Spatial
          </span>
          <span className="text-slate-400 text-lg tracking-wide">
            Workspace
          </span>
        </div>
      </div>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-slate-200 flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setViewMode("home")}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${viewMode === "home" ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>
          <div className="w-px h-7 bg-slate-200"></div>
          <div className="flex items-center -space-x-2 hover:-space-x-1 transition-all duration-300 px-1">
            {spaces.map((space, index) => {
              const isActive =
                space.id === activeSpaceId &&
                viewMode === "canvas";
              const saturatedColor = getSaturatedColor(
                space.backgroundColor,
              );
              return (
                <button
                  key={space.id}
                  onClick={() => switchToSpace(space.id)}
                  onContextMenu={(e) =>
                    handleDeleteSpace(e, space.id)
                  }
                  onDoubleClick={() =>
                    handleRenameSpace(space.id)
                  }
                  className={`relative w-11 h-11 rounded-xl flex items-center justify-center text-xs text-white shadow-md border-2 border-white transition-all duration-300 overflow-hidden group ${isActive ? "z-20 scale-110 ring-2 ring-blue-500 ring-offset-2" : "z-10 opacity-60 hover:opacity-100 hover:scale-110 hover:z-30"}`}
                  style={{
                    backgroundColor: !space.pictureUrl
                      ? saturatedColor
                      : "transparent",
                  }}
                  title={`${space.name}`}
                >
                  {space.pictureUrl ? (
                    <img
                      src={space.pictureUrl}
                      alt={space.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white drop-shadow-md">
                      {space.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-md"></div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="w-px h-7 bg-slate-200"></div>
          <button
            onClick={handleOpenSpaceModal}
            className="group flex items-center rounded-xl bg-white border border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm hover:shadow-lg transition-all duration-300 h-11 px-0 overflow-hidden"
            title="Create new space"
          >
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </div>
            <span className="max-w-0 group-hover:max-w-[120px] overflow-hidden whitespace-nowrap transition-all duration-300 ease-out text-sm font-medium opacity-0 group-hover:opacity-100 pr-0 group-hover:pr-4">
              New Space
            </span>
          </button>
        </div>
      </div>

      <div className="absolute top-8 right-8 z-50 flex items-center gap-3">
        <button className="w-11 h-11 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white border border-slate-200 shadow-sm transition-all duration-200 hover:scale-105 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="ml-2 pl-3 border-l border-slate-200">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs cursor-pointer hover:scale-105 transition-transform hover:shadow-xl">
            ME
          </div>
        </div>
      </div>

      <div
        className={`absolute top-24 left-8 right-8 bottom-8 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white transition-all duration-500 ease-in-out ${viewMode === "home" ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100 pointer-events-auto"}`}
      >
        <Canvas
          nodes={visibleNodes}
          activeSpaceId={activeSpaceId}
          selectedNodeIds={selectedNodeIds}
          onNodeSelect={handleNodeSelect}
          onMultiSelect={handleMultiSelect}
          onNodeMove={handleNodeMove}
          onReparentNode={handleReparentNode}
          onNodeResize={handleNodeResize}
          onNodeCollapse={handleNodeCollapse}
          onAddChild={handleAddChild}
          onDeleteNode={handleDeleteNode}
          onBackgroundClick={() => {
            setActiveNodeId(null);
            setSelectedNodeIds([]);
            setRenamingNodeId(null);
          }}
          onAddProject={handleAddProject}
          onRenameNode={handleRenameNode}
          renamingNodeId={renamingNodeId}
          onCommitRename={handleCommitRename}
          onNodeIconChange={handleNodeIconChange}
          backgroundColor={
            currentSpace?.backgroundColor || "#ffffff"
          }
          onColorChange={handleSpaceColorChange}
          onCreateGroup={handleCreateGroup}
        />
        {viewMode === "canvas" && currentSpace && (
          <div className="absolute top-0 left-0 right-0 p-8 flex items-start justify-between pointer-events-none">
            <div className="pointer-events-auto">
              <h1
                className="text-4xl text-slate-900 tracking-tight cursor-pointer hover:text-blue-600 transition-colors duration-200"
                onDoubleClick={() =>
                  handleRenameSpace(currentSpace.id)
                }
              >
                {currentSpace.name}
              </h1>
              <p className="text-slate-500 mt-2 opacity-80">
                {currentSpace.description || "No description"}
              </p>
            </div>
          </div>
        )}
      </div>

      {viewMode === "home" && (
        <HomeView
          spaces={spaces}
          recentNodes={recentNodes}
          onSelectSpace={switchToSpace}
          onSelectNode={switchToNode}
          onCreateSpace={handleOpenSpaceModal}
        />
      )}

      {activeNode && (
        <Editor
          node={activeNode}
          onClose={() => setActiveNodeId(null)}
          onUpdate={handleUpdateContent}
        />
      )}

      <SpaceModal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        onSave={handleCreateSpace}
      />
    </div>
  );
}