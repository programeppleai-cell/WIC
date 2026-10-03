import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Eye, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Edit3, 
  Loader2, 
  Image as ImageIcon,
  Share2
} from 'lucide-react';
import { Project } from '../types';
import { exportToDocx, downloadDocxBlob } from '../utils/docxExport';
import { exportToPdf, downloadPdfBlob } from '../utils/pdfExport';

interface CompletedViewProps {
  project: Project;
  onOpenEditor: () => void;
  onOpenPreview: () => void;
  onOpenCoverPrompt: () => void;
  onOpenUploadCover: () => void;
}

export const CompletedView: React.FC<CompletedViewProps> = ({
  project,
  onOpenEditor,
  onOpenPreview,
  onOpenCoverPrompt,
  onOpenUploadCover,
}) => {
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const isWorkbook = project.productType === 'workbook';

  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      setDownloadSuccessMessage(null);
      const blob = await exportToDocx(project);
      downloadDocxBlob(blob, project.title);
      setDownloadSuccessMessage('File DOCX berhasil di-download!');
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (e: any) {
      console.error(e);
      alert('Gagal mendownload DOCX: ' + (e.message || 'Unknown error'));
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      setDownloadSuccessMessage(null);
      const blob = await exportToPdf(project);
      downloadPdfBlob(blob, project.title);
      setDownloadSuccessMessage('File PDF berhasil di-download!');
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (e: any) {
      console.error(e);
      alert('Gagal mendownload PDF: ' + (e.message || 'Unknown error'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      {/* Top Banner Success */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Produk Digital Berhasil Dihasilkan!</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
          {project.title}
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm mt-1.5">
          {isWorkbook ? 'Workbook Latihan & Aksi' : 'Ebook Panduan Praktis'} &bull; {project.chapters.length} Bab Selesai &bull; Ditulis oleh {project.author || 'Penulis'}
        </p>
      </div>

      {downloadSuccessMessage && (
        <div className="max-w-md mx-auto mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center text-xs font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Main Container with 2 Columns: Book Mockup / Cover & Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12">
        {/* Left: Book Cover Preview */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-xs aspect-[3/4] rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-gray-950 p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between border-4 border-white">
            {/* If user uploaded image cover */}
            {project.coverImage ? (
              <img
                src={project.coverImage}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl" />
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 block mb-2">
                    {isWorkbook ? 'PRACTICAL WORKBOOK' : 'PRACTICAL EBOOK'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold leading-snug line-clamp-4">
                    {project.title}
                  </h3>
                </div>

                <div className="pt-4 border-t border-emerald-800/60">
                  <p className="text-xs font-bold text-gray-200">{project.author || 'Penulis'}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">{project.brand || 'Worth It Circle'}</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenUploadCover}
              className="text-xs font-semibold text-gray-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{project.coverImage ? 'Ganti Cover' : 'Upload Cover Anda'}</span>
            </button>
            <span className="text-gray-300">&bull;</span>
            <button
              type="button"
              onClick={onOpenCoverPrompt}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prompt Cover AI</span>
            </button>
          </div>
        </div>

        {/* Right: 6 Action Cards Grid */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              Langkah Ekspor & Penyuntingan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. BACA & EDIT */}
              <button
                type="button"
                onClick={onOpenEditor}
                className="p-4 rounded-xl border border-gray-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-gray-900">BACA & EDIT</div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Buka editor untuk membaca bab dan memperhalus tulisan.
                </p>
              </button>

              {/* 2. PREVIEW BUKU */}
              <button
                type="button"
                onClick={onOpenPreview}
                className="p-4 rounded-xl border border-gray-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Eye className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-gray-900">PREVIEW</div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Lihat tampilan penuh buku sebelum melakukan download.
                </p>
              </button>

              {/* 3. PROMPT COVER */}
              <button
                type="button"
                onClick={onOpenCoverPrompt}
                className="p-4 rounded-xl border border-gray-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-gray-900">PROMPT COVER</div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Prompt visual siap copy untuk Midjourney, ChatGPT, Flux.
                </p>
              </button>

              {/* 4. UPLOAD COVER */}
              <button
                type="button"
                onClick={onOpenUploadCover}
                className="p-4 rounded-xl border border-gray-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="font-bold text-sm text-gray-900">UPLOAD COVER</div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Unggah gambar sampul untuk disematkan di DOCX & PDF.
                </p>
              </button>
            </div>
          </div>

          {/* Primary Download Buttons (DOCX & PDF) */}
          <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Unduh Produk Digital Siap Jual / Pakai
            </h4>
            <p className="text-xs text-gray-300 mb-4">
              File terformat rapi dengan halaman judul, daftar isi, pemisah bab, callout box, dan hak cipta.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* DOWNLOAD DOCX */}
              <button
                type="button"
                onClick={handleDownloadDocx}
                disabled={downloadingDocx}
                className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {downloadingDocx ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>DOWNLOAD DOCX</span>
              </button>

              {/* DOWNLOAD PDF */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="py-3.5 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-gray-700 disabled:opacity-50"
              >
                {downloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>DOWNLOAD PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
