import React, { useState } from 'react';
import { Sparkles, ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react';
import { Project } from '../../types';

interface StepDescriptionProps {
  project: Project;
  onUpdate: (data: Partial<Project>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepDescription: React.FC<StepDescriptionProps> = ({
  project,
  onUpdate,
  onNext,
  onBack,
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [polishedText, setPolishedText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isWorkbook = project.productType === 'workbook';

  const handlePolishDescription = async () => {
    if (!project.description.trim()) {
      setErrorMessage('Ketikkan gambaran konsep terlebih dahulu.');
      return;
    }
    setErrorMessage(null);
    setLoadingAi(true);

    try {
      const res = await fetch('/api/ai/polish-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: project.description,
          title: project.title,
          productType: project.productType,
        }),
      });

      const data = await res.json();
      if (data.polished) {
        setPolishedText(data.polished);
      } else {
        throw new Error(data.error || 'Gagal merapikan deskripsi');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Koneksi ke AI bermasalah, silakan coba lagi.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleApplyPolished = () => {
    if (polishedText) {
      onUpdate({ description: polishedText });
      setPolishedText(null);
    }
  };

  const canProceed = project.description.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
      {/* Headings */}
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-2 inline-block">
          Langkah 2 dari 7
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
          {isWorkbook ? 'Workbook' : 'Ebook'} ini membahas apa?
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-2">
          Jelaskan konsepnya dengan bahasa sederhana. AI akan menggunakannya sebagai konteks utama.
        </p>
      </div>

      {/* Main Input */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
          Konsep & Ringkasan Topik
        </label>

        <textarea
          rows={5}
          value={project.description}
          onChange={(e) => {
            onUpdate({ description: e.target.value });
            setErrorMessage(null);
          }}
          placeholder="Panduan bagi karyawan usia 40 tahun yang ingin mencoba mendapatkan penghasilan tambahan dengan membuat dan menjual ebook berdasarkan pengalaman atau pengetahuan yang sudah dimiliki."
          className="w-full text-base p-4 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-400 leading-relaxed"
        />

        {/* AI Polish Button */}
        <div className="mt-3.5 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePolishDescription}
            disabled={loadingAi}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer disabled:opacity-60"
          >
            {loadingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            )}
            <span>Rapikan Deskripsi</span>
          </button>

          <span className="text-[11px] text-gray-400 italic">
            *AI memperjelas tanpa mengubah inti pesan Anda
          </span>
        </div>

        {errorMessage && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
            {errorMessage}
          </p>
        )}

        {/* Polished Preview Box */}
        {polishedText && (
          <div className="mt-5 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="block text-xs font-bold text-emerald-900 mb-1.5">
              Hasil Deskripsi yang Dirapikan AI:
            </span>
            <p className="text-sm text-emerald-950 leading-relaxed mb-3 italic">
              &ldquo;{polishedText}&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyPolished}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Gunakan Versi Ini</span>
              </button>
              <button
                type="button"
                onClick={() => setPolishedText(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-emerald-100/60 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}
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
