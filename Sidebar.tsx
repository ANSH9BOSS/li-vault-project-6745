import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, Plus, Trash2, Layout, FolderPlus, BarChart3, Puzzle, Settings, Search, Box, Upload, Github, FolderInput } from 'lucide-react';
import { FileNode, SidebarView, TodoItem, Snippet, Extension } from '../types.ts';

interface SidebarProps {
  files: FileNode[];
  activeFileId: string | null;
  activeView: SidebarView;
  onViewChange: (v: SidebarView) => void;
  onSelectFile: (id: string) => void;
  onCreateFile: (name: string, language: string) => void;
  onDeleteFile: (id: string) => void;
  onShowTemplates: () => void;
  currentBranch: string;
  onSync: () => void;
  isSyncing: boolean;
  todos: TodoItem[];
  snippets: Snippet[];
  onAddSnippet: (s: Snippet) => void;
  extensions?: Extension[];
  onGitHubImport: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  files, activeFileId, activeView, onViewChange, 
  onSelectFile, onCreateFile, onDeleteFile, onShowTemplates, onSync, onGitHubImport
}) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const ext = newName.split('.').pop() || '';
    const langMap: any = { py: 'python', js: 'javascript', ts: 'typescript', css: 'css', html: 'html', md: 'markdown', sh: 'shell', java: 'java', rust: 'rust', yml: 'yaml', tsx: 'typescript', jsx: 'javascript' };
    onCreateFile(newName, langMap[ext] || 'plaintext');
    setNewName(''); setShowCreate(false);
  };

  return (
    <div className="flex h-full border-r border-white/5 bg-[#020408] relative z-20">
      <div className="w-[68px] flex flex-col items-center py-6 gap-6 border-r border-white/5 bg-black/40">
        <ActivityIcon icon={<Layout size={20}/>} active={activeView === 'explorer'} onClick={() => onViewChange('explorer')} />
        <ActivityIcon icon={<Search size={20}/>} active={activeView === 'search'} onClick={() => onViewChange('search')} />
        <ActivityIcon icon={<Puzzle size={20}/>} active={activeView === 'extensions'} onClick={() => onViewChange('extensions')} />
        <ActivityIcon icon={<BarChart3 size={20}/>} active={activeView === 'stats'} onClick={() => onViewChange('stats')} />
        <div className="mt-auto"><ActivityIcon icon={<Settings size={20}/>} /></div>
      </div>

      <aside className="w-72 flex flex-col bg-black/50 backdrop-blur-3xl overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === 'explorer' && (
            <motion.div key="explorer" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex-1 flex flex-col">
              <div className="px-6 py-6 flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Explorer</h2>
                <div className="flex gap-1">
                  <SidebarAction title="Import from GitHub" icon={<Github size={14} className="text-indigo-400" />} onClick={onGitHubImport} />
                  <SidebarAction title="Import ZIP / Folder" icon={<FolderInput size={14} className="text-sky-400" />} onClick={onSync} />
                  <SidebarAction title="New Module" icon={<Plus size={14} />} onClick={() => setShowCreate(!showCreate)} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 space-y-4 custom-scrollbar">
                {showCreate && (
                  <form onSubmit={handleCreate} className="mb-4">
                    <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="App.tsx" className="w-full bg-slate-900 border border-indigo-500/30 text-[11px] text-white rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 shadow-xl shadow-indigo-500/10" />
                  </form>
                )}
                <div className="space-y-0.5 pb-20">
                  {files.length === 0 ? (
                    <div className="py-12 px-6 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 mb-4 italic">Workspace Empty</p>
                      <button onClick={onShowTemplates} className="text-[9px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest border border-indigo-500/20 px-4 py-2 rounded-lg">Load Templates</button>
                    </div>
                  ) : (
                    files.map(file => (
                      <div key={file.id} className="group flex items-center gap-1">
                        <button onClick={() => onSelectFile(file.id)} className={`flex-1 flex items-center gap-3 px-4 py-2 text-[12px] rounded-xl transition-all relative ${activeFileId === file.id ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/5'}`}>
                          <FileCode size={16} className={activeFileId === file.id ? 'text-white' : 'text-slate-600'} />
                          <span className="truncate">{file.name}</span>
                        </button>
                        <button onClick={() => onDeleteFile(file.id)} className="p-2 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
};

const ActivityIcon = ({ icon, active, onClick }: any) => (
  <button onClick={onClick} className={`p-3 rounded-2xl transition-all relative group ${active ? 'text-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-600/5' : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'}`}>
    {icon}
    {active && <motion.div layoutId="active_bar" className="absolute -left-12 top-2 bottom-2 w-1.5 bg-indigo-500 rounded-full" />}
  </button>
);

const SidebarAction = ({ icon, onClick, title }: any) => (
  <button title={title} onClick={onClick} className="p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-xl transition-all">{icon}</button>
);

export default Sidebar;