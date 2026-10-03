import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Project, ChapterOutline } from '../../types';

interface StepChaptersProps {
  project: Project;
  onUpdate: (data: Partial<Project>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepChapters: React.FC<StepChaptersProps> = ({
  project,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isWorkbook = project.productType === 'workbook';

  // Automatically generate outline if empty
  useEffect(() => {
    if (project.outline.length === 0 && !loadingAi) {
      handleGenerateOutline(project.chapterCountChoice, project.customChapterCount);
    }
  }, []);

  const handleGenerateOutline = async (
    choice: Project['chapterCountChoice'],
    customCount?: number
  ) => {
    setLoadingAi(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: project.productType,
          title: project.title,
          description: project.description,
          author: project.author,
          brand: project.brand,
          targetAudience: project.targetAudience,
          readerGoal: project.readerGoal,
          readerLevel: project.readerLevel,
          chapterCountChoice: choice,
          customChapterCount: customCount,
        }),
      });

      const data = await res.json();
      if (data.outline && Array.isArray(data.outline)) {
        onUpdate({
          chapterCountChoice: choice,
          customChapterCount: customCount,
          outline: data.outline,
        });
      } else {
        throw new Error(data.error || 'Gagal menyusun outline');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Terjadi kesalahan saat menyusun outline');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleRegenerateSingle = async (index: number) => {
    const chapter = project.outline[index];
    if (!chapter) return;

    setRegeneratingIndex(index);
    try {
      const res = await fetch('/api/ai/regenerate-chapter-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterNumber: chapter.number,
          currentChapter: chapter,
          masterContext: project,
        }),
      });

      const data = await res.json();
      if (data.title) {
        const updated = [...project.outline];
        updated[index] = {
          ...chapter,
          title: data.title,
          goal: data.goal || chapter.goal,
        };
        onUpdate({ outline: updated });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleChapterTitleChange = (index: number, newTitle: string) => {
    const updated = [...project.outline];
    updated[index] = { ...updated[index], title: newTitle };
    onUpdate({ outline: updated });
  };

  const handleChapterGoalChange = (index: number, newGoal: string) => {
    const updated = [...project.outline];
    updated[index] = { ...updated[index], goal: newGoal };
    onUpdate({ outline: updated });
  };

  const handleAddChapter = () => {
    const nextNum = project.outline.length + 1;
    const newChapter: ChapterOutline = {
      number: nextNum,
      title: `Bab ${nextNum}: Topik Tambahan`,
      goal: `Membantu pembaca mempraktikkan materi di bab ini.`,
    };
    onUpdate({ outline: [...project.outline, newChapter] });
  };

  const handleDeleteChapter = (index: number) => {
    if (project.outline.length <= 2) {
      alert('Dokumen minimal memerlukan 2 bab.');
      return;
    }
    const filtered = project.outline.filter((_, i) => i !== index);
    const reindexed = filtered.map((ch, idx) => ({
      ...ch,
      number: idx + 1,
    }));
    onUpdate({ outline: reindexed });
  };

  const handleMoveChapter = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= project.outline.length) return;

    const list = [...project.outline];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const reindexed = list.map((ch, idx) => ({
      ...ch,
      number: idx + 1,
    }));
    onUpdate({ outline: reindexed });
  };

  const canProceed = project.outline.length >= 2;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 animate-fade-in">
      {/* Headings */}
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-2 inline-block">
          Langkah 5 dari 7
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
          Berapa banyak bab yang Anda inginkan?
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-2">
          Pilih jumlah bab, lalu AI akan menyusunkan alur terstruktur yang siap Anda sesuaikan.
        </p>
      </div>

      {/* Chapter Count Selector Tabs */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(['5', '7', '10', 'ai', 'custom'] as const).map((choice) => {
            const isSelected = project.chapterCountChoice === choice;
            let label = `${choice} Bab`;
            if (choice === 'ai') label = 'AI Tentukan';
            if (choice === 'custom') label = 'Custom';

            return (
              <button
                key={choice}
                type="button"
                onClick={() => {
                  onUpdate({ chapterCountChoice: choice });
                  handleGenerateOutline(choice, project.customChapterCount);
                }}
                disabled={loadingAi}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}

          {project.chapterCountChoice === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="number"
                min={3}
                max={15}
                value={project.customChapterCount || 7}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 5;
                  onUpdate({ customChapterCount: val });
                }}
                className="w-16 p-1.5 text-center text-xs font-bold border rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleGenerateOutline('custom', project.customChapterCount)}
                className="px-2.5 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-black"
              >
                Set
              </button>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-3 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => handleGenerateOutline(project.chapterCountChoice, project.customChapterCount)}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Coba Susun Lagi</span>
            </button>
          </div>
        )}
      </div>

      {/* Chapters Outline List */}
      <div className="space-y-3.5 mb-6">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Daftar Bab & Tujuan ({project.outline.length} Bab)
          </span>

          <button
            type="button"
            onClick={() => handleGenerateOutline(project.chapterCountChoice, project.customChapterCount)}
            disabled={loadingAi}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Susun Ulang Semua Bab</span>
          </button>
        </div>

        {loadingAi && project.outline.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-900">Menyusun outline terstruktur dengan AI...</p>
            <p className="text-xs text-gray-500 mt-1">
              Menyesuaikan topik {isWorkbook ? 'lembar kerja' : 'ebook'} Anda
            </p>
          </div>
        ) : (
          project.outline.map((chapter, idx) => {
            const isRegen = regeneratingIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-extrabold flex items-center justify-center shrink-0">
                      {chapter.number.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Bab {chapter.number}
                    </span>
                  </div>

                  {/* Reorder and Delete Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleRegenerateSingle(idx)}
                      disabled={isRegen}
                      className="p-1.5 text-gray-400 hover:text-emerald-700 rounded hover:bg-emerald-50 transition-colors"
                      title="Regenerate Bab Ini dengan AI"
                    >
                      {isRegen ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveChapter(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors disabled:opacity-30"
                      title="Geser ke Atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveChapter(idx, 'down')}
                      disabled={idx === project.outline.length - 1}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors disabled:opacity-30"
                      title="Geser ke Bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteChapter(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                      title="Hapus Bab"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Chapter Title Edit */}
                <div>
                  <input
                    type="text"
                    value={chapter.title}
                    onChange={(e) => handleChapterTitleChange(idx, e.target.value)}
                    className="w-full text-sm sm:text-base font-bold text-gray-900 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 focus:border-emerald-600 focus:bg-white bg-gray-50/50 outline-none transition-all"
                  />
                </div>

                {/* Chapter Goal Edit */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide shrink-0">
                    Tujuan:
                  </span>
                  <input
                    type="text"
                    value={chapter.goal}
                    onChange={(e) => handleChapterGoalChange(idx, e.target.value)}
                    placeholder="Tujuan bab ini bagi pembaca..."
                    className="w-full text-xs text-gray-600 px-2 py-1 rounded border border-transparent hover:border-gray-200 focus:border-emerald-600 bg-transparent outline-none transition-all"
                  />
                </div>
              </div>
            );
          })
        )}

        {/* Add Chapter Button */}
        <button
          type="button"
          onClick={handleAddChapter}
          className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-emerald-600 text-gray-600 hover:text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer bg-white"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Bab Baru</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed || loadingAi}
          className="inline-flex items-center gap-1.5 px-7 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black transition-colors shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Gunakan Struktur Ini</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
