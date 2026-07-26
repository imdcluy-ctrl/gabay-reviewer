// Metacognitive Error Tag Definitions & Distribution Math (§3.1, INV-026)
// Distinguishes user metacognitive self-tags from machine Leitner error classification (classifyErrorType).

export type ErrorTagId =
  | 'misread'
  | 'conceptual'
  | 'calculation'
  | 'trap'
  | 'rushed'
  | 'guess';

export interface ErrorTagMeta {
  id: ErrorTagId;
  labelEn: string;
  labelTl: string;
  colorToken: string;
  helperText: string;
}

export interface ErrorTagRecord {
  id?: number | undefined;
  local_user_id: string;
  attempt_id: string;
  question_id: string;
  tag: ErrorTagId;
  note?: string | undefined;
  source: 'mock_exam' | 'practice' | 'sr_review';
  source_session_id?: string | undefined;
  created_at: number;
  updated_at: number;
}

export const ERROR_TAG_META: Record<ErrorTagId, ErrorTagMeta> = {
  misread: {
    id: 'misread',
    labelEn: 'Misread Question',
    labelTl: 'Maling Pagbasa',
    colorToken: 'var(--tag-misread, #EAB308)',
    helperText: 'Stem/keyword reading error; underlying content was known.',
  },
  conceptual: {
    id: 'conceptual',
    labelEn: 'Topic Gap',
    labelTl: 'Kakulangan sa Konsepto',
    colorToken: 'var(--tag-conceptual, #3B82F6)',
    helperText: 'Topic gap or wrong mental model.',
  },
  calculation: {
    id: 'calculation',
    labelEn: 'Calculation Error',
    labelTl: 'Maling Kompyutasyon',
    colorToken: 'var(--tag-calculation, #EF4444)',
    helperText: 'Arithmetic or procedure slip despite right approach.',
  },
  trap: {
    id: 'trap',
    labelEn: 'Trap Choice',
    labelTl: 'Fell for Trap Choice',
    colorToken: 'var(--tag-trap, #A855F7)',
    helperText: 'Fell for a crafted distractor option after engaging the item.',
  },
  rushed: {
    id: 'rushed',
    labelEn: 'Time Pressure',
    labelTl: 'Nagmadali / Oras',
    colorToken: 'var(--tag-rushed, #F97316)',
    helperText: 'Knew material but answered too fast under time pressure.',
  },
  guess: {
    id: 'guess',
    labelEn: 'Blind Guess',
    labelTl: 'Hula Lamang',
    colorToken: 'var(--tag-guess, #64748B)',
    helperText: 'Did not know; blind or coin-flip choice.',
  },
};

export interface TagDistributionItem {
  tag: ErrorTagId;
  count: number;
  percentage: number; // Rounded to 1 decimal place (INV-026f)
}

export interface TagDistributionResult {
  totalIncorrect: number;
  taggedCount: number;
  items: TagDistributionItem[];
}

/**
  * INV-026f: Calculates error tag distribution for an attempt or set of tags.
  * pct(t) = round( count(tag=t) / incorrect_count * 1000 ) / 10
  */
export function computeDistribution(
  tags: ErrorTagId[],
  incorrectCount: number
): TagDistributionResult {
  if (incorrectCount <= 0) {
    return {
      totalIncorrect: 0,
      taggedCount: 0,
      items: (Object.keys(ERROR_TAG_META) as ErrorTagId[]).map(t => ({
        tag: t,
        count: 0,
        percentage: 0,
      })),
    };
  }

  const counts: Record<ErrorTagId, number> = {
    misread: 0,
    conceptual: 0,
    calculation: 0,
    trap: 0,
    rushed: 0,
    guess: 0,
  };

  tags.forEach(t => {
    if (counts[t] !== undefined) {
      counts[t]++;
    }
  });

  const totalTagged = tags.length;

  const items: TagDistributionItem[] = (Object.keys(ERROR_TAG_META) as ErrorTagId[]).map(t => {
    const count = counts[t] || 0;
    const rawPct = (count / incorrectCount) * 100;
    const percentage = Math.round(rawPct * 10) / 10;
    return {
      tag: t,
      count,
      percentage,
    };
  });

  return {
    totalIncorrect: incorrectCount,
    taggedCount: totalTagged,
    items,
  };
}

export function assertValidTag(tag: string): asserts tag is ErrorTagId {
  const validTags: ErrorTagId[] = ['misread', 'conceptual', 'calculation', 'trap', 'rushed', 'guess'];
  if (!validTags.includes(tag as ErrorTagId)) {
    throw new Error(`Invalid ErrorTagId '${tag}'. Expected one of: ${validTags.join(', ')}`);
  }
}

export function clampNote(note?: string): string | undefined {
  if (!note) return undefined;
  return note.trim().slice(0, 280);
}
