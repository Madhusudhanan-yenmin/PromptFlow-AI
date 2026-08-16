import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { Project } from '../types/project.types';
import { History as HistoryIcon, Layers, Calendar, ChevronRight } from 'lucide-react';

export const History: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await projectService.getProjects();
        setProjects(data);
      } catch (err) {
        console.warn('Could not fetch history list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Generation History</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review previous PromptFlow AI content generation requests
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">Loading history...</div>
      ) : projects.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center space-y-3 border border-slate-800">
          <HistoryIcon className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-base font-semibold text-slate-300">No Generation History Found</p>
          <p className="text-xs text-slate-500">Your created projects and multi-modal assets will be cataloged here.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
          {projects.map((item) => (
            <Link
              key={item.id}
              to={`/results/${item.id}`}
              className="p-5 flex items-center justify-between hover:bg-slate-900/60 transition-colors group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl truncate">{item.originalPrompt}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
