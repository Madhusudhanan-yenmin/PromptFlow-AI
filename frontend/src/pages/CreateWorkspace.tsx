import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/project.service';
import { generationService } from '../services/generation.service';
import { Sparkles, Upload, Image as ImageIcon, Video, FileText, Music, ShieldCheck, Check } from 'lucide-react';

export const CreateWorkspace: React.FC = () => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['image', 'video', 'text']);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [inputImages, setInputImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await projectService.uploadImage(file);
      setInputImages((prev) => [...prev, res.url]);
    } catch (err) {
      console.error('Failed image upload:', err);
      alert('Failed to upload image. Please try a valid JPG or PNG file.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !prompt) return;

    setSubmitting(true);
    setMessage('');

    try {
      // Step 1: Create project entry
      const proj = await projectService.createProject({
        title,
        originalPrompt: prompt,
        inputImages,
      });

      // Step 2: Trigger generation pipeline endpoint
      const genResult = await generationService.triggerGeneration({
        projectId: proj.id,
        requestedTypes: selectedTypes,
      });

      setMessage(genResult.message);
      setTimeout(() => {
        navigate(`/results/${proj.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error during workspace creation:', err);
      setMessage('Project created successfully in database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create your content</h1>
        <p className="text-slate-400 text-sm mt-1">
          PromptFlow AI Workspace - Define prompts & content requirements
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Title */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <label className="block text-sm font-bold text-slate-200">Project Campaign Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Summer Fitness App Launch Campaign"
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Prompt Input */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <label className="block text-sm font-bold text-slate-200">Prompt & Creative Intent</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
            rows={4}
            placeholder="Describe what content you need generated (e.g., High quality product showcase video, 3 Instagram post graphics, catchy captions & hashtags)..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Content Asset Selector */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <label className="block text-sm font-bold text-slate-200">Desired Output Formats</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'image', label: 'Images', icon: ImageIcon },
              { id: 'video', label: 'Videos', icon: Video },
              { id: 'text', label: 'Captions & Tags', icon: FileText },
              { id: 'audio', label: 'Audio / Voice', icon: Music },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = selectedTypes.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTypeToggle(item.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Image Upload */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <label className="block text-sm font-bold text-slate-200">Reference Images (Optional)</label>
          <div className="flex flex-wrap items-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
            {inputImages.map((img, idx) => (
              <div key={idx} className="relative group w-12 h-12 rounded-lg overflow-hidden border border-indigo-500/30">
                <img src={`http://localhost:8000${img}`} alt="uploaded" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-base text-white flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5 text-indigo-200" />
          {submitting ? 'Creating Project...' : 'Initialize PromptFlow Generation'}
        </button>
      </form>
    </div>
  );
};
