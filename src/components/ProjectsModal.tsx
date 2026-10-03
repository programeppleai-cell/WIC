import React from 'react';
import { X, BookOpen, Layers, Plus, Trash2, Copy, Clock, ExternalLink } from 'lucide-react';
import { Project } from '../types';

interface ProjectsModalProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (p: Project) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onDuplicate,
  onDelete,
  onNew,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">
              Daftar Dokumen Saya
            </h3>
            <p className="text-xs text-gray-500">
              Tersimpan aman di penyimpanan browser lokal Anda ({projects.length} dokumen)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNew();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gray-900 hover:bg-black transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Project Baru</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {projects.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">Belum ada dokumen yang tersimpan.</p>
              <p className="text-xs mt-1">Mulai buat ebook atau workbook pertama Anda!</p>
            </div>
          ) : (
            projects.map((p) => {
              const isCurrent = p.id === activeProjectId;
              const isWb = p.productType === 'workbook';

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      {isWb ? <Layers className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                          {isWb ? 'Workbook' : 'Ebook'}
                        </span>
                        {p.status === 'completed' && (
                          <span className="text-[10px] font-bold text-green-800 bg-green-100 px-1.5 py-0.2 rounded">
                            Selesai
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 truncate">
                        {p.title || 'Draft Tanpa Judul'}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(p.updatedAt).toLocaleDateString('id-ID')}
                        </span>
                        <span>&bull;</span>
                        <span>{p.chapters?.length || p.outline?.length || 0} Bab</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onDuplicate(p.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Duplikat"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus dokumen "${p.title || 'Draft'}"?`)) {
                          onDelete(p.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
