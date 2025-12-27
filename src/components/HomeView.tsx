import React from 'react';
import { Space, NodeData, NodeType } from '../types';
import { Plus, Clock, Layout, FileText, ArrowRight, Sparkles, Kanban, Calendar, Globe, Users, Lock } from 'lucide-react';

interface HomeViewProps {
  spaces: Space[];
  recentNodes: NodeData[];
  onSelectSpace: (id: string) => void;
  onSelectNode: (nodeId: string, spaceId: string) => void;
  onCreateSpace: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  spaces,
  recentNodes,
  onSelectSpace,
  onSelectNode,
  onCreateSpace
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 backdrop-blur-md animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto px-8 pt-32 pb-20">
        
        <div className="mb-16">
          <h1 className="text-5xl text-slate-900 mb-3 tracking-tight">{getGreeting()}.</h1>
          <p className="text-slate-500 text-lg">Ready to organize your spatial thoughts?</p>
        </div>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <span>Your Spaces</span>
            </h2>
            <button 
              onClick={onCreateSpace}
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-4 h-4" /> New Space
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {spaces.map((space, i) => (
              <div 
                key={space.id}
                onClick={() => onSelectSpace(space.id)}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-300/30 hover:border-slate-300 cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center text-white shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-110
                  ${!space.pictureUrl ? (i % 3 === 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : i % 3 === 1 ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600') : 'bg-slate-200'}
                `}>
                  {space.pictureUrl ? (
                    <img src={space.pictureUrl} alt={space.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{space.name.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <h3 className="text-slate-800 mb-2 truncate group-hover:text-blue-600 transition-colors">{space.name}</h3>
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
                   {space.isPublic ? (
                     <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                       <Globe className="w-3 h-3" /> Public
                     </span>
                   ) : (
                     <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                       <Lock className="w-3 h-3" /> Private
                     </span>
                   )}
                   {(space.members.length > 0) && (
                     <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                       <Users className="w-3 h-3" /> {space.members.length}
                     </span>
                   )}
                </div>
                
                {space.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {space.description}
                  </p>
                )}

                <div className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 opacity-0 group-hover:opacity-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-300 group-hover:scale-110">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
            
            <button 
              onClick={onCreateSpace}
              className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300 group min-h-[200px] hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:shadow-md transition-all duration-300 group-hover:scale-110">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-medium">Create Space</span>
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <section className="lg:col-span-2">
            <h2 className="text-2xl text-slate-800 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span>Jump Back In</span>
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
              {recentNodes.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentNodes.map(node => (
                    <div 
                      key={node.id}
                      onClick={() => onSelectNode(node.id, node.spaceId)}
                      className="p-5 flex items-center gap-4 hover:bg-slate-50 cursor-pointer group transition-all duration-200"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200 shadow-sm">
                        {node.type === NodeType.FOLDER ? '📂' : node.type === NodeType.TIMELINE ? '📅' : '📄'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-slate-800 truncate group-hover:text-blue-600 transition-colors">{node.title}</h4>
                        <p className="text-xs text-slate-400 truncate">
                          Last edited recently
                        </p>
                      </div>
                      <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:shadow-sm transition-all">
                        Open
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-slate-300" />
                  </div>
                  <p>No recent items yet.</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl text-slate-800 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span>Start Fresh</span>
            </h2>
            <div className="grid gap-4">
              {[
                { label: 'Project Roadmap', icon: <Kanban className="w-4 h-4 text-emerald-600" />, color: 'hover:bg-emerald-50 hover:border-emerald-300', iconBg: 'bg-emerald-100' },
                { label: 'Weekly Journal', icon: <FileText className="w-4 h-4 text-blue-600" />, color: 'hover:bg-blue-50 hover:border-blue-300', iconBg: 'bg-blue-100' },
                { label: 'Meeting Notes', icon: <Calendar className="w-4 h-4 text-rose-600" />, color: 'hover:bg-rose-50 hover:border-rose-300', iconBg: 'bg-rose-100' },
              ].map((template, i) => (
                <button 
                  key={i}
                  className={`flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-left transition-all duration-200 ${template.color} hover:shadow-md group`}
                  onClick={() => alert('Template creation coming soon!')}
                >
                  <div className={`w-10 h-10 rounded-xl ${template.iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                    {template.icon}
                  </div>
                  <span className="font-medium text-slate-700 text-sm">{template.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};
