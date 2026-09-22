
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

