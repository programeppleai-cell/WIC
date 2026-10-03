import React, { useState } from 'react';
import { X, Download, FileText, Loader2, BookOpen, Layers } from 'lucide-react';
import { Project } from '../types';
import { parseContentBlocks, cleanDuplicateHeading } from '../utils/contentParser';
import { exportToDocx, downloadDocxBlob } from '../utils/docxExport';
import { exportToPdf, downloadPdfBlob } from '../utils/pdfExport';

interface PreviewModalProps {
  project: Project;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ project, onClose }) => {
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const isWorkbook = project.productType === 'workbook';
  const authorName = project.author || 'Penulis';
  const brandName = project.brand || 'Worth It Circle';

  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      const blob = await exportToDocx(project);
      downloadDocxBlob(blob, project.title);
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const blob = await exportToPdf(project);
      downloadPdfBlob(blob, project.title);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2">
            {isWorkbook ? (
              <Layers className="w-4 h-4 text-emerald-600" />
            ) : (
              <BookOpen className="w-4 h-4 text-emerald-600" />
            )}
            <span className="font-bold text-sm text-gray-900 line-clamp-1">
              Pratinjau Dokumen: {project.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {downloadingDocx ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
              <span>DOCX</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {downloadingPdf ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 bg-gray-100/60 font-serif">
          <div className="max-w-2xl mx-auto bg-white p-8 sm:p-14 rounded-xl shadow-sm border border-gray-200 space-y-12 text-gray-900 leading-relaxed">
            {/* 1. COVER PREVIEW */}
            {project.coverImage && (
              <div className="w-full aspect-[3/4] max-w-sm mx-auto rounded-xl overflow-hidden shadow-md mb-12">
                <img
                  src={project.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* 2. TITLE PAGE */}
            <div className="text-center py-12 border-b border-gray-200 space-y-4 font-sans">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block">
                {isWorkbook ? 'WORKBOOK & ACTION PLAN' : 'PANDUAN PRAKTIS DIGITAL'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 leading-tight">
                {project.title}
              </h1>
              <p className="text-sm text-gray-500 italic max-w-md mx-auto">
                {project.description}
              </p>
              <div className="pt-8">
                <p className="text-sm font-bold text-gray-800">{authorName}</p>
                <p className="text-xs text-emerald-800 font-semibold">{brandName}</p>
              </div>
            </div>

            {/* 3. COPYRIGHT & DISCLAIMER */}
            <div className="py-6 border-b border-gray-200 text-xs text-gray-600 space-y-3 font-sans">
              <h4 className="font-bold text-gray-800 uppercase tracking-wide">
                Hak Cipta & Sanggahan
              </h4>
              <p>
                Hak Cipta &copy; {new Date().getFullYear()} oleh {authorName}. Diterbitkan secara digital oleh {brandName}. Seluruh hak cipta dilindungi undang-undang.
              </p>
              <p className="text-gray-500 italic">
                Disclaimer: Dokumen ini disusun untuk tujuan edukasi dan panduan praktis. Hasil setiap individu bergantung pada usaha dan implementasi masing-masing.
              </p>
            </div>

            {/* 4. TABLE OF CONTENTS */}
            <div className="py-6 border-b border-gray-200 font-sans">
              <h3 className="text-lg font-bold text-emerald-950 mb-4 uppercase tracking-wider">
                Daftar Isi
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="font-semibold text-emerald-900">• Pendahuluan</div>
                {project.outline.map((ch) => (
                  <div key={ch.number} className="flex items-center justify-between border-b border-dotted border-gray-300 pb-1">
                    <span>• Bab {ch.number}: {ch.title}</span>
                  </div>
                ))}
                <div className="font-semibold text-emerald-900 pt-1">• Penutup & Rencana Aksi</div>
              </div>
            </div>

            {/* 5. PENDAHULUAN */}
            {project.introduction && (
              <div className="py-6 border-b border-gray-200 space-y-4">
                <h3 className="text-xl font-bold font-sans text-emerald-900">
                  PENDAHULUAN
                </h3>
                {project.introduction.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx} className="text-sm leading-relaxed text-gray-800">
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* 6. CHAPTERS */}
            {project.chapters.map((ch) => {
              const cleaned = cleanDuplicateHeading(ch.content, ch.title, ch.number);
              const blocks = parseContentBlocks(cleaned);

              return (
                <div key={ch.number} className="py-8 border-b border-gray-200 space-y-4">
                  <div className="font-sans mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Bab {ch.number}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                      {ch.title}
                    </h2>
                  </div>

                  {blocks.map((b, bIdx) => {
                    if (b.type === 'heading2') {
                      return (
                        <h4 key={bIdx} className="text-base font-bold font-sans text-gray-900 mt-5">
                          {b.content}
                        </h4>
                      );
                    }
                    if (b.type === 'heading3') {
                      return (
                        <h5 key={bIdx} className="text-sm font-bold font-sans text-gray-800 mt-3">
                          {b.content}
                        </h5>
                      );
                    }
                    if (b.type === 'callout') {
                      return (
                        <div
                          key={bIdx}
                          className="my-3 p-4 rounded-xl bg-emerald-50/80 border-l-4 border-emerald-600 font-sans text-xs text-gray-900"
                        >
                          <span className="font-bold text-emerald-800 block mb-1">
                            [ {b.title} ]
                          </span>
                          <div className="whitespace-pre-line leading-relaxed">
                            {b.content}
                          </div>
                        </div>
                      );
                    }
                    if (b.type === 'checklist' && b.items) {
                      return (
                        <div key={bIdx} className="my-2 space-y-1 font-sans text-xs">
                          {b.items.map((it, iIdx) => (
                            <div key={iIdx} className="flex items-start gap-2">
                              <span className="text-emerald-700 font-bold">□</span>
                              <span>{it}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    if (b.type === 'worksheet') {
                      return (
                        <div key={bIdx} className="my-2 p-2.5 rounded bg-gray-50 border border-gray-200 font-sans text-xs">
                          <p className="font-semibold text-gray-800">{b.content}</p>
                        </div>
                      );
                    }
                    return (
                      <p key={bIdx} className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
                        {b.content}
                      </p>
                    );
                  })}
                </div>
              );
            })}

            {/* 7. PENUTUP */}
            {project.conclusion && (
              <div className="py-6 space-y-4">
                <h3 className="text-xl font-bold font-sans text-emerald-900">
                  PENUTUP & LANGKAH SELANJUTNYA
                </h3>
                {project.conclusion.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx} className="text-sm leading-relaxed text-gray-800">
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
