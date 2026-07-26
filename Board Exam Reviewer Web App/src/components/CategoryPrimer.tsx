import React from 'react';
import { Button } from './Button';
import './CategoryPrimer.css';

interface CategoryPrimerProps {
  categoryId: string;
  onDismiss: () => void;
}

const PRIMER_CONTENT: Record<string, { title: string; body: string; tip: string }> = {
  'numerical-ability': {
    title: 'Why Numerical Ability Matters',
    body: "This section tests whether you can work with numbers under time pressure. It's not about being a math genius — it's about recognizing patterns and avoiding common traps. Government work involves budgets, statistics, and resource allocation daily.",
    tip: 'Most wrong answers come from dividing by the wrong number or misreading what the question asks for.',
  },
  'verbal-ability': {
    title: 'Why Verbal Ability Matters',
    body: 'Government communication must be clear, precise, and professional. This section tests your command of English grammar, vocabulary, and reading comprehension — skills you\'ll use in every memo, report, and policy document.',
    tip: 'Read the ENTIRE passage before answering. Most traps exploit people who skim.',
  },
  'analytical-ability': {
    title: 'Why Analytical Ability Matters',
    body: 'Civil servants must solve problems logically. This section tests pattern recognition, logical reasoning, and data interpretation — the mental toolkit for making sound decisions under uncertainty.',
    tip: 'Draw it out. Diagrams turn abstract logic into something you can see.',
  },
  'clerical-ability': {
    title: 'Why Clerical Ability Matters',
    body: 'Accuracy in record-keeping saves time, money, and sometimes lives. This section tests your eye for detail — alphabetizing, coding, and spotting errors in data. Speed AND precision matter here.',
    tip: 'Go letter by letter. The most common mistake is comparing only the first 2-3 characters.',
  },
  'general-information': {
    title: 'Why General Information Matters',
    body: 'Every civil servant should understand the Constitution, the Code of Conduct (RA 6713), and how Philippine government works. This isn\'t just trivia — it\'s the foundation of your oath of service.',
    tip: 'Focus on RA 6713 (Code of Conduct) and the Bill of Rights. These come up most frequently.',
  },
};

export const CategoryPrimer: React.FC<CategoryPrimerProps> = ({ categoryId, onDismiss }) => {
  const content = PRIMER_CONTENT[categoryId] || {
    title: 'Section Overview',
    body: 'Master key patterns and build your speed with deliberate practice.',
    tip: 'Take your time to understand the explanations.',
  };

  const handleGotIt = () => {
    localStorage.setItem(`primer_seen_${categoryId}`, 'true');
    onDismiss();
  };

  return (
    <div className="primer-overlay">
      <div className="primer-card">
        <div className="primer-accent-line" />
        <h2 className="primer-title">{content.title}</h2>
        <p className="primer-body">{content.body}</p>

        <div className="primer-tip-box">
          <span className="primer-tip-icon">💡</span>
          <p className="primer-tip-text">
            <strong>Pro Tip:</strong> {content.tip}
          </p>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={handleGotIt}>
          Got it, let's start →
        </Button>
      </div>
    </div>
  );
};
