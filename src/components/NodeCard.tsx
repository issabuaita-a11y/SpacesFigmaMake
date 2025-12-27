import React, { useState, useRef, useEffect } from 'react';
import { Folder, FileText, Calendar, Kanban, Plus, MoreVertical, Trash2, Edit2, Layers, Star, Tag, Bookmark, Box } from 'lucide-react';
import { NodeData, NodeType } from '../types';

interface NodeCardProps {
  node: NodeData;
  isSelected: boolean;
  onSelect: (id: string, multi: boolean) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onResizeStart?: (e: React.MouseEvent, id: string) => void;
  onToggleCollapse?: (id: string) => void;
  onAddChild?: (parentId: string) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string) => void;
  isRenaming?: boolean;
  onCommitRename?: (id: string, newTitle: string) => void;
  onIconChange?: (id: string, icon: string) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({ 
  node, 
  isSelected, 
  onSelect, 
  onDragStart,
  onResizeStart,
  onToggleCollapse,
  onAddChild,
  onDelete,
  onRename,
  isRenaming,
  onCommitRename,
  onIconChange
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      setEditTitle(node.title);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isRenaming, node.title]);

  const handleSubmitRename = () => {
    const finalTitle = editTitle.trim() || "Untitled";
    onCommitRename?.(node.id, finalTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCommitRename?.(node.id, node.title);
    }
  };

  const cycleIcon = (e: React.MouseEvent) => {
      e.stopPropagation();
      const icons = ['layers', 'star', 'tag', 'bookmark', 'box'];
      const currentIdx = icons.indexOf(node.icon || 'layers');
      const nextIdx = (currentIdx + 1) % icons.length;
      onIconChange?.(node.id, icons[nextIdx]);
  };

  const getIcon = () => {
    if (node.type === NodeType.GROUP) {
        const iconName = node.icon || 'layers';
        const className = "w-4 h-4 text-purple-600";
        switch (iconName) {
            case 'star': return <Star className={className} />;
            case 'tag': return <Tag className={className} />;
            case 'bookmark': return <Bookmark className={className} />;
            case 'box': return <Box className={className} />;
            case 'layers': default: return <Layers className={className} />;
        }
    }

    switch (node.type) {
      case NodeType.FOLDER: return <Folder className="w-5 h-5 text-blue-600" />;
      case NodeType.TIMELINE: return <Kanban className="w-5 h-5 text-orange-500" />;
      case NodeType.CALENDAR: return <Calendar className="w-5 h-5 text-purple-500" />;
      case NodeType.PAGE: default: return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const isFolder = node.type === NodeType.FOLDER;
  const isGroup = node.type === NodeType.GROUP;
  const isPage = node.type === NodeType.PAGE;
  const hasCollaborators = node.collaborators && node.collaborators.length > 0;
  
  const width = node.width || 240;
  const height = node.height || (isFolder ? 160 : isPage ? 120 : 'auto');

  // --- GROUP RENDERING ---
  if (isGroup) {
    return (
      <div
        className={`absolute flex flex-col group select-none transition-all duration-200`}
        style={{
          left: node.position.x,
          top: node.position.y,
          width,
          height,
          zIndex: 0
        }}
        onMouseDown={(e) => {
           if (e.button === 0) onDragStart(e, node.id);
        }}
        onClick={(e) => {
           e.stopPropagation();
           onSelect(node.id, e.shiftKey || e.metaKey);
        }}
      >
        <div className={`
           w-full h-full border-2 rounded-3xl flex flex-col p-4 transition-all duration-200
           ${isSelected 
             ? 'border-purple-500 bg-purple-50/30 shadow-lg shadow-purple-200/50' 
             : 'border-purple-300 border-dashed bg-purple-50/5 hover:border-purple-400 hover:bg-purple-50/10 hover:shadow-md'
            }
        `}>
           <div className="flex items-center gap-2 mb-1">
              <button 
                  onClick={cycleIcon}
                  className="p-1.5 hover:bg-purple-100 rounded-lg transition-all duration-200 hover:scale-105"
                  title="Click to change icon"
              >
                  {getIcon()}
              </button>
              
              {isRenaming ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSubmitRename}
                  onKeyDown={handleKeyDown}
                  className="bg-white border-2 border-purple-400 rounded-lg px-2 py-1 text-xs font-bold text-purple-700 uppercase tracking-wide shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  autoFocus
                />
              ) : (
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wide select-none truncate" title={node.title}>{node.title}</span>
              )}

               {!isRenaming && (
                <button 
                  className="ml-auto p-1.5 text-purple-400 hover:text-purple-700 hover:bg-purple-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              )}
           </div>
           
           {showMenu && !isRenaming && (
            <div 
              className="absolute right-3 top-12 bg-white border border-slate-200 shadow-2xl rounded-xl w-36 py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRename?.(node.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Rename
              </button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(node.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
        
        <div 
            className="absolute bottom-0 right-0 w-10 h-10 cursor-nwse-resize z-20 opacity-0 group-hover:opacity-100 flex items-end justify-end p-2 transition-opacity duration-200"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeStart?.(e, node.id);
            }}
        >
             <div className="w-2.5 h-2.5 bg-purple-500 rounded-full shadow-sm" />
        </div>
      </div>
    );
  }

  // --- STANDARD CARD RENDERING ---
  return (
    <div
      className={`absolute flex flex-col group select-none transition-all duration-200`}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: 'translate(0, 0)', 
        zIndex: isSelected ? 20 : 10
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id, e.shiftKey || e.metaKey);
      }}
      onDoubleClick={(e) => {
        // Double-click on PAGE nodes to open them in editor
        if (node.type === NodeType.PAGE) {
          e.stopPropagation();
          onSelect(node.id, false);
        }
      }}
    >
      <div 
        className={`
          relative bg-white border rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200
          ${isSelected 
            ? 'ring-2 ring-blue-500 border-blue-400 shadow-2xl shadow-blue-500/20 scale-[1.02]' 
            : 'border-slate-200 hover:border-slate-300 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 hover:-translate-y-0.5'
          }
        `}
        style={{ width, height }}
        onMouseDown={(e) => {
          if (e.button === 0) {
            onDragStart(e, node.id);
          }
        }}
      >
        <div className="flex items-center gap-3 relative shrink-0">
          <div className={`p-2.5 rounded-xl shrink-0 transition-all duration-200 ${isFolder ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
            {getIcon()}
          </div>
          
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSubmitRename}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex-1 min-w-0 bg-transparent border-2 border-blue-400 rounded-lg px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          ) : (
            <span className="flex-1 text-sm text-slate-800 truncate" title={node.title}>
              {node.title}
            </span>
          )}
          
          {!isRenaming && (
            <button 
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}

          {showMenu && !isRenaming && (
            <div 
              className="absolute right-0 top-10 bg-white border border-slate-200 shadow-2xl rounded-xl w-36 py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRename?.(node.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Rename
              </button>
              <div className="h-px bg-slate-100 my-1"></div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(node.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>

        {isFolder && (
          <div className="flex-1 min-h-0 relative flex flex-col">
             {hasCollaborators && (
              <div className="flex items-center mb-3">
                 <div className="flex -space-x-2">
                   {node.collaborators?.slice(0, 3).map((user) => (
                     <div 
                       key={user.id} 
                       className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white shadow-sm ${user.color} transition-transform hover:scale-110`}
                       title={user.name}
                     >
                       {user.initials}
                     </div>
                   ))}
                 </div>
              </div>
            )}
            
            <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
               <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild?.(node.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" /> <span>Add page</span>
                </button>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollapse?.(node.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-all duration-200"
                >
                   {node.collapsed ? 'Expand' : 'Collapse'}
                </button>
            </div>
          </div>
        )}

        {/* Page hint */}
        {isPage && (
          <div className="flex items-center justify-center py-2">
            <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Double-click to open
            </span>
          </div>
        )}

        {isFolder && (
          <div 
            className="absolute bottom-1.5 right-1.5 w-7 h-7 cursor-nwse-resize flex items-end justify-end p-1.5 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeStart?.(e, node.id);
            }}
          >
             <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-300">
                <path d="M7 11L11 7" />
                <path d="M2 11L11 2" />
             </svg>
          </div>
        )}

      </div>
    </div>
  );
};