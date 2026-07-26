import Dexie, { type Table } from 'dexie';
import type {
  MockExam,
  MockExamAttempt,
  MockExamAnswer,
  MockExamPause,
  MockExamInjection,
} from '../types/mockExam';
import type { ErrorTagRecord } from './errorTags';

export interface LocalQuestion {
  id: string; // matches Supabase question ID (e.g. 'num-ratio-001')
  category_id: string;
  subtopic: string;
  subtopic_id?: string;
  difficulty: number; // 1 | 2 | 3
  difficulty_level?: number;
  is_free: boolean;
  question_text: string;
  passage?: string;
  options: { key: string; text: string }[];
  correct_option: string; // 'A' | 'B' | 'C' | 'D'
  hint_ladder: { rung: number; title: string; text: string }[];
  deconstruct_text: string;
  choice_explanations: Record<string, { text: string; trap_type?: string | null | undefined }>;
  next_time_rule: string;
  blueprint_id: string;
  status: string;
  version?: number; // Version for snapshotting
}

export interface LocalAttempt {
  id: string;
  local_user_id: string;
  question_id: string;
  chosen_option: string;
  is_correct: boolean;
  confidence_rating: number; // 1 | 2 | 3
  hints_used_count: number;
  time_spent_seconds: number;
  session_type: string; // 'practice' | 'review' | 'diagnostic'
  attempted_at: string; // ISO date string
  synced_at: string | null;
}

export interface LocalJournalEntry {
  id: string;
  local_user_id: string;
  question_id: string;
  note_text: string;
  prompt_used: string;
  created_at: string;
  synced_at: string | null;
}

export interface LocalReviewState {
  id: string; // composite key `${local_user_id}_${question_id}`
  local_user_id: string;
  question_id: string;
  box_level: number; // 1 | 2 | 3 | 4 | 5
  next_review_date: string; // ISO string
  last_result: 'correct' | 'incorrect';
  leech_count: number;
  is_leech: boolean;
  shaky_correct_streak: number;
  consecutive_correct: number;
  last_session_type: string;
  updated_at: string;
}

export interface LocalUserProfile {
  id: string; // local device UUID
  auth_user_id?: string | null; // linked Supabase user ID if logged in
  display_name?: string | null;
  email?: string | null;
  exam_target: 'professional' | 'subprofessional' | 'cse-professional' | 'cse-subprofessional' | string;
  exam_level?: string;
  exam_date: string | null;
  target_score: number;
  onboarding_completed?: boolean;
  created_at: string;

  // Track if guest data has been merged to auth account
  local_merge_completed?: boolean;
}

export interface LocalSyncQueueItem {
  id: string;
  entity_name: 'attempts' | 'journal_entries' | 'review_state' | 'user_profile' | 'mock_exam_attempts' | 'mock_exam_answers';
  action: 'insert' | 'update';
  payload: any;
  created_at: string;
}

export interface WorryDumpRecord {
  id?: number;
  local_user_id: string;
  body: string;
  created_at: number;
}

export interface ChecklistProgressRecord {
  key: string;
  local_user_id: string;
  checked_ids: string[];
  checklist_version: number;
  updated_at: number;
}

export interface UserEntitlementRecord {
  id: string;
  local_user_id: string;
  plan_type: 'free' | 'pro' | 'unlimited';
  is_premium: boolean;
  payment_method?: 'gcash' | 'maya' | 'card';
  redeemed_coupon?: string;
  expires_at?: string; // ISO date string for time-gated passes
  updated_at: number;
}

export interface ExamineeFeedback {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  category: 'suggestion' | 'bug' | 'question' | 'other';
  message: string;
  status: 'unresolved' | 'resolved' | 'dismissed';
  created_at: string;
}

class GabayDatabase extends Dexie {
  questions!: Table<LocalQuestion>;
  attempts!: Table<LocalAttempt>;
  journal_entries!: Table<LocalJournalEntry>;
  review_state!: Table<LocalReviewState>;
  user_profile!: Table<LocalUserProfile>;
  sync_queue!: Table<LocalSyncQueueItem>;

  // Phase 2 Stores
  mock_exams!: Table<MockExam>;
  mock_exam_attempts!: Table<MockExamAttempt>;
  mock_exam_answers!: Table<MockExamAnswer>;
  mock_exam_pauses!: Table<MockExamPause>;
  mock_exam_injections!: Table<MockExamInjection>;

  // Phase 3 Stores
  error_tags!: Table<ErrorTagRecord>;
  worry_dumps!: Table<WorryDumpRecord>;
  checklist_progress!: Table<ChecklistProgressRecord>;
  user_entitlements!: Table<UserEntitlementRecord>;
  examinee_feedback!: Table<ExamineeFeedback>;

  constructor() {
    super('gabay_db');

    // Version 1 Baseline
    this.version(1).stores({
      questions: 'id, category_id, subtopic, difficulty, is_free, status',
      attempts: 'id, local_user_id, question_id, is_correct, session_type, attempted_at, synced_at',
      journal_entries: 'id, local_user_id, question_id, created_at, synced_at',
      review_state: 'id, local_user_id, question_id, box_level, next_review_date',
      user_profile: 'id, auth_user_id, exam_target, exam_date, target_score',
      sync_queue: 'id, entity_name, action, created_at',
    });

    // Version 2 Schema (Phase 1b)
    this.version(2).stores({
      questions: 'id, category_id, subtopic, difficulty, is_free, status',
      attempts: 'id, local_user_id, question_id, is_correct, session_type, attempted_at, synced_at',
      journal_entries: 'id, local_user_id, question_id, created_at, synced_at',
      review_state: 'id, local_user_id, question_id, next_review_date, leech_count, is_leech, updated_at',
      user_profile: 'id, auth_user_id, exam_target, exam_date, target_score',
      sync_queue: 'id, entity_name, action, created_at',
    });

    // Version 3 Schema (Phase 2 Stage 2.1 — H1, H2, H3, INV-001)
    this.version(3)
      .stores({
        // Preserved v2 stores with compound index on review_state
        questions: 'id, category_id, subtopic, difficulty, is_free, status',
        attempts: 'id, local_user_id, question_id, is_correct, session_type, attempted_at, synced_at',
        journal_entries: 'id, local_user_id, question_id, created_at, synced_at',
        review_state:
          'id, local_user_id, question_id, [local_user_id+question_id], box_level, next_review_date, leech_count, is_leech, updated_at',
        user_profile: 'id, auth_user_id, exam_target, exam_date, target_score',
        sync_queue: 'id, entity_name, action, created_at',

        // New Phase 2 v3 stores with H1 compound indexes and H2 future-proof columns
        mock_exams: 'id, exam_type, title, total_questions, time_limit_minutes, status, version',
        mock_exam_attempts:
          'id, local_user_id, mock_exam_id, started_at, completed_at, score, percentage, passed, status, mode, integrity_flag, [local_user_id+mock_exam_id+status], time_remaining_seconds, current_question_index, section_times, leitner_injected_at',
        mock_exam_answers:
          'id, attempt_id, question_id, question_index, chosen_option, is_correct, time_spent_seconds, flagged, section_id, content_snapshot, created_at',
        mock_exam_pauses: 'id, attempt_id, paused_at, resumed_at, duration_seconds',
        mock_exam_injections:
          'id, attempt_id, question_id, [attempt_id+question_id], box_from, box_to, leech_count_before, leech_count_after, error_type, injected_at',
      })
      .upgrade(async tx => {
        // H3 Upgrade Seeding Path: Ensures existing v2 users get mock_exams seeded on upgrade
        const { seedDefaultMockExams } = await import('./migrations/v3_mock_exams');
        await seedDefaultMockExams(tx);
      });

    // Version 4 Schema (Phase 3 Stage 3.1 — INV-026 Error Tags)
    this.version(4).stores({
      questions: 'id, category_id, subtopic, difficulty, is_free, status',
      attempts: 'id, local_user_id, question_id, is_correct, session_type, attempted_at, synced_at',
      journal_entries: 'id, local_user_id, question_id, created_at, synced_at',
      review_state:
        'id, local_user_id, question_id, [local_user_id+question_id], box_level, next_review_date, leech_count, is_leech, updated_at',
      user_profile: 'id, auth_user_id, exam_target, exam_date, target_score',
      sync_queue: 'id, entity_name, action, created_at',
      mock_exams: 'id, exam_type, title, total_questions, time_limit_minutes, status, version',
      mock_exam_attempts:
        'id, local_user_id, mock_exam_id, started_at, completed_at, score, percentage, passed, status, mode, integrity_flag, [local_user_id+mock_exam_id+status], time_remaining_seconds, current_question_index, section_times, leitner_injected_at',
      mock_exam_answers:
        'id, attempt_id, question_id, question_index, chosen_option, is_correct, time_spent_seconds, flagged, section_id, content_snapshot, created_at',
      mock_exam_pauses: 'id, attempt_id, paused_at, resumed_at, duration_seconds',
      mock_exam_injections:
        'id, attempt_id, question_id, [attempt_id+question_id], box_from, box_to, leech_count_before, leech_count_after, error_type, injected_at',
      error_tags:
        '++id, local_user_id, attempt_id, question_id, [attempt_id+question_id], [local_user_id+question_id], tag, source, created_at, updated_at',
    });

    // Version 5 Schema (Phase 3 Stage 3.2 — INV-027 Anxiety Toolkit)
    this.version(5).stores({
      questions: 'id, category_id, subtopic, difficulty, is_free, status',
      attempts: 'id, local_user_id, question_id, is_correct, session_type, attempted_at, synced_at',
      journal_entries: 'id, local_user_id, question_id, created_at, synced_at',
      review_state:
        'id, local_user_id, question_id, [local_user_id+question_id], box_level, next_review_date, leech_count, is_leech, updated_at',
      user_profile: 'id, auth_user_id, exam_target, exam_date, target_score',
      sync_queue: 'id, entity_name, action, created_at',
      mock_exams: 'id, exam_type, title, total_questions, time_limit_minutes, status, version',
      mock_exam_attempts:
        'id, local_user_id, mock_exam_id, started_at, completed_at, score, percentage, passed, status, mode, integrity_flag, [local_user_id+mock_exam_id+status], time_remaining_seconds, current_question_index, section_times, leitner_injected_at',
      mock_exam_answers:
        'id, attempt_id, question_id, question_index, chosen_option, is_correct, time_spent_seconds, flagged, section_id, content_snapshot, created_at',
      mock_exam_pauses: 'id, attempt_id, paused_at, resumed_at, duration_seconds',
      mock_exam_injections:
        'id, attempt_id, question_id, [attempt_id+question_id], box_from, box_to, leech_count_before, leech_count_after, error_type, injected_at',
      error_tags:
        '++id, local_user_id, attempt_id, question_id, [attempt_id+question_id], [local_user_id+question_id], tag, source, created_at, updated_at',
      worry_dumps: '++id, local_user_id, created_at',
      checklist_progress: '&key, local_user_id, updated_at',
    });

    // Version 6 Schema (Phase 3 Stage 3.4 — INV-029 Entitlements & Paywall Engine)
    this.version(6).stores({
      questions: 'id, category_id, subtopic, difficulty, is_free, status',
      attempts: 'id, local_user_id, question_id, is_correct, session_type, attempted_at, synced_at',
      journal_entries: 'id, local_user_id, question_id, created_at, synced_at',
      review_state:
        'id, local_user_id, question_id, [local_user_id+question_id], box_level, next_review_date, leech_count, is_leech, updated_at',
      user_profile: 'id, auth_user_id, exam_target, exam_date, target_score',
      sync_queue: 'id, entity_name, action, created_at',
      mock_exams: 'id, exam_type, title, total_questions, time_limit_minutes, status, version',
      mock_exam_attempts:
        'id, local_user_id, mock_exam_id, started_at, completed_at, score, percentage, passed, status, mode, integrity_flag, [local_user_id+mock_exam_id+status], time_remaining_seconds, current_question_index, section_times, leitner_injected_at',
      mock_exam_answers:
        'id, attempt_id, question_id, question_index, chosen_option, is_correct, time_spent_seconds, flagged, section_id, content_snapshot, created_at',
      mock_exam_pauses: 'id, attempt_id, paused_at, resumed_at, duration_seconds',
      mock_exam_injections:
        'id, attempt_id, question_id, [attempt_id+question_id], box_from, box_to, leech_count_before, leech_count_after, error_type, injected_at',
      error_tags:
        '++id, local_user_id, attempt_id, question_id, [attempt_id+question_id], [local_user_id+question_id], tag, source, created_at, updated_at',
      worry_dumps: '++id, local_user_id, created_at',
      checklist_progress: '&key, local_user_id, updated_at',
      user_entitlements: 'id, local_user_id, plan_type, is_premium, updated_at',
    });

    // Version 7 Schema — Examinee Feedback & Suggestions Tracker
    this.version(7).stores({
      questions: 'id, category_id, subtopic, difficulty, is_free, status',
      attempts: 'id, local_user_id, question_id, is_correct, session_type, attempted_at, synced_at',
      journal_entries: 'id, local_user_id, question_id, created_at, synced_at',
      review_state:
        'id, local_user_id, question_id, [local_user_id+question_id], box_level, next_review_date, leech_count, is_leech, updated_at',
      user_profile: 'id, auth_user_id, exam_target, exam_date, target_score',
      sync_queue: 'id, entity_name, action, created_at',
      mock_exams: 'id, exam_type, title, total_questions, time_limit_minutes, status, version',
      mock_exam_attempts:
        'id, local_user_id, mock_exam_id, started_at, completed_at, score, percentage, passed, status, mode, integrity_flag, [local_user_id+mock_exam_id+status], time_remaining_seconds, current_question_index, section_times, leitner_injected_at',
      mock_exam_answers:
        'id, attempt_id, question_id, question_index, chosen_option, is_correct, time_spent_seconds, flagged, section_id, content_snapshot, created_at',
      mock_exam_pauses: 'id, attempt_id, paused_at, resumed_at, duration_seconds',
      mock_exam_injections:
        'id, attempt_id, question_id, [attempt_id+question_id], box_from, box_to, leech_count_before, leech_count_after, error_type, injected_at',
      error_tags:
        '++id, local_user_id, attempt_id, question_id, [attempt_id+question_id], [local_user_id+question_id], tag, source, created_at, updated_at',
      worry_dumps: '++id, local_user_id, created_at',
      checklist_progress: '&key, local_user_id, updated_at',
      user_entitlements: 'id, local_user_id, plan_type, is_premium, updated_at',
      examinee_feedback: 'id, user_id, category, status, created_at',
    });

    this.on('populate', async tx => {
      const { seedDefaultMockExams } = await import('./migrations/v3_mock_exams');
      await seedDefaultMockExams(tx);
    });
  }
}

export const db = new GabayDatabase();
