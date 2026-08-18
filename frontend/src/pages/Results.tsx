import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generationService } from '../services/generation.service';
import { GenerateResponse } from '../types/generation.types';
import { extractErrorMessage } from '../utils/error';
import { Sparkles, ArrowLeft, Cpu, AlertTriangle, Image as ImageIcon, Video, FileText, CheckCircle2, Copy, Check, Layers, Target, Compass, Users, Tag } from 'lucide-react';

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [generation, setGeneration] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await generationService.getGeneration(id);
        setGeneration(data);
      } catch (err: any) {
        console.error('Failed to load generation results:', err);
        const msg = extractErrorMessage(err, 'Could not retrieve AI generation results.');
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-indigo-300">Retrieving AI Generation Plan...</p>
      </div>
    );
  }

  if (error || !generation) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="p-6 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm font-medium flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-200">Unable to load result</p>
            <p className="mt-1 text-xs">{error || 'Generation record not found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          AI Orchestration Completed
        </span>
      </div>

      {/* Prompt Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          AI Generation Results
        </h1>
        <div className="mt-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-0.5">Original Prompt</span>
            <p className="leading-relaxed">{generation.originalPrompt}</p>
          </div>
        </div>
      </div>

      {/* 1. AI Understanding Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          AI Understanding (Intent Analysis)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Intent Type</span>
            </div>
            <p className="text-base font-bold text-white capitalize">{generation.intent.type.replace(/_/g, ' ')}</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Primary Goal</span>
            </div>
            <p className="text-sm font-semibold text-slate-200 line-clamp-2">{generation.intent.goal}</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Domain</span>
            </div>
            <p className="text-base font-bold text-white capitalize">{generation.intent.domain}</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Users className="w-4 h-4 text-violet-400" />
              <span>Target Audience</span>
            </div>
            <p className="text-sm font-semibold text-slate-200 line-clamp-2">{generation.intent.targetAudience || 'General Audience'}</p>
          </div>
        </div>
      </div>

      {/* 2. Content Plan Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Dynamic Content Plan
        </h2>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-xs text-slate-400 mb-2">
            Llama 3.1 8B dynamically selected the following content output formats based on user intent:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {generation.contentPlan.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{item.type}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media Model Phase Notice */}
      <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 flex items-start gap-3">
        <Cpu className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-300">
          <p className="font-semibold text-indigo-200 text-sm">Generation Prompts Ready</p>
          <p className="leading-relaxed">
            The media generation prompts below have been engineered by Llama 3.1 8B. In the next phase, these prompts will be passed to <strong>FLUX.2</strong> (for image synthesis) and <strong>Wan 2.2</strong> (for video generation).
          </p>
        </div>
      </div>

      {/* 3. Generated Content Prompts & Text Content */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Generated Content Assets & Model Prompts
        </h2>

        {/* Image Prompt (FLUX.2) */}
        {generation.generatedPrompts.image && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Image Generation Prompt</h3>
                  <span className="text-[10px] text-purple-400 font-mono">Target Model: FLUX.2</span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(generation.generatedPrompts.image || '', 'image_prompt')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                {copiedKey === 'image_prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'image_prompt' ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              {generation.generatedPrompts.image}
            </p>
          </div>
        )}

        {/* Video Prompt (Wan 2.2) */}
        {generation.generatedPrompts.video && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Video Generation Prompt</h3>
                  <span className="text-[10px] text-blue-400 font-mono">Target Model: Wan 2.2</span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(generation.generatedPrompts.video || '', 'video_prompt')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                {copiedKey === 'video_prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'video_prompt' ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              {generation.generatedPrompts.video}
            </p>
          </div>
        )}

        {/* Logo Prompt */}
        {generation.generatedPrompts.logo && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Logo Design Prompt</h3>
                  <span className="text-[10px] text-amber-400 font-mono">Target: Vector Brand Generator</span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(generation.generatedPrompts.logo || '', 'logo_prompt')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                {copiedKey === 'logo_prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'logo_prompt' ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              {generation.generatedPrompts.logo}
            </p>
          </div>
        )}

        {/* Generated Caption */}
        {generation.textContent.caption && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>Generated Social Media Caption</span>
              </div>
              <button
                onClick={() => copyToClipboard(generation.textContent.caption || '', 'caption')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                {copiedKey === 'caption' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'caption' ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <p className="text-sm text-slate-100 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              {generation.textContent.caption}
            </p>
          </div>
        )}

        {/* Generated Hashtags */}
        {generation.textContent.hashtags && generation.textContent.hashtags.length > 0 && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Tag className="w-4 h-4" />
                <span>Recommended Hashtags</span>
              </div>
              <button
                onClick={() => copyToClipboard(generation.textContent.hashtags?.join(' ') || '', 'hashtags')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                {copiedKey === 'hashtags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'hashtags' ? 'Copied' : 'Copy Hashtags'}</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {generation.textContent.hashtags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Generated Body Text / Educational Explanation */}
        {generation.textContent.bodyText && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Body Text & Explanation</span>
              </div>
              <button
                onClick={() => copyToClipboard(generation.textContent.bodyText || '', 'body_text')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                {copiedKey === 'body_text' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'body_text' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800 whitespace-pre-line">
              {generation.textContent.bodyText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
