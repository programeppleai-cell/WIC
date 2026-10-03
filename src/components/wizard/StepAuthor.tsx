import React from 'react';
import { ArrowLeft, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { Project } from '../../types';

interface StepAuthorProps {
  project: Project;
  onUpdate: (data: Partial<Project>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepAuthor: React.FC<StepAuthorProps> = ({
  project,
  onUpdate,
  onNext,
  onBack,
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
      {/* Headings */}
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-2 inline-block">
          Langkah 3 dari 7
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
          Siapa nama penulisnya?
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-2">
          Bisa nama asli, nama pena, atau nama brand Anda. Digunakan pada halaman judul dan hak cipta.
        </p>
      </div>

      {/* Inputs Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs mb-6 space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Nama Penulis / Kreator <span className="text-gray-400 font-normal">(Opsional)</span>
          </label>
          <input
            type="text"
            value={project.author}
            onChange={(e) => onUpdate({ author: e.target.value })}
            placeholder="Momy Epple"
            className="w-full text-base p-3.5 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-400"
          />
          <p className="text-[11px] text-gray-400 mt-1.5">
            Jika dikosongkan, dokumen akan menggunakan identitas &ldquo;Penulis&rdquo;.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Nama Brand / Komunitas / Penerbit <span className="text-gray-400 font-normal">(Opsional)</span>
          </label>
          <input
            type="text"
            value={project.brand}
            onChange={(e) => onUpdate({ brand: e.target.value })}
            placeholder="Worth It Circle"
            className="w-full text-base p-3.5 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-400"
          />
          <p className="text-[11px] text-gray-400 mt-1.5">
            Default: Worth It Circle. Anda bebas menggantinya dengan brand bisnis Anda.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/70 flex items-center gap-3 text-xs text-gray-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Hak Cipta otomatis mencantumkan tahun <strong>{new Date().getFullYear()}</strong> dengan klausul perlindungan karya digital Indonesia.
          </span>
        </div>
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
          className="inline-flex items-center gap-1.5 px-7 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-black transition-colors shadow-xs cursor-pointer"
        >
          <span>Lanjut</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
