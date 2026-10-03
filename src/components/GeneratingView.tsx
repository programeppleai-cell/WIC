import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import { Project, ChapterContent } from '../types';
import { saveProject } from '../utils/storage';

interface GeneratingViewProps {
  project: Project;
  onComplete: (updatedProject: Project) => void;
  onCancel: () => void;
}

export const GeneratingView: React.FC<GeneratingViewProps> = ({
  project,
  onComplete,
  onCancel,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<ChapterContent[]>([]);
  const [summaries, setSummaries] = useState<string[]>([]);
  const [failedChapterIndex, setFailedChapterIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  // Prevent multiple simultaneous loops
  const isRunningRef = useRef(false);

  const totalChapters = project.outline.length;
  // Steps: 0 = Intro/Conclusion, 1..N = Chapters, N+1 = Finalizing
  const totalSteps = totalChapters + 2;

  useEffect(() => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      runGenerationLoop();
    }
  }, []);

  const runGenerationLoop = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setFailedChapterIndex(null);

    let intro = project.introduction;
    let concl = project.conclusion;
    const chaptersList: ChapterContent[] = [...completedChapters];
    const summariesList: string[] = [...summaries];

    // Step 0: Generate Intro & Conclusion if not yet generated
    if (!intro || !concl) {
      try {
        setCurrentStepIndex(0);
        const res = await fetch('/api/ai/generate-book-ends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ masterContext: project }),
        });
        const data = await res.json();
        intro = data.introduction || 'Pendahuluan buku ini dibuat untuk memandu Anda.';
        concl = data.conclusion || 'Selamat, Anda telah menyelesaikan seluruh isi materi.';
      } catch (e: any) {
        console.warn('Fallback intro/concl generation', e);
        intro = 'Selamat datang di panduan ini.';
        concl = 'Terima kasih telah membaca hingga akhir.';
      }
    }

    // Chapters Generation Loop (Sequential for chaining consistency)
    const startIndex = chaptersList.length;
    for (let i = startIndex; i < totalChapters; i++) {
      setCurrentStepIndex(i + 1);
      const chapterOutline = project.outline[i];

      const payload = {
        masterContext: {
          ...project,
          previousChapterSummaries: summariesList,
        },
        chapterIndex: i,
      };

      let chapterData: any = null;
      let lastErr: any = null;

      // Try up to 2 times automatically before showing error state
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await fetch('/api/ai/generate-chapter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Gagal menghasilkan Bab ${chapterOutline.number}`);
          }

          chapterData = await res.json();
          if (chapterData && (chapterData.content || chapterData.summary)) {
            break;
          }
        } catch (err: any) {
          lastErr = err;
          console.warn(`Attempt ${attempt} for chapter ${chapterOutline.number} failed:`, err);
          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 1200));
          }
        }
      }

      if (!chapterData) {
        console.error('Error generating chapter', i, lastErr);
        setFailedChapterIndex(i);
        setErrorMessage(lastErr?.message || `Gagal menulis Bab ${chapterOutline.number}. Silakan klik coba lagi.`);
        setIsProcessing(false);
        isRunningRef.current = false;
        return;
      }

      const newChapter: ChapterContent = {
        number: chapterOutline.number,
        title: chapterOutline.title,
        content: chapterData.content || '',
        summary: chapterData.summary || '',
      };

      chaptersList.push(newChapter);
      summariesList.push(chapterData.summary || `Bab ${chapterOutline.number} selesai dibahas.`);

      setCompletedChapters([...chaptersList]);
      setSummaries([...summariesList]);

      // Auto-save intermediate progress so no chapter is lost
      saveProject({
        ...project,
        introduction: intro,
        chapters: chaptersList,
        conclusion: concl,
      });
    }

    // Final Step: Complete!
    setCurrentStepIndex(totalSteps);
    setIsProcessing(false);
    isRunningRef.current = false;

    const completedProject: Project = {
      ...project,
      introduction: intro,
      chapters: chaptersList,
      conclusion: concl,
      status: 'completed',
      updatedAt: Date.now(),
    };

    saveProject(completedProject);
    onComplete(completedProject);
  };

  const handleRetryChapter = () => {
    isRunningRef.current = false;
    runGenerationLoop();
  };

  const progressPercent = Math.min(
    Math.round(((completedChapters.length + (currentStepIndex > 0 ? 0.5 : 0)) / totalSteps) * 100),
    100
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 relative">
          <BookOpen className="w-8 h-8" />
          {isProcessing && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 animate-ping" />
          )}
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-gray-950 mb-1">
          {project.productType === 'workbook' ? 'Menulis Workbook Anda' : 'Menulis Ebook Anda'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-6 font-medium">
          Natural Writing Engine &bull; Menjaga kesinambungan materi antar bab
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-emerald-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Items List */}
        <div className="text-left space-y-2.5 max-h-72 overflow-y-auto pr-1 mb-6">
          {/* Step 0: Structure & Intro */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-xs font-medium border border-gray-100">
            <span className="truncate">Menyiapkan struktur, pendahuluan & hak cipta</span>
            {currentStepIndex > 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
            )}
          </div>

          {/* Chapters */}
          {project.outline.map((ch, idx) => {
            const isDone = idx < completedChapters.length;
            const isCurrent = idx === completedChapters.length && isProcessing;
            const isFailed = failedChapterIndex === idx;

            return (
              <div
                key={ch.number}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium border transition-all ${
                  isFailed
                    ? 'bg-red-50 text-red-900 border-red-200'
                    : isCurrent
                    ? 'bg-emerald-50/70 text-emerald-950 border-emerald-300 ring-1 ring-emerald-300'
                    : isDone
                    ? 'bg-gray-50 text-gray-800 border-gray-100'
                    : 'bg-white text-gray-400 border-gray-100'
                }`}
              >
                <span className="truncate pr-2">
                  Bab {ch.number}: {ch.title}
                </span>

                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                ) : isFailed ? (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                )}
              </div>
            );
          })}

          {/* Step Final: Finishing */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 text-xs font-medium border border-gray-100">
            <span className="truncate">Merapikan kesinambungan & penutup</span>
            {currentStepIndex >= totalSteps ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : completedChapters.length === totalChapters ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
            )}
          </div>
        </div>

        {/* Error Handling with Retry */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-left">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-900 mb-1">Terjadi Kendala Jaringan</p>
                <p className="text-xs text-red-700 leading-relaxed mb-2.5">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleRetryChapter}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Coba Lagi Bab Ini</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-gray-700 underline font-medium cursor-pointer"
          >
            Batalkan dan kembali ke wizard
          </button>
        </div>
      </div>
    </div>
  );
};
