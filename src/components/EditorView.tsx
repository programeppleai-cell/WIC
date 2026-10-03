import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Loader2, 
  Check, 
  Eye, 
  FileText, 
  Download, 
  BookOpen, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { Project, ChapterContent } from '../types';
import { saveProject } from '../utils/storage';
import { parseContentBlocks, cleanDuplicateHeading } from '../utils/contentParser';
import { exportToDocx, downloadDocxBlob } from '../utils/docxExport';
import { exportToPdf, downloadPdfBlob } from '../utils/pdfExport';

interface EditorViewProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onBack: () => void;
  onOpenPreview: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  project,
  onUpdateProject,
  onBack,
  onOpenPreview,
}) => {
  // activeSection: 'intro' | 'concl' | number (chapter index 0..N-1)
  const [activeSection, setActiveSection] = useState<string | number>(0);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // AI Rewrite State
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteMenuOpen, setRewriteMenuOpen] = useState(false);
  const [customPromptOpen, setCustomPromptOpen] = useState(false);
  const [customPromptText, setCustomPromptText] = useState('');

  // Editable local state
  const [introText, setIntroText] = useState(project.introduction);
  const [conclText, setConclText] = useState(project.conclusion);
  const [chapters, setChapters] = useState<ChapterContent[]>(project.chapters);

  const isWorkbook = project.productType === 'workbook';

  // Get current text and title based on active section
  let currentTitle = '';
  let currentGoal = '';
  let currentText = '';

  if (activeSection === 'intro') {
    currentTitle = 'PENDAHULUAN';
    currentGoal = 'Membuka buku, memberikan orientasi latar belakang, dan cara menggunakan panduan ini.';
    currentText = introText;
  } else if (activeSection === 'concl') {
    currentTitle = 'PENUTUP & LANGKAH SELANJUTNYA';
    currentGoal = 'Merangkum esensi dan mengarahkan pembaca untuk segera mengeksekusi rencana aksi nyata.';
    currentText = conclText;
  } else {
    const chIndex = typeof activeSection === 'number' ? activeSection : 0;
    const ch = chapters[chIndex];
    if (ch) {
      currentTitle = `Bab ${ch.number}: ${ch.title}`;
      const outlineItem = project.outline.find((o) => o.number === ch.number);
      currentGoal = outlineItem?.goal || '';
      currentText = ch.content;
    }
  }

  const handleTextChange = (newVal: string) => {
    if (activeSection === 'intro') {
      setIntroText(newVal);
    } else if (activeSection === 'concl') {
      setConclText(newVal);
    } else {
      const chIndex = typeof activeSection === 'number' ? activeSection : 0;
      const updated = [...chapters];
      updated[chIndex] = { ...updated[chIndex], content: newVal };
      setChapters(updated);
    }
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    const updatedProject: Project = {
      ...project,
      introduction: introText,
      conclusion: conclText,
      chapters,
      updatedAt: Date.now(),
    };

    saveProject(updatedProject);
    onUpdateProject(updatedProject);

    setTimeout(() => {
      setIsSaving(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    }, 400);
  };

  const handleAiRewrite = async (instruction: string, customInstruction?: string) => {
    setRewriteMenuOpen(false);
    setCustomPromptOpen(false);
    setIsRewriting(true);

    try {
      const res = await fetch('/api/ai/rewrite-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentText,
          instruction,
          customInstruction,
          chapterTitle: currentTitle,
          masterContext: project,
        }),
      });

      const data = await res.json();
      if (data.rewritten) {
        handleTextChange(data.rewritten);
      } else {
        throw new Error(data.error || 'Gagal merevisi tulisan');
      }
    } catch (e: any) {
      alert('Kendala AI: ' + (e.message || 'Gagal merevisi'));
    } finally {
      setIsRewriting(false);
    }
  };

  const handleQuickDownloadDocx = async () => {
    try {
      const blob = await exportToDocx(project);
      downloadDocxBlob(blob, project.title);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickDownloadPdf = async () => {
    try {
      const blob = await exportToPdf(project);
      downloadPdfBlob(blob, project.title);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Kembali ke Ringkasan"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-1">
              {project.title}
            </h2>
            <p className="text-xs text-gray-400">
              {isWorkbook ? 'Workbook Editor' : 'Ebook Editor'} &bull; Natural Writing Mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveToast && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Tersimpan!</span>
            </span>
          )}

          {/* Preview Toggle */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-bold text-gray-700">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'edit' ? 'bg-white shadow-xs text-gray-900' : 'hover:text-gray-900'
              }`}
            >
              Editor Teks
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'preview' ? 'bg-white shadow-xs text-gray-900' : 'hover:text-gray-900'
              }`}
            >
              Tampilan Rapi
            </button>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Simpan</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 overflow-hidden">
        {/* Left Sidebar: Navigation List */}
        <div className="md:col-span-4 lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 p-3 overflow-y-auto flex flex-col gap-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1.5">
            Daftar Bab & Materi
          </span>

          {/* Intro Button */}
          <button
            type="button"
            onClick={() => setActiveSection('intro')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'intro'
                ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pendahuluan
          </button>

          {/* Chapters */}
          {chapters.map((ch, idx) => {
            const isActive = activeSection === idx;
            return (
              <button
                key={ch.number}
                type="button"
                onClick={() => setActiveSection(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-start gap-2 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="w-4 h-4 rounded bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {ch.number}
                </span>
                <span className="truncate">{ch.title}</span>
              </button>
            );
          })}

          {/* Conclusion Button */}
          <button
            type="button"
            onClick={() => setActiveSection('concl')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'concl'
                ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Penutup & Rencana Aksi
          </button>

          {/* Quick Export in Sidebar */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleQuickDownloadDocx}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Unduh DOCX</span>
            </button>
            <button
              type="button"
              onClick={handleQuickDownloadPdf}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>
          </div>
        </div>

        {/* Right Area: Text Editor or Formatted Visual Preview */}
        <div className="md:col-span-8 lg:col-span-9 bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 flex flex-col overflow-hidden shadow-xs relative">
          {/* Chapter Header & AI Toolbar */}
          <div className="pb-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                {currentTitle}
              </h3>
              {currentGoal && (
                <p className="text-xs text-emerald-800 font-medium mt-0.5">
                  Tujuan: {currentGoal}
                </p>
              )}
            </div>

            {/* AI Rewrite Action Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRewriteMenuOpen(!rewriteMenuOpen)}
                disabled={isRewriting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRewriting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>Perbaiki Tulisan AI</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {rewriteMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-30 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => handleAiRewrite('more_natural')}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium"
                  >
                    Lebih Natural & Mengalir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiRewrite('more_concise')}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium"
                  >
                    Lebih Ringkas & To The Point
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiRewrite('more_clear')}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium"
                  >
                    Lebih Jelas & Mudah Dipahami
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiRewrite('more_examples')}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 font-medium"
                  >
                    Perkaya Contoh Praktis
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setRewriteMenuOpen(false);
                      setCustomPromptOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-emerald-800 hover:bg-emerald-50 font-bold"
                  >
                    Kustom Perintah...
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Custom Prompt Dialog if selected */}
          {customPromptOpen && (
            <div className="my-3 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-col gap-2">
              <label className="text-xs font-bold text-emerald-950">
                Instruksi Perbaikan Kustom:
              </label>
              <input
                type="text"
                value={customPromptText}
                onChange={(e) => setCustomPromptText(e.target.value)}
                placeholder="Contoh: Tambahkan tabel perbandingan dan analogi bisnis..."
                className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white outline-none"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setCustomPromptOpen(false)}
                  className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleAiRewrite('custom', customPromptText)}
                  className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
                >
                  Jalankan
                </button>
              </div>
            </div>
          )}

          {/* Content Area: Either Textarea or Formatted Preview */}
          <div className="flex-1 overflow-y-auto mt-4 pr-1">
            {viewMode === 'edit' ? (
              <textarea
                value={currentText}
                onChange={(e) => handleTextChange(e.target.value)}
                className="w-full h-full min-h-[360px] text-sm leading-relaxed p-4 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none font-mono resize-none"
                placeholder="Isi materi bab..."
              />
            ) : (
              <div className="max-w-none prose prose-emerald text-gray-800 space-y-4">
                {parseContentBlocks(cleanDuplicateHeading(currentText, currentTitle, 1)).map(
                  (block, bIdx) => {
                    if (block.type === 'heading2') {
                      return (
                        <h3 key={bIdx} className="text-lg font-bold text-gray-900 mt-6 mb-2">
                          {block.content}
                        </h3>
                      );
                    }
                    if (block.type === 'heading3') {
                      return (
                        <h4 key={bIdx} className="text-base font-bold text-gray-800 mt-4 mb-2">
                          {block.content}
                        </h4>
                      );
                    }
                    if (block.type === 'callout') {
                      return (
                        <div
                          key={bIdx}
                          className="my-3 p-4 rounded-xl bg-emerald-50/70 border-l-4 border-emerald-600 text-xs sm:text-sm text-gray-900"
                        >
                          <span className="font-extrabold text-emerald-800 uppercase tracking-wider block mb-1">
                            {block.title}
                          </span>
                          <div className="whitespace-pre-line leading-relaxed">
                            {block.content}
                          </div>
                        </div>
                      );
                    }
                    if (block.type === 'checklist' && block.items) {
                      return (
                        <div key={bIdx} className="my-3 space-y-1.5">
                          {block.items.map((it, iIdx) => (
                            <div key={iIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                              <span className="text-emerald-600 font-bold">□</span>
                              <span>{it}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    if (block.type === 'table' && block.tableData) {
                      return (
                        <div key={bIdx} className="my-4 overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-200 text-xs text-left">
                            <thead className="bg-emerald-50 text-emerald-950 font-bold">
                              <tr>
                                {block.tableData.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="p-2 border border-gray-200">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {block.tableData.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="even:bg-gray-50/50">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-2 border border-gray-200">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                    return (
                      <p key={bIdx} className="text-sm leading-relaxed whitespace-pre-line">
                        {block.content}
                      </p>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
