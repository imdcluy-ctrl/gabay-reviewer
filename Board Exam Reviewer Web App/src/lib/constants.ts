export const APP_NAME = 'GABAY';
export const DEFAULT_EXAM_DATE = '2027-03-07';

export const EXAM_LEVELS = {
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional Level',
    items: 170,
    minutes: 190,
    salaryGrade: 'SG 11+',
    icon: '📋',
  },
  SUB_PROFESSIONAL: {
    id: 'sub_professional',
    name: 'Sub-Professional Level',
    items: 165,
    minutes: 160,
    salaryGrade: 'SG 1-10',
    icon: '📝',
  },
};

export const CATEGORIES = [
  { id: 'numerical-ability', name: 'Numerical Ability', icon: '🔢' },
  { id: 'verbal-ability', name: 'Verbal Ability', icon: '📝' },
  { id: 'analytical-ability', name: 'Analytical Ability', icon: '🧩' },
  { id: 'clerical-ability', name: 'Clerical Ability', icon: '📋' },
  { id: 'general-information', name: 'General Information', icon: '🏛️' },
];
