import { db } from './db';
import type { LocalQuestion } from './db';
import { backfillReviewState } from './leitner';
import { seedDefaultMockExams } from './migrations/v3_mock_exams';

export async function seedDatabase(): Promise<void> {
  try {
    const currentVersion = localStorage.getItem('gabay_content_version');
    const TARGET_VERSION = '18';

    const questionCount = await db.questions.count();
    
    // Auto-update questions non-destructively on content version bump or fresh install
    if (questionCount === 0 || currentVersion !== TARGET_VERSION) {
      console.log(`Syncing content updates to version ${TARGET_VERSION} (Non-destructive upsert)...`);

      // Bust HTTP cache to ensure latest seed.json is fetched from server
      const response = await fetch('/content/seed.json?v=' + Date.now(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        console.warn('Failed to fetch seed questions:', response.statusText);
        return;
      }
      const questions: LocalQuestion[] = await response.json();
      
      // Use bulkPut to update question bank without clearing user attempts or progress
      await db.questions.bulkPut(questions);
      localStorage.setItem('gabay_content_version', TARGET_VERSION);
      console.log(`Successfully synced ${questions.length} questions into Dexie DB. User progress preserved 100%.`);
    }

    // Seed mock exam definitions (H3 path for fresh installs)
    await seedDefaultMockExams(db);

    // Run lazy backfill for current profile if present (§3.2)
    const profile = await db.user_profile.toCollection().first();
    if (profile) {
      await backfillReviewState(profile.id);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
