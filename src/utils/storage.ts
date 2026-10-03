import { Project } from '../types';

const STORAGE_KEY = 'wic_ebook_generator_projects';
const ACTIVE_PROJECT_KEY = 'wic_ebook_generator_active_id';

export function getAllProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading projects from localStorage', e);
    return [];
  }
}

export function saveProject(project: Project): void {
  try {
    const projects = getAllProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    const updatedProject = { ...project, updatedAt: Date.now() };

    if (index >= 0) {
      projects[index] = updatedProject;
    } else {
      projects.unshift(updatedProject);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
  } catch (e) {
    console.error('Error saving project to localStorage', e);
  }
}

export function getProjectById(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find((p) => p.id === id) || null;
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_PROJECT_KEY);
}

export function setActiveProjectId(id: string): void {
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
}

export function deleteProject(id: string): Project[] {
  const projects = getAllProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  if (getActiveProjectId() === id) {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
  }
  return projects;
}

export function duplicateProject(id: string): Project | null {
  const original = getProjectById(id);
  if (!original) return null;

  const copy: Project = {
    ...original,
    id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: `${original.title} (Salinan)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  saveProject(copy);
  return copy;
}

export function createNewProject(productType: 'ebook' | 'workbook'): Project {
  const newProj: Project = {
    id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    productType,
    title: '',
    description: '',
    author: '',
    brand: 'Worth It Circle',
    targetAudience: '',
    readerGoal: '',
    readerLevel: 'Pemula',
    chapterCountChoice: '7',
    customChapterCount: 7,
    outline: [],
    writingStyle: 'Akrab & Hangat',
    writerCharacter: 'Teman Berpengalaman',
    hasManyExamples: true,
    isNaturalWriting: true,
    avoidGenericAi: true,
    introduction: '',
    chapters: [],
    conclusion: '',
    coverImage: null,
    coverPrompt: null,
    status: 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  saveProject(newProj);
  return newProj;
}
