import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, Copy, Check, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Project } from '../types';
import { saveProject } from '../utils/storage';

interface CoverModalProps {
  project: Project;
  initialTab?: 'prompt' | 'upload';
  onClose: () => void;
  onUpdateProject: (updated: Project) => void;
}

export const CoverModal: React.FC<CoverModalProps> = ({
  project,
  initialTab = 'prompt',
  onClose,
  onUpdateProject,
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'upload'>(initialTab);
  const [coverPrompt, setCoverPrompt] = useState(project.coverPrompt || '');
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(project.coverImage);

  useEffect(() => {
    if (!coverPrompt && activeTab === 'prompt') {
      handleGeneratePrompt();
    }
  }, [activeTab]);

  const handleGeneratePrompt = async () => {
    setLoadingPrompt(true);
    try {
      const res = await fetch('/api/ai/generate-cover-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterContext: project }),
      });
      const data = await res.json();
      if (data.prompt) {
        setCoverPrompt(data.prompt);
        const updated = { ...project, coverPrompt: data.prompt };
        saveProject(updated);
        onUpdateProject(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrompt(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!coverPrompt) return;
    navigator.clipboard.writeText(coverPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      const updated = { ...project, coverImage: base64 };
      saveProject(updated);
      onUpdateProject(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    setPreviewUrl(null);
    const updated = { ...project, coverImage: null };
    saveProject(updated);
    onUpdateProject(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-gray-900">
              Desain Sampul & Prompt AI
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50/40">
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'prompt'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>PROMPT COVER AI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>UPLOAD COVER BUKU</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'prompt' ? (
            <div className="space-y-4">
              <div className="text-xs text-gray-600 leading-relaxed">
                Salin prompt visual universal ini dan tempelkan ke Midjourney, ChatGPT/DALL-E 3, Gemini, atau Flux untuk menghasilkan cover berestetika tinggi:
              </div>

              <div className="relative">
                {loadingPrompt ? (
                  <div className="h-44 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
                    <span className="text-xs text-gray-500 font-medium">Merancang prompt sampul visual...</span>
                  </div>
                ) : (
                  <textarea
                    rows={6}
                    readOnly
                    value={coverPrompt}
                    className="w-full text-xs font-mono p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 outline-none leading-relaxed resize-none"
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleGeneratePrompt}
                  disabled={loadingPrompt}
                  className="text-xs font-bold text-gray-600 hover:text-emerald-700 cursor-pointer disabled:opacity-50"
                >
                  Regenerate Prompt
                </button>

                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  disabled={!coverPrompt || loadingPrompt}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Prompt'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="w-48 aspect-[3/4] mx-auto rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                    <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <label className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                      <span>Ganti Gambar</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>

                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Cover</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Cover ini otomatis disematkan pada halaman pertama DOCX dan PDF Anda.
                  </p>
                </div>
              ) : (
                <label className="block p-8 border-2 border-dashed border-gray-300 hover:border-emerald-600 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-emerald-50/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    Klik untuk unggah cover sampul
                  </p>
                  <p className="text-xs text-gray-500">
                    Mendukung JPG, PNG, atau WEBP (Rasio portrait 3:4 atau 1:1 disarankan)
                  </p>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
