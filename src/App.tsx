import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { WizardProgress } from './components/WizardProgress';
import { StepTitle } from './components/wizard/StepTitle';
import { StepDescription } from './components/wizard/StepDescription';
import { StepAuthor } from './components/wizard/StepAuthor';
import { StepTargetGoal } from './components/wizard/StepTargetGoal';
import { StepChapters } from './components/wizard/StepChapters';
import { StepStyle } from './components/wizard/StepStyle';
import { StepReview } from './components/wizard/StepReview';
import { GeneratingView } from './components/GeneratingView';
import { CompletedView } from './components/CompletedView';
import { EditorView } from './components/EditorView';
import { PreviewModal } from './components/PreviewModal';
import { CoverModal } from './components/CoverModal';
import { ProjectsModal } from './components/ProjectsModal';
import { Project } from './types';
import { 
  getAllProjects, 
  saveProject, 
  createNewProject, 
  deleteProject, 
  duplicateProject, 
  getActiveProjectId, 
  getProjectById 
} from './utils/storage';

export function App() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [view, setView] = useState<'home' | 'wizard' | 'generating' | 'completed' | 'editor'>('home');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(1);

  // Modals
  const [showProjectsModal, setShowProjectsModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showCoverModal, setShowCoverModal] = useState<boolean>(false);
  const [coverModalTab, setCoverModalTab] = useState<'prompt' | 'upload'>('prompt');

  // Load saved projects on initialization
  useEffect(() => {
    const list = getAllProjects();
    setSavedProjects(list);

    const activeId = getActiveProjectId();
    if (activeId) {
      const activeProj = getProjectById(activeId);
      if (activeProj) {
        setCurrentProject(activeProj);
        if (activeProj.status === 'completed') {
          setView('completed');
        } else if (activeProj.title) {
          setView('wizard');
        }
      }
    }
  }, []);

  const refreshProjectList = () => {
    setSavedProjects(getAllProjects());
  };

  const handleSelectProductType = (type: 'ebook' | 'workbook') => {
    const newProj = createNewProject(type);
    setCurrentProject(newProj);
    setWizardStep(1);
    setMaxReachedStep(1);
    setView('wizard');
    refreshProjectList();
  };

  const handleUpdateProject = (data: Partial<Project>) => {
    if (!currentProject) return;
    const updated = { ...currentProject, ...data, updatedAt: Date.now() };
    setCurrentProject(updated);
    saveProject(updated);
    refreshProjectList();
  };

  const handleNextStep = () => {
    if (wizardStep < 7) {
      const next = wizardStep + 1;
      setWizardStep(next);
      setMaxReachedStep((prev) => Math.max(prev, next));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackStep = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setView('home');
    }
  };

  const handleSelectStep = (step: number) => {
    setWizardStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartGenerate = () => {
    setView('generating');
  };

  const handleGenerationComplete = (completedProject: Project) => {
    setCurrentProject(completedProject);
    setView('completed');
    refreshProjectList();
  };

  const handleOpenProject = (proj: Project) => {
    setCurrentProject(proj);
    if (proj.status === 'completed') {
      setView('completed');
    } else {
      setView('wizard');
      setWizardStep(1);
      setMaxReachedStep(proj.outline?.length ? 5 : 1);
    }
  };

  const handleDuplicate = (id: string) => {
    const duplicated = duplicateProject(id);
    refreshProjectList();
    if (duplicated) {
      setCurrentProject(duplicated);
      handleOpenProject(duplicated);
    }
  };

  const handleDelete = (id: string) => {
    const updatedList = deleteProject(id);
    setSavedProjects(updatedList);
    if (currentProject?.id === id) {
      setCurrentProject(null);
      setView('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-gray-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-100 selection:text-emerald-900">
      {/* Universal Header with Brand & Logo */}
      <Header
        currentProject={currentProject}
        savedCount={savedProjects.length}
        onOpenProjects={() => setShowProjectsModal(true)}
        onNewProject={() => {
          setView('home');
          setCurrentProject(null);
        }}
        onGoHome={() => setView('home')}
      />

      {/* Wizard Progress Indicator (Shown only in wizard view) */}
      {view === 'wizard' && (
        <WizardProgress
          currentStep={wizardStep}
          onSelectStep={handleSelectStep}
          maxReachedStep={maxReachedStep}
        />
      )}

      {/* Main Views Container */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: HOME SCREEN (Ebook vs Workbook Selection) */}
        {view === 'home' && (
          <HomeView
            onSelectProductType={handleSelectProductType}
            savedProjects={savedProjects}
            onOpenProject={handleOpenProject}
            onDuplicateProject={handleDuplicate}
            onDeleteProject={handleDelete}
          />
        )}

        {/* VIEW 2: SIMPLE WIZARD (Steps 1 to 7) */}
        {view === 'wizard' && currentProject && (
          <div className="w-full">
            {wizardStep === 1 && (
              <StepTitle
                project={currentProject}
                onUpdate={handleUpdateProject}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}
            {wizardStep === 2 && (
              <StepDescription
                project={currentProject}
                onUpdate={handleUpdateProject}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}
            {wizardStep === 3 && (
              <StepAuthor
                project={currentProject}
                onUpdate={handleUpdateProject}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}
            {wizardStep === 4 && (
              <StepTargetGoal
                project={currentProject}
                onUpdate={handleUpdateProject}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}
            {wizardStep === 5 && (
              <StepChapters
                project={currentProject}
                onUpdate={handleUpdateProject}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}
            {wizardStep === 6 && (
              <StepStyle
                project={currentProject}
                onUpdate={handleUpdateProject}
                onNext={handleNextStep}
                onBack={handleBackStep}
              />
            )}
            {wizardStep === 7 && (
              <StepReview
                project={currentProject}
                onGoToStep={handleSelectStep}
                onStartGenerate={handleStartGenerate}
                onBack={handleBackStep}
              />
            )}
          </div>
        )}

        {/* VIEW 3: LIVE GENERATION PROGRESS (Sequential Chaining) */}
        {view === 'generating' && currentProject && (
          <GeneratingView
            project={currentProject}
            onComplete={handleGenerationComplete}
            onCancel={() => setView('wizard')}
          />
        )}

        {/* VIEW 4: COMPLETED PRODUCT DASHBOARD */}
        {view === 'completed' && currentProject && (
          <CompletedView
            project={currentProject}
            onOpenEditor={() => setView('editor')}
            onOpenPreview={() => setShowPreviewModal(true)}
            onOpenCoverPrompt={() => {
              setCoverModalTab('prompt');
              setShowCoverModal(true);
            }}
            onOpenUploadCover={() => {
              setCoverModalTab('upload');
              setShowCoverModal(true);
            }}
          />
        )}

        {/* VIEW 5: EDITOR (Chapter by Chapter Reading & Refinement) */}
        {view === 'editor' && currentProject && (
          <EditorView
            project={currentProject}
            onUpdateProject={(updated) => {
              setCurrentProject(updated);
              refreshProjectList();
            }}
            onBack={() => setView('completed')}
            onOpenPreview={() => setShowPreviewModal(true)}
          />
        )}
      </main>

      {/* MODALS */}
      {showProjectsModal && (
        <ProjectsModal
          projects={savedProjects}
          activeProjectId={currentProject?.id || null}
          onSelectProject={(p) => {
            handleOpenProject(p);
            setShowProjectsModal(false);
          }}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onNew={() => {
            setView('home');
            setCurrentProject(null);
            setShowProjectsModal(false);
          }}
          onClose={() => setShowProjectsModal(false)}
        />
      )}

      {showPreviewModal && currentProject && (
        <PreviewModal
          project={currentProject}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {showCoverModal && currentProject && (
        <CoverModal
          project={currentProject}
          initialTab={coverModalTab}
          onClose={() => setShowCoverModal(false)}
          onUpdateProject={(updated) => {
            setCurrentProject(updated);
            refreshProjectList();
          }}
        />
      )}
    </div>
  );
}
export default App;
