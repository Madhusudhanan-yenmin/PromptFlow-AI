import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { generationService } from '../services/generation.service';
import { AIHealthStatus } from '../types/generation.types';
import { extractErrorMessage } from '../utils/error';
import { Sparkles, Upload, Cpu, AlertTriangle, CheckCircle2, ArrowRight, X } from 'lucide-react';

export const CreateWorkspace: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [inputImagePath, setInputImagePath] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aiHealth, setAiHealth] = useState<AIHealthStatus | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const health = await generationService.checkAIHealth();
        setAiHealth(health);
      } catch (err) {
        setAiHealth({
          ollama: false,
          model: 'llama3.1:8b',
          status: 'unavailable',
          message: 'Could not connect to AI service backend.'
        });
      }
    };
    fetchHealth();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    try {
      const res = await projectService.uploadImage(file);
      setInputImagePath(res.url);
    } catch (err) {
      console.error('Failed image upload:', err);
      setError('Failed to upload image. Please select a valid JPG or PNG image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a creative prompt describing what you want to create.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Step 1: Create project entry if title provided or auto-generate title
      const projectTitle = title.trim() || prompt.trim().slice(0, 40) + '...';
      const proj = await projectService.createProject({
        title: projectTitle,
        originalPrompt: prompt.trim(),
        inputImages: inputImagePath ? [inputImagePath] : [],
      });

      // Step 2: Dispatch AI Orchestrator generation request
      const genResult = await generationService.generateContent({
        prompt: prompt.trim(),
        projectId: proj.id,
        inputImagePath: inputImagePath
      });

      // Step 3: Navigate to results page
      navigate(`/results/${genResult.id}`);
    } catch (err: any) {
      console.error('Error during generation submission:', err);
      const msg = extractErrorMessage(err, 'Failed to process AI generation. Please check Ollama connection and try again.');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            PromptFlow <span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Multimodal Content Planner & Orchestrator (Llama 3.1 8B)
          </p>
        </div>

        {/* AI Health Status Badge */}
        {aiHealth && (
          <div
            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 w-fit ${
              aiHealth.ollama && aiHealth.status === 'available'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>
              {aiHealth.ollama && aiHealth.status === 'available'
                ? `Ollama Active (${aiHealth.model})`
                : `Ollama Offline (${aiHealth.model})`}
            </span>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">Execution Notice</p>
            <p className="leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Title Input */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Campaign / Project Name (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Brew House Coffee Shop Launch"
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Prompt Input Textarea */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Tell PromptFlow AI what you want to create</span>
            <span className="text-indigo-400 font-mono text-[11px] font-normal">Llama 3.1 8B Engine</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (error) setError('');
            }}
            required
            rows={5}
            placeholder="Describe your request in natural language (e.g. 'I am launching a new clothing brand called UrbanFit', or 'Explain photosynthesis to a 10-year-old', or 'Create a birthday invitation for my sister')..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
          />
        </div>

        {/* Reference Image Upload (Optional) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Reference Image Context (Optional)
            </label>
            <span className="text-[11px] text-slate-500">Supports JPG, PNG</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>{uploadingImage ? 'Uploading...' : 'Upload Reference Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>

            {inputImagePath && (
              <div className="relative group w-16 h-16 rounded-xl overflow-hidden border border-indigo-500/50 shadow-md">
                <img src={`http://localhost:8000${inputImagePath}`} alt="Reference" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setInputImagePath(null)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-base text-white flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Llama 3.1 8B Analyzing Request & Planning Content...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <span>Generate with AI</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
