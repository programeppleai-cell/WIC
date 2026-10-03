import React from 'react';
import { ArrowLeft, Sparkles, Edit3, CheckCircle2, BookOpen, Layers } from 'lucide-react';
import { Project } from '../../types';

interface StepReviewProps {
  project: Project;
  onGoToStep: (step: number) => void;
  onStartGenerate: () => void;
  onBack: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  project,
  onGoToStep,
  onStartGenerate,
  onBack,
}) => {
  const isWorkbook = project.productType === 'workbook';

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
      {/* Headings */}
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-2 inline-block">
          Langkah 7 dari 7
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
          Periksa sebelum {isWorkbook ? 'workbook' : 'ebook'} dibuat
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-2">
          Pastikan semua informasi sudah sesuai. Anda dapat mengubah bagian mana pun sebelum mulai proses pembuatan.
        </p>
      </div>

      {/* Summary Container */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs mb-6 space-y-4">
        {/* Product Type */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
              Format Dokumen
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isWorkbook ? (
                <Layers className="w-4 h-4 text-teal-600" />
              ) : (
                <BookOpen className="w-4 h-4 text-emerald-600" />
              )}
              <span className="font-extrabold text-gray-900 text-sm">
                {isWorkbook ? 'WORKBOOK (Buku Kerja & Action Plan)' : 'EBOOK (Panduan Terstruktur)'}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-start justify-between py-2 border-b border-gray-100">
          <div className="pr-4">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
              Judul
            </span>
            <p className="font-bold text-gray-900 text-sm sm:text-base mt-0.5">
              {project.title}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(1)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Description */}
        <div className="flex items-start justify-between py-2 border-b border-gray-100">
          <div className="pr-4">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
              Deskripsi / Konsep
            </span>
            <p className="text-xs sm:text-sm text-gray-700 mt-0.5 leading-relaxed line-clamp-3">
              {project.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Author & Brand */}
        <div className="flex items-start justify-between py-2 border-b border-gray-100">
          <div className="pr-4">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
              Penulis & Brand
            </span>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {project.author || 'Penulis'} &bull; {project.brand || 'Worth It Circle'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(3)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Target & Level */}
        <div className="flex items-start justify-between py-2 border-b border-gray-100">
          <div className="pr-4">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
              Target & Level
            </span>
            <p className="text-xs text-gray-800 mt-0.5">
              <strong>Sasaran:</strong> {project.targetAudience}
            </p>
            <p className="text-xs text-gray-800 mt-0.5">
              <strong>Level:</strong> {project.readerLevel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(4)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Style & Character */}
        <div className="flex items-start justify-between py-2 border-b border-gray-100">
          <div className="pr-4">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
              Gaya & Karakter Tulisan
            </span>
            <p className="text-xs text-gray-800 mt-0.5">
              Gaya: <strong>{project.writingStyle}</strong> &bull; Karakter: <strong>{project.writerCharacter}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onGoToStep(6)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Chapters Outline */}
        <div className="py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
              Struktur Bab ({project.outline.length} Bab)
            </span>
            <button
              type="button"
              onClick={() => onGoToStep(5)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Bab</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {project.outline.map((ch) => (
              <div
                key={ch.number}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 text-xs text-gray-800"
              >
                <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center shrink-0 text-[10px]">
                  {ch.number}
                </span>
                <span className="font-semibold truncate">{ch.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Action Generate Button */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg mb-6 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl sm:text-2xl font-black mb-2">
            Siap Menghasilkan {isWorkbook ? 'Workbook' : 'Ebook'}?
          </h3>
          <p className="text-emerald-200/80 text-xs sm:text-sm max-w-md mx-auto mb-6">
            Sistem akan menulis setiap bab secara berurutan, menjaga kesinambungan materi, dan menyematkan format terstruktur.
          </p>

          <button
            type="button"
            onClick={onStartGenerate}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-base rounded-xl transition-all shadow-md hover:scale-[1.02] cursor-pointer inline-flex items-center justify-center gap-2.5"
          >
            <Sparkles className="w-5 h-5" />
            <span>
              {isWorkbook ? 'BUAT WORKBOOK SEKARANG' : 'BUAT EBOOK SEKARANG'}
            </span>
          </button>
        </div>
      </div>

      {/* Back button */}
      <div className="flex items-center justify-start">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
      </div>
    </div>
  );
};
