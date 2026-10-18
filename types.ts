
export interface FormState {
  mathConcept: string;
  gradeLevel: string;
  numberOfQuestions: number;
  mathStrand: string;
  context: string;
  differentiation: {
    scaffolded: boolean;
    onLevel: boolean;
    challenge: boolean;
  };
}

export interface ProblemDetail {
  problemText: string;
  stepByStepHints?: string[];
  workspacePrompt: string;
}

export interface TeacherKeyDetail {
  completeSolution: string;
  multipleStrategies: string[];
  commonMisconceptions: string[];
  successCriteria: string[];
}

export interface GeneratedProblem {
  studentWorksheet: {
    scaffolded?: ProblemDetail[];
    onLevel?: ProblemDetail[];
    challenge?: ProblemDetail[];
  };
  teacherKey: {
    scaffolded?: TeacherKeyDetail[];
    onLevel?: TeacherKeyDetail[];
    challenge?: TeacherKeyDetail[];
  };
}

export interface GlobalGeneration {
  id: string;
  teacherUid: string;
  teacherEmail: string;
  teacherName: string;
  mathConcept: string;
  gradeLevel: string;
  genre?: string;
  numberOfQuestions: number;
  content: GeneratedProblem;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  plan: 'free' | 'unlimited';
  quotaLimit: number; // 30 per month on free tier
  generationsUsedThisMonth: number;
  currentMonth: string; // "YYYY-MM"
  lastGeneratedAt?: string;
  updatedAt: string;
}

export interface SavedWorksheet {
  id: string;
  userId: string;
  mathConcept: string;
  gradeLevel: string;
  numberOfQuestions: number;
  content: GeneratedProblem;
  createdAt: string;
  lastSync?: string;
}

export type WorksheetLayout = 'split-30-70' | 'split-40-60' | 'split-50-50' | 'stacked';
export type PaperStyle = 'blank' | 'grid' | 'lined' | 'dots';
export type WorkspaceHeight = 'compact' | 'standard' | 'spacious';
export type RenderFontSize = 'compact' | 'standard' | 'large';
export type RenderTheme = 'purple' | 'slate' | 'navy' | 'emerald';

export interface RenderSettings {
  layout: WorksheetLayout;
  paperStyle: PaperStyle;
  workspaceHeight: WorkspaceHeight;
  fontSize: RenderFontSize;
  themeColor: RenderTheme;
  showHeader: boolean;
  showClassField: boolean;
  showScoreField: boolean;
  showWorkspacePrompt: boolean;
  showDifficultyBadge: boolean;
  showHintsIfAvailable: boolean;
  pageBreaks: 'auto' | '2-per-page' | '4-per-page';
  customTitle?: string;
  customSubtitle?: string;
}

export const DEFAULT_RENDER_SETTINGS: RenderSettings = {
  layout: 'split-30-70',
  paperStyle: 'blank',
  workspaceHeight: 'standard',
  fontSize: 'standard',
  themeColor: 'purple',
  showHeader: true,
  showClassField: true,
  showScoreField: true,
  showWorkspacePrompt: true,
  showDifficultyBadge: true,
  showHintsIfAvailable: false,
  pageBreaks: 'auto',
  customTitle: '',
  customSubtitle: '',
};


