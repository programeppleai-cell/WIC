import React from 'react';
import { ArrowLeft, ArrowRight, Target, Compass, Sparkles } from 'lucide-react';
import { Project, ReaderLevel } from '../../types';

interface StepTargetGoalProps {
  project: Project;
  onUpdate: (data: Partial<Project>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepTargetGoal: React.FC<StepTargetGoalProps> = ({
  project,
  onUpdate,
  onNext,
  onBack,
}) => {
  const isWorkbook = project.productType === 'workbook';

  const levels: { level: ReaderLevel; label: string; desc: string }[] = [
    {
      level: 'Pemula',
      label: 'Pemula',
      desc: 'Penjelasan dasar, ramah untuk yang baru memulai, tanpa jargon rumit.',
    },
    {
      level: 'Menengah',
      label: 'Menengah',
      desc: 'Sudah paham dasar, fokus pada strategi taktis dan optimasi.',
    },
    {
      level: 'Mahir',
      label: 'Mahir',
      desc: 'Topik lanjutan, detail teknis, dan skalabilitas tinggi.',
    },
  ];

  const canProceed =
    project.targetAudience.trim().length > 0 && project.readerGoal.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
      {/* Headings */}
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md mb-2 inline-block">
          Langkah 4 dari 7
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
          Siapa pembacanya dan apa hasil yang ingin dicapai?
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-2">
          Dua hal ini membantu AI menulis dengan sudut pandang yang tepat sasaran dan relevan.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs mb-6 space-y-6">
        {/* Target Pembaca */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Target Pembaca
          </label>
          <textarea
            rows={2}
            value={project.targetAudience}
            onChange={(e) => onUpdate({ targetAudience: e.target.value })}
            placeholder="Karyawan usia 35–50 tahun yang ingin mencari penghasilan tambahan tetapi masih pemula dalam membuat produk digital."
            className="w-full text-sm sm:text-base p-3.5 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Tujuan */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Tujuan {isWorkbook ? 'Workbook' : 'Ebook'} (Hasil Akhir Pembaca)
          </label>
          <textarea
            rows={2}
            value={project.readerGoal}
            onChange={(e) => onUpdate({ readerGoal: e.target.value })}
            placeholder={
              isWorkbook
                ? 'Setelah mengisi lembar kerja ini, pembaca memiliki outline, bab pertama, dan daftar aksi nyata yang siap dieksekusi.'
                : 'Setelah membaca ebook, pembaca mampu menentukan ide, menyusun, dan menyelesaikan ebook pertama yang siap diuji untuk dijual.'
            }
            className="w-full text-sm sm:text-base p-3.5 rounded-xl border border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Level Pembaca */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
            Tingkat Pemahaman Pembaca
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {levels.map((item) => {
              const isSelected = project.readerLevel === item.level;
              return (
                <div
                  key={item.level}
                  onClick={() => onUpdate({ readerLevel: item.level })}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-600'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-sm">{item.label}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">{item.desc}</p>
                </div>
              );
            })}
          </div>
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
