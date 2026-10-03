import React from 'react';
import { WicLogo } from './WicLogo';
import { BookOpen, Layers, ArrowRight, Clock, Trash2, Copy, Sparkles } from 'lucide-react';
import { Project } from '../types';

interface HomeViewProps {
  onSelectProductType: (type: 'ebook' | 'workbook') => void;
  savedProjects: Project[];
  onOpenProject: (project: Project) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectProductType,
  savedProjects,
  onOpenProject,
  onDuplicateProject,
  onDeleteProject,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-3.5 mb-4 p-2 pr-5 rounded-full bg-white border border-gray-200/80 shadow-xs">
          <WicLogo size={48} className="drop-shadow-sm" />
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 font-['Plus_Jakarta_Sans',sans-serif]">
              WIC EBOOK GENERATOR
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-emerald-800 italic">
              &ldquo;Ide tulisan jadi uang&rdquo;
            </p>
          </div>
        </div>

        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mt-2 font-normal">
          Ubah konsep yang sudah Anda miliki menjadi ebook atau workbook yang terstruktur dan siap digunakan.
        </p>
      </div>

      {/* Two Big Cards: EBOOK vs WORKBOOK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* CARD 1: EBOOK */}
        <div
          onClick={() => onSelectProductType('ebook')}
          className="group relative bg-white rounded-2xl p-7 sm:p-8 border-2 border-gray-200 hover:border-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                EBOOK
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Paling Populer
              </span>
            </div>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
              Panduan, edukasi, tutorial, atau buku praktis.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-emerald-800 font-bold text-sm group-hover:text-emerald-700">
            <span>Mulai Buat Ebook</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* CARD 2: WORKBOOK */}
        <div
          onClick={() => onSelectProductType('workbook')}
          className="group relative bg-white rounded-2xl p-7 sm:p-8 border-2 border-gray-200 hover:border-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Layers className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                WORKBOOK
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Action-Oriented
              </span>
            </div>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
              Worksheet, latihan, checklist, assessment, dan action plan.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-teal-800 font-bold text-sm group-hover:text-teal-700">
            <span>Mulai Buat Workbook</span>
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Philosophy banner: Satu layar = satu keputusan */}
      <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4 sm:p-5 mb-14 flex items-start gap-3.5">
        <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-emerald-950">
          <span className="font-bold">Prinsip Produksi WIC:</span> Masukkan konsep Anda &rarr; Susun struktur bab &rarr; Tulis dengan Natural Writing Engine &rarr; Rapikan & Hasilkan produk siap download (DOCX & PDF). Bebas login, tersimpan otomatis di perangkat Anda.
        </div>
      </div>

      {/* Saved Projects Section */}
      {savedProjects.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Project Saya</h3>
              <p className="text-xs text-gray-500">Tersimpan otomatis di browser ini</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
              {savedProjects.length} Dokumen
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedProjects.map((proj) => {
              const isWb = proj.productType === 'workbook';
              return (
                <div
                  key={proj.id}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200/80 hover:border-gray-300 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isWb ? 'bg-teal-100 text-teal-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isWb ? 'Workbook' : 'Ebook'}
                      </span>
                      {proj.status === 'completed' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-800">
                          Selesai
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
                      {proj.title || 'Draft Tanpa Judul'}
                    </h4>

                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {proj.description || 'Belum ada deskripsi'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(proj.updatedAt).toLocaleDateString('id-ID')}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateProject(proj.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                        title="Duplikat Project"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Hapus project "${proj.title || 'Draft'}"?`)) {
                            onDeleteProject(proj.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Hapus Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenProject(proj)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-black transition-colors"
                      >
                        Buka
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
