// Shared Leitner & Pacing Constants (§7.2, L3)

export const CARELESS_THRESHOLD_SECONDS = 20;
export const CONCEPTUAL_THRESHOLD_SECONDS = 120;

export interface LeitnerConfig {
  promote_correct_exam_answers: boolean; // §7.3: Default false to preserve 'exam = assessment' asymmetry (H1, INV-010)
}

export const leitnerConfig: LeitnerConfig = {
  promote_correct_exam_answers: false,
};
