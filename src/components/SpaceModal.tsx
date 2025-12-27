import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Globe, Copy, Check, Lock } from 'lucide-react';

interface SpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; isPublic: boolean; members: string[]; description: string; pictureUrl?: string }) => void;
}

export const SpaceModal: React.FC<SpaceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const [currentMemberInput, setCurrentMemberInput] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isPublic && !generatedUrl) {
      const randomId = Math.random().toString(36).substring(2, 10);
      setGeneratedUrl(`https://spatial.app/s/${randomId}`);
    }
  }, [isPublic, generatedUrl]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMemberKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = currentMemberInput.trim();
      if (val && !members.includes(val)) {
        setMembers([...members, val]);
        setCurrentMemberInput('');
      }
    }
  };

  const removeMember = (mem: string) => {
    setMembers(members.filter(m => m !== mem));
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || 'Untitled Space',
      isPublic,
      members,
      description: description.trim(),
      pictureUrl: preview || undefined
    });
    setName('');
    setDescription('');
    setIsPublic(false);
    setMembers([]);
    setGeneratedUrl('');
    setPreview(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-b from-white to-slate-50/50">
          <h2 className="text-xl text-slate-900">Create New Space</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="flex justify-center">
              <div className="relative group cursor-pointer">
                <div className={`w-28 h-28 rounded-2xl flex items-center justify-center border-2 border-dashed overflow-hidden transition-all duration-200 ${!preview ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300' : 'border-transparent'}`}>
                  {preview ? (
                    <img src={preview} alt="Space cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-3">
                       <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                       <span className="text-xs text-slate-400">Upload Icon</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>
           </div>

           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Space Name</label>
             <input 
               type="text" 
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="e.g. Q4 Marketing"
               className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
               autoFocus
             />
           </div>

           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
             <textarea 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder="What is this space for?"
               rows={3}
               className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm"
             />
           </div>

           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Share with Team</label>
             <div className="min-h-[50px] w-full px-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all flex flex-wrap gap-2">
                {members.map(member => (
                  <span key={member} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs">
                    {member}
                    <button type="button" onClick={() => removeMember(member)} className="hover:text-blue-900 transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <input 
                  type="text" 
                  value={currentMemberInput}
                  onChange={(e) => setCurrentMemberInput(e.target.value)}
                  onKeyDown={handleMemberKeyDown}
                  placeholder={members.length === 0 ? "Enter email addresses..." : ""}
                  className="bg-transparent border-none outline-none text-sm min-w-[150px] flex-1 text-slate-800 placeholder-slate-400"
                />
             </div>
             <p className="text-xs text-slate-400 mt-2">Press Enter to add.</p>
           </div>

           <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border-2 border-slate-200">
             <div className="flex items-center justify-between mb-3">
               <div>
                 <h3 className="text-sm text-slate-800 flex items-center gap-2 mb-1">
                   {isPublic ? <Globe className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-slate-500" />}
                   <span>{isPublic ? 'Public Access' : 'Private Space'}</span>
                 </h3>
                 <p className="text-xs text-slate-500">{isPublic ? 'Anyone with the link can view' : 'Only invited members can access'}</p>
               </div>
               <button 
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`w-14 h-7 rounded-full p-1 transition-all duration-300 relative shadow-inner ${isPublic ? 'bg-emerald-500' : 'bg-slate-300'}`}
               >
                 <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isPublic ? 'translate-x-7' : 'translate-x-0'}`} />
               </button>
             </div>

             {isPublic && (
               <div className="mt-4 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                 <input 
                   readOnly
                   value={generatedUrl}
                   className="flex-1 bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 select-all focus:outline-none"
                 />
                 <button 
                  type="button"
                  onClick={copyUrl}
                  className="px-4 py-2 bg-white border-2 border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-all"
                 >
                   {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                   {copied ? 'Copied!' : 'Copy'}
                 </button>
               </div>
             )}
           </div>

           <div className="pt-4 flex items-center justify-between">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!name.trim()}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 text-sm hover:scale-105"
              >
                Create Space
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};
