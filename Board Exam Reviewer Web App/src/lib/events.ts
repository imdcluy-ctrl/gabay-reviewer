export const EVENTS = {
  APP_OPENED: 'app_opened',
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  STUDY_SESSION_STARTED: 'study_session_started',
  QUESTION_ANSWERED: 'question_answered',
  HINT_USED: 'hint_used',
  HINT_SKIPPED: 'hint_skipped',
  JOURNAL_WRITTEN: 'journal_written',
  BREAK_SUGGESTED: 'break_suggested',
  BREAK_TAKEN: 'break_taken',
  BREAK_SKIPPED: 'break_skipped',
  PWA_INSTALL_PROMPTED: 'pwa_install_prompted',
  PWA_INSTALLED: 'pwa_installed',
  SIGNUP_PROMPTED: 'signup_prompted',
  SIGNUP_COMPLETED: 'signup_completed',
  UPGRADE_TRIGGER_SHOWN: 'upgrade_trigger_shown',

  // Phase 1b Events (§10)
  REVIEW_SESSION_STARTED: 'review_session_started',
  CARD_RATED: 'card_rated',
  LEECH_THRESHOLD_HIT: 'leech_threshold_hit',
  REVIEW_SESSION_COMPLETED: 'review_session_completed',
  BACKUP_NUDGE_SHOWN: 'backup_nudge_shown',
  BACKUP_NUDGE_DISMISSED: 'backup_nudge_dismissed',
  BACKUP_NUDGE_CONVERTED: 'backup_nudge_converted',
  BACKFILL_RUN: 'backfill_run',

  // Phase B0 QOTD Baseline Instrumentation
  QOTD_VIEWED: 'qotd_viewed',
  QOTD_ANSWERED: 'qotd_answered',
  QOTD_DONE_FOR_TODAY: 'qotd_done_for_today',

  // Phase A4 — Streak Mode Engagement Metrics
  STREAK_SESSION_STARTED: 'streak_session_started',
  STREAK_QUESTION_ANSWERED: 'streak_question_answered',
  STREAK_QUESTION_CORRECT: 'streak_question_correct',
  STREAK_QUESTION_WRONG: 'streak_question_wrong',
  STREAK_FREEZE_USED: 'streak_freeze_used',
  STREAK_MILESTONE_REACHED: 'streak_milestone_reached',
  STREAK_SESSION_COMPLETED: 'streak_session_completed',
  STREAK_RESTORE_USED: 'streak_restore_used',
  STREAK_PRACTICE_MODE_ENTERED: 'streak_practice_mode_entered',
  STREAK_DAILY_PARTICIPATION: 'streak_daily_participation',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
