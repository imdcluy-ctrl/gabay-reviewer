// Phase 2 Type Definitions — Single Source of Truth (§3.1, §3.2)

export interface AnswerContentSnapshot {
  question_text: string;
  options: Record<'A' | 'B' | 'C' | 'D', string>;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  hint_ladder: string[];
  deconstruction: string;
  trap_type?: string | null;
  subtopic: string;
  category_id: string;
  content_version: number;
}

export interface MockExamSection {
  section_id: string;
  name: string;
  question_count: number;
  advisory_time_minutes: number;
  category_ids: string[];
}

export interface MockExam {
  id: string; // e.g. 'cse-professional-v1'
  exam_type: 'professional' | 'subprofessional' | 'mini';
  title: string;
  total_questions: number;
  time_limit_minutes: number; // Single global timer
  section_config: string; // JSON string of MockExamSection[]
  status: 'active' | 'archived';
  version: number;
  created_at: string;
  updated_at: string;
}

export interface MockExamAttempt {
  id: string;
  local_user_id: string;
  mock_exam_id: string;
  started_at: string;
  completed_at?: string | null;
  score?: number | null;
  percentage?: number | null;
  passed?: boolean | null;
  status: 'in_progress' | 'paused' | 'completed' | 'auto_submitted' | 'abandoned';
  mode: 'practice' | 'simulation'; // INV-021
  integrity_flag: 'none' | 'clock_anomaly'; // INV-022
  time_remaining_seconds: number;
  paused_accumulated_ms: number; // INV-004
  current_question_index: number;
  section_times: string; // JSON string record of section_id -> seconds
  leitner_injected_at?: string | null; // INV-009 replay guard
}

export interface MockExamAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  question_index: number;
  chosen_option: 'A' | 'B' | 'C' | 'D' | null;
  is_correct: boolean | null;
  time_spent_seconds: number;
  flagged: boolean;
  section_id: string;
  content_snapshot: AnswerContentSnapshot; // INV-019
  created_at: string;
}

export interface MockExamPause {
  id: string;
  attempt_id: string;
  paused_at: string;
  resumed_at?: string | null;
  duration_seconds?: number | null;
}

export interface MockExamInjection {
  id: string;
  attempt_id: string;
  question_id: string;
  box_from: number;
  box_to: number;
  leech_count_before: number;
  leech_count_after: number;
  error_type: 'careless' | 'conceptual' | 'standard' | 'timeout';
  injected_at: string;
}
