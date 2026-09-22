
import type { FormState } from './types';

export const DEFAULT_FORM_STATE: FormState = {
  mathConcept: 'Comparing Fractions',
  gradeLevel: '5',
  numberOfQuestions: 10,
  mathStrand: 'Number Sense',
  context: 'Real Life',
  differentiation: {
    scaffolded: true,
    onLevel: true,
    challenge: true,
  },
};

export const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20];

export const GRADE_LEVELS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

export const MATH_STRANDS = [
  'Number Sense',
  'Algebra',
  'Geometry',
  'Measurement',
  'Data Analysis & Probability',
  'Financial Literacy',
];

export const CONTEXTS = [
    { id: 'Real Life', name: 'Real Life', icon: '✅' },
    { id: 'Sports', name: 'Sports', icon: '⚽' },
    { id: 'Shopping', name: 'Shopping', icon: '🛒' },
    { id: 'Indigenous', name: 'Indigenous', icon: '🌲' },
    { id: 'Random', name: 'Random', icon: '🎲' },
];

export const LEVEL_NAMES: Record<'scaffolded' | 'onLevel' | 'challenge' | 'mix', string> = {
  scaffolded: 'Scaffolded',
  onLevel: 'On-Level',
  challenge: 'Challenge',
  mix: 'Mix'
};
