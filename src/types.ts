export type ProductType = 'ebook' | 'workbook';

export type ReaderLevel = 'Pemula' | 'Menengah' | 'Mahir';

export type WritingStyle = 
  | 'Akrab & Hangat'
  | 'Profesional'
  | 'Santai'
  | 'Edukatif'
  | 'Storytelling'
  | 'Direct / To The Point'
  | 'Custom';

export type WriterCharacter = 
  | 'Teman Berpengalaman'
  | 'Praktisi'
  | 'Mentor'
  | 'Guru';

export interface ChapterOutline {
  number: number;
  title: string;
  goal: string;
}

export interface ChapterContent {
  number: number;
  title: string;
  content: string;
  summary: string;
}

export interface Project {
  id: string;
  productType: ProductType;
  title: string;
  description: string;
  author: string;
  brand: string;
  targetAudience: string;
  readerGoal: string;
  readerLevel: ReaderLevel;
  chapterCountChoice: '5' | '7' | '10' | 'ai' | 'custom';
  customChapterCount?: number;
  outline: ChapterOutline[];
  writingStyle: WritingStyle;
  customStyle?: string;
  writerCharacter: WriterCharacter;
  hasManyExamples: boolean;
  isNaturalWriting: boolean;
  avoidGenericAi: boolean;
  
  introduction: string;
  chapters: ChapterContent[];
  conclusion: string;
  
  coverImage: string | null;
  coverPrompt: string | null;
  status: 'draft' | 'completed';
  createdAt: number;
  updatedAt: number;
}

export interface MasterContext {
  productType: ProductType;
  title: string;
  description: string;
  author: string;
  brand: string;
  targetAudience: string;
  readerGoal: string;
  readerLevel: ReaderLevel;
  writingStyle: string;
  writerCharacter: string;
  hasManyExamples: boolean;
  isNaturalWriting: boolean;
  avoidGenericAi: boolean;
  outline: ChapterOutline[];
  previousChapterSummaries?: string[];
}
