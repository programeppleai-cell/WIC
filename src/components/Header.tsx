import React from 'react';
import { WicLogo } from './WicLogo';
import { FolderGit2, Plus, BookOpen, Layers } from 'lucide-react';
import { Project } from '../types';

interface HeaderProps {
  currentProject: Project | null;
  savedCount: number;
  onOpenProjects: () => void;
  onNewProject: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  savedCount,
  onOpenProjects,
  onNewProject,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand & Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-3.5 group text-left cursor-pointer focus:outline-none"
        >
          <WicLogo size={46} className="transition-transform group-hover:scale-105" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-gray-950 text-lg sm:text-xl font-['Plus_Jakarta_Sans',sans-serif]">
                WIC EBOOK GENERATOR
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 tracking-wider">
                V1
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium italic tracking-wide">
              &ldquo;Ide tulisan jadi uang&rdquo;
            </p>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentProject && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 rounded-lg text-xs text-gray-600 border border-gray-200/60 max-w-xs truncate">
              {currentProject.productType === 'workbook' ? (
                <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span className="truncate font-medium">{currentProject.title || 'Draft Baru'}</span>
            </div>
          )}

          <button
            onClick={onOpenProjects}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
            title="Daftar Project Saya"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-gray-500" />
            <span>Project Saya</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 font-bold text-gray-800">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={onNewProject}
            className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-gray-900 hover:bg-black transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buat Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
