import { db } from './db';
import type { LocalQuestion } from './db';
import { backfillReviewState } from './leitner';
import { seedDefaultMockExams } from './migrations/v3_mock_exams';

export async function seedDatabase(): Promise<void> {
  try {
    const currentVersion = localStorage.getItem('gabay_content_version');
    // BUMP THIS whenever the deployed /content/seed.json question bank grows or changes.
    // Devices only re-fetch when the stored version differs from TARGET_VERSION, so an
    // unchanged version means stale banks (e.g. 5-37 questions) are never refreshed.
    // v19: force full-bank re-sync (stale 5-37 question banks).
    // v20: re-sync to normalize `subtopic` (seed only has `subtopic_id`), which fixes
    //      the `.replace()` crash on the mock-exam results page.
    const TARGET_VERSION = '20';

    // Track what we last seeded (version + count) so stale/partial banks are detected
    // and re-synced even when the version key was never bumped (self-heal).
    let storedMeta: { version?: string; count?: number } | null = null;
    try {
      storedMeta = JSON.parse(localStorage.getItem('gabay_seed_meta') || 'null');
    } catch {
      storedMeta = null;
    }

    const questionCount = await db.questions.count();

    const needsSync =
      questionCount === 0 ||
      currentVersion !== TARGET_VERSION ||
      !storedMeta ||
      storedMeta.version !== TARGET_VERSION ||
      storedMeta.count !== questionCount;

    // Auto-update questions non-destructively on content version bump, fresh install,
    // or when the on-device bank doesn't match what we last synced.
    if (needsSync) {
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

      // Normalize: the seed bank only carries `subtopic_id`, not the display `subtopic`
      // field. Populate `subtopic` so content snapshots, results diagnostics and deep
      // analytics never see `undefined` (fixes the `.replace()` crash on results page).
      const normalizedQuestions: LocalQuestion[] = questions.map(q => ({
        ...q,
        subtopic: (q.subtopic || q.subtopic_id || 'General') as string,
      }));

      // Use bulkPut to update question bank without clearing user attempts or progress.
      // Also purge stale question rows that are no longer part of the content set so a
      // truncated/old bank can never linger in the background.
      await db.transaction('rw', db.questions, async () => {
        await db.questions.bulkPut(normalizedQuestions);
        const newIds = new Set(normalizedQuestions.map(q => q.id));
        const allKeys = await db.questions.toCollection().primaryKeys();
        const staleIds = allKeys.filter(id => !newIds.has(String(id)));
        if (staleIds.length > 0) {
          await db.questions.bulkDelete(staleIds);
        }
      });
      localStorage.setItem('gabay_content_version', TARGET_VERSION);
      localStorage.setItem('gabay_seed_meta', JSON.stringify({ version: TARGET_VERSION, count: normalizedQuestions.length }));
      console.log(`Successfully synced ${normalizedQuestions.length} questions into Dexie DB. User progress preserved 100%.`);
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
