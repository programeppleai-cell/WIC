import React, { useState } from 'react';
import { Sparkles, ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react';
import { Project } from '../../types';

interface StepTitleProps {
  project: Project;
  onUpdate: (data: Partial<Project>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepTitle: React.FC<StepTitleProps> = ({
  project,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isWorkbook = project.productType === 'workbook';

  const handleImproveTitle = async () => {
    if (!project.title.trim()) {
      setErrorMessage('Ketikkan judul awal terlebih dahulu sebelum meminta perbaikan AI.');
      return;
    }
    setErrorMessage(null);
    setLoadingAi(true);

    try {
      const res = await fetch('/api/ai/improve-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          productType: project.productType,
          description: project.description,
        }),
      });

      const data = await res.json();
      if (data.titles && Array.isArray(data.titles)) {
        setSuggestions(data.titles);
      } else {
        throw new Error(data.error || 'Gagal menghasilkan judul');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Koneksi ke AI bermasalah, silakan coba lagi.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    onUpdate({ title: suggestion });
  };

  const canProceed = project.title.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
      {/* Headings */}
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-2 inline-block">
          Langkah 1 dari 7
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
          Judul {isWorkbook ? 'workbook' : 'ebook'} Anda apa?
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-2">
          Masukkan judul yang sudah Anda miliki. Judul masih dapat diperbaiki nanti.
        </p>
      </div>

      {/* Main Input */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
          Judul {isWorkbook ? 'Workbook' : 'Ebook'}
        </label>

        <textarea
          rows={3}
          value={project.title}
          onChange={(e) => {
            onUpdate({ title: e.target.value });
            setErrorMessage(null);
          }}
          placeholder={
            isWorkbook
              ? 'Workbook Aksi: 30 Hari Membangun Produk Digital Pertama'
              : 'Panduan Membuat Ebook Pertama untuk Karyawan Usia 40+'
          }
          className="w-full text-base sm:text-lg font-medium p-4 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
        />

        {/* AI Improve Title Button */}
        <div className="mt-3.5 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={handleImproveTitle}
            disabled={loadingAi}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer disabled:opacity-60"
          >
            {loadingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            )}
            <span>Perbaiki Judul dengan AI</span>
          </button>

          <span className="text-[11px] text-gray-400 italic">
            *AI memberikan 3 alternatif tanpa mengganti otomatis
          </span>
        </div>

        {errorMessage && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
            {errorMessage}
          </p>
        )}

        {/* AI Suggestions Pill / Cards */}
        {suggestions.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <span className="block text-xs font-bold text-gray-700 mb-2.5">
              Pilih alternatif judul rekomendasi AI (atau pertahankan judul awal Anda):
            </span>
            <div className="space-y-2">
              {suggestions.map((sug, idx) => {
                const isSelected = selectedSuggestion === sug || project.title === sug;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectSuggestion(sug)}
                    className={`p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold ring-1 ring-emerald-600'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 text-gray-800'
                    }`}
                  >
                    <span>{sug}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
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
          disabled={!canProceed}
          className="inline-flex items-center gap-1.5 px-7 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black transition-colors shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Lanjut</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
