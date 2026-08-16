import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { Project } from '../types/project.types';
import { Sparkles, ArrowLeft, Cpu, AlertCircle, Image as ImageIcon, Video, FileText } from 'lucide-react';

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id || id === 'latest') {
        setLoading(false);
        return;
      }
      try {
        const data = await projectService.getProjectById(id);
        setProject(data);
      } catch (err) {
        console.warn('Could not fetch project details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [id]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Generated Results
        </span>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {project ? project.title : 'Generated Results Workspace'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {project ? project.originalPrompt : 'Multi-modal generation assets pipeline overview'}
        </p>
      </div>

      {/* AI Placeholder Notice Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-3">
        <div className="flex items-center gap-3 text-indigo-300 font-semibold text-base">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span>AI Generator Architecture Ready</span>
        </div>
        <p className="text-sm text-slate-300">
          AI generation service will be implemented in the next phase. The intent orchestrator module and backend data models are established to connect Gemini, Imagen 3, and Veo APIs seamlessly.
        </p>
      </div>

      {/* Mock Asset Grid Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Image Generation</h3>
          <p className="text-xs text-slate-400">
            Image Generator module stub (`app/ai/image_generator.py`) prepared for Imagen / Stable Diffusion.
          </p>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono">
            Status: Pending Phase 2 API call
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Video Generation</h3>
          <p className="text-xs text-slate-400">
            Video Generator module stub (`app/ai/video_generator.py`) prepared for Veo / Runway.
          </p>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono">
            Status: Pending Phase 2 API call
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Copywriting & Tags</h3>
          <p className="text-xs text-slate-400">
            Text Generator module stub (`app/ai/text_generator.py`) prepared for Gemini LLM.
          </p>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono">
            Status: Pending Phase 2 API call
          </div>
        </div>
      </div>
    </div>
  );
};
