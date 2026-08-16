import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { Project } from '../types/project.types';
import { Sparkles, Plus, FolderKanban, Layers, CheckCircle2, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getProjects();
        setProjects(data);
      } catch (err) {
        console.warn('Could not fetch projects list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">PromptFlow AI Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Overview of multi-modal AI generation projects & assets
          </p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white shadow-lg shadow-indigo-600/30 transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          Create Content
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{projects.length}</div>
            <div className="text-xs font-medium text-slate-400">Active Projects</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">Ready</div>
            <div className="text-xs font-medium text-slate-400">Backend API Status</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">Phase 1</div>
            <div className="text-xs font-medium text-slate-400">Boilerplate Foundation</div>
          </div>
        </div>
      </div>

      {/* Recent Projects List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Recent Projects
        </h2>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl text-center space-y-4 border border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-200">No Projects Created Yet</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Start by creating a workspace to define prompts and test the modular project architecture.
              </p>
            </div>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div key={proj.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-white text-base">{proj.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                    {proj.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{proj.originalPrompt}</p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                  <Link to={`/results/${proj.id}`} className="text-indigo-400 hover:underline font-medium">
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
