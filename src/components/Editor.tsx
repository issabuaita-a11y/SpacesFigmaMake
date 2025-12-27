import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, MoreHorizontal, Clock, Calendar } from 'lucide-react';
import { NodeData, NodeType } from '../types';

interface EditorProps {
  node: NodeData;
  onClose: () => void;
  onUpdate: (id: string, newTitle: string, newContent: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ node, onClose, onUpdate }) => {
  const [title, setTitle] = useState(node.title);
  const [content, setContent] = useState(node.content || '');

  useEffect(() => {
    setTitle(node.title);
    setContent(node.content || '');
  }, [node.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onUpdate(node.id, e.target.value, content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onUpdate(node.id, title, e.target.value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center pointer-events-none animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-md pointer-events-auto transition-opacity" 
        onClick={onClose}
      />

      <div className="pointer-events-auto bg-white w-full h-[92vh] sm:h-[88vh] sm:w-[820px] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300 border border-slate-200">
        
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0 bg-white">
          <div className="flex items-center gap-3 text-slate-500">
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm">
              {node.parentId ? 'Project / ' : 'Space / '}{title}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">Saved</span>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all duration-200">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-12 min-h-full flex flex-col">
            <div className="mb-8 select-none group">
               <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center mb-4 text-4xl shadow-lg border border-slate-200 group-hover:shadow-xl transition-shadow duration-200">
                 {node.type === NodeType.FOLDER ? '📂' : node.type === NodeType.TIMELINE ? '📅' : '📄'}
               </div>
            </div>

            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full text-5xl text-slate-900 placeholder-slate-300 border-none focus:ring-0 p-0 mb-6 bg-transparent outline-none tracking-tight"
              placeholder="Untitled"
              autoFocus={!node.title}
            />

            <div className="flex flex-col gap-3 mb-8 text-sm text-slate-500">
              <div className="flex items-center gap-4">
                <span className="w-28 text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4"/> Created
                </span>
                <span className="text-slate-600">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-28 text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4"/> Type
                </span>
                <span className="capitalize bg-slate-100 px-3 py-1 rounded-lg text-slate-700">{node.type.toLowerCase()}</span>
              </div>
            </div>

            <hr className="border-slate-200 mb-8" />

            {node.type === NodeType.PAGE || node.type === NodeType.FOLDER ? (
              <textarea
                value={content}
                onChange={handleContentChange}
                className="w-full flex-1 resize-none border-none focus:ring-0 p-0 text-lg leading-relaxed text-slate-800 placeholder-slate-300 outline-none bg-transparent"
                placeholder="Start writing, or type '/' for commands..."
                spellCheck={false}
              />
            ) : (
              <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 shadow-inner">
                Specialized view for {node.type} is coming soon.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
