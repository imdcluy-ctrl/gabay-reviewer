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
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
