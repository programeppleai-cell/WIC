import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Check, CheckSquare, Square } from 'lucide-react';
import { Project, WritingStyle, WriterCharacter } from '../../types';

interface StepStyleProps {
  project: Project;
  onUpdate: (data: Partial<Project>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepStyle: React.FC<StepStyleProps> = ({
  project,
  onUpdate,
  onNext,
  onBack,
}) => {
  const isWorkbook = project.productType === 'workbook';

  const styles: { style: WritingStyle; label: string; desc: string }[] = [
    {
      style: 'Akrab & Hangat',
      label: 'Akrab & Hangat',
      desc: 'Nada ramah seperti berbicara dengan kawan dekat, menyenangkan dibaca.',
    },
    {
      style: 'Profesional',
      label: 'Profesional',
      desc: 'Terstruktur, objektif, kredibel, cocok untuk pasar bisnis/B2B.',
    },
    {
      style: 'Santai',
      label: 'Santai',
      desc: 'Luwes, mengalir, tanpa kekakuan formalitas yang berat.',
    },
    {
      style: 'Edukatif',
      label: 'Edukatif',
      desc: 'Fokus pada pemahaman langkah demi langkah, instruksi jelas.',
    },
    {
      style: 'Storytelling',
      label: 'Storytelling',
      desc: 'Menggunakan studi kasus, narasi pengalaman, dan contoh alur cerita.',
    },
    {
      style: 'Direct / To The Point',
      label: 'Direct / To The Point',
      desc: 'Langsung pada inti sari dan langkah aksi, tanpa basa-basi.',
    },
    {
      style: 'Custom',
      label: 'Kustom Sendiri',
      desc: 'Tentukan gaya tulisan spesifik sesuai keinginan Anda.',
    },
  ];

  const characters: { char: WriterCharacter; label: string; desc: string }[] = [
    {
      char: 'Teman Berpengalaman',
      label: 'Teman Berpengalaman',
      desc: 'Sudah pernah mencoba dan ingin berbagi jalan pintas yang berhasil.',
    },
    {
      char: 'Praktisi',
      label: 'Praktisi',
      desc: 'Fokus pada realitas lapangan, uji coba nyata, dan hasil teruji.',
    },
    {
      char: 'Mentor',
      label: 'Mentor',
      desc: 'Membimbing, mengarahkan, dan memberikan evaluasi konstruktif.',
    },
    {
      char: 'Guru',
      label: 'Guru',
      desc: 'Menjelaskan dari nol dengan kesabaran tinggi dan struktur rapi.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
      {/* Headings */}
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-2 inline-block">
          Langkah 6 dari 7
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
          Anda ingin {isWorkbook ? 'workbook' : 'ebook'} ini terdengar seperti apa?
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-2">
          Pilih gaya tulisan dan karakter penulis yang paling cocok untuk pembaca Anda.
        </p>
      </div>

      {/* Style Choices */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs mb-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
            Pilihan Gaya Tulisan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {styles.map((item) => {
              const isSelected = project.writingStyle === item.style;
              return (
                <div
                  key={item.style}
                  onClick={() => onUpdate({ writingStyle: item.style })}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-600'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm">{item.label}</span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {project.writingStyle === 'Custom' && (
            <div className="mt-3.5">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Jelaskan gaya tulisan yang Anda inginkan:
              </label>
              <textarea
                rows={2}
                value={project.customStyle || ''}
                onChange={(e) => onUpdate({ customStyle: e.target.value })}
                placeholder="Misalnya: Gaya semi-formal dengan analogi memasak dan analogi olahraga..."
                className="w-full text-xs p-3 rounded-lg border border-gray-300 focus:border-emerald-600 outline-none"
              />
            </div>
          )}
        </div>

        {/* Writer Character */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
            Karakter Penulis
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {characters.map((item) => {
              const isSelected = project.writerCharacter === item.char;
              return (
                <div
                  key={item.char}
                  onClick={() => onUpdate({ writerCharacter: item.char })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-600'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{item.label}</span>
                    {isSelected && (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-2 h-2 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-gray-500 leading-snug">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 Natural Writing & Quality Toggles */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Optimasi Kualitas Dokumen
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-800 select-none">
            <input
              type="checkbox"
              checked={project.hasManyExamples}
              onChange={(e) => onUpdate({ hasManyExamples: e.target.checked })}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span>Banyak contoh praktis & studi kasus konkret</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-800 select-none">
            <input
              type="checkbox"
              checked={project.isNaturalWriting}
              onChange={(e) => onUpdate({ isNaturalWriting: e.target.checked })}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span>Natural Writing (Alur mengalir, paragraf ramah layar HP, bebas bahasa kaku)</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-800 select-none">
            <input
              type="checkbox"
              checked={project.avoidGenericAi}
              onChange={(e) => onUpdate({ avoidGenericAi: e.target.checked })}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span>Hindari bahasa AI generik (&ldquo;Di era digital saat ini...&rdquo;, motivasi kosong)</span>
          </label>
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
          <span>Lanjut ke Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
