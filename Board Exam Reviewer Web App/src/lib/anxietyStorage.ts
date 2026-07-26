// Dexie Storage API for Worry Dumps and Exam Day Checklist (§3.2, INV-027e, INV-027f)

import { db, type WorryDumpRecord, type ChecklistProgressRecord } from './db';
import { CSC_CHECKLIST_VERSION } from './cscExamChecklist';

/**
 * INV-027e: Saves a worry dump note to local Dexie IndexedDB.
 * Text is browser_local_only and never uploaded to remote servers or analytics.
 */
export async function saveWorryDump(localUserId: string, body: string): Promise<WorryDumpRecord> {
  const trimmed = body.trim().slice(0, 5000);
  if (!trimmed) {
    throw new Error('Worry dump body cannot be empty.');
  }

  const record: WorryDumpRecord = {
    local_user_id: localUserId,
    body: trimmed,
    created_at: Date.now(),
  };

  const id = await db.worry_dumps.add(record);
  return { ...record, id };
}

/**
 * Lists all worry dumps for a local user (newest first).
 */
export async function listWorryDumps(localUserId: string): Promise<WorryDumpRecord[]> {
  return await db.worry_dumps
    .where('local_user_id')
    .equals(localUserId)
    .reverse()
    .sortBy('created_at');
}

/**
 * Deletes a worry dump by ID with explicit confirmation.
 */
export async function deleteWorryDump(id: number): Promise<void> {
  await db.worry_dumps.delete(id);
}

/**
 * Fetches checked item IDs for CSC Exam Day Checklist.
 */
export async function getChecklistProgress(localUserId: string): Promise<Set<string>> {
  const key = `${localUserId}:csc_exam_day_v${CSC_CHECKLIST_VERSION}`;
  const record = await db.checklist_progress.get(key);
  return new Set(record ? record.checked_ids : []);
}

/**
 * Saves checked item IDs for CSC Exam Day Checklist.
 */
export async function saveChecklistProgress(localUserId: string, checkedIds: Set<string>): Promise<void> {
  const key = `${localUserId}:csc_exam_day_v${CSC_CHECKLIST_VERSION}`;
  const record: ChecklistProgressRecord = {
    key,
    local_user_id: localUserId,
    checked_ids: Array.from(checkedIds),
    checklist_version: CSC_CHECKLIST_VERSION,
    updated_at: Date.now(),
  };

  await db.checklist_progress.put(record);
}

/**
 * Resets/clears checklist progress for a user.
 */
export async function resetChecklistProgress(localUserId: string): Promise<void> {
  const key = `${localUserId}:csc_exam_day_v${CSC_CHECKLIST_VERSION}`;
  await db.checklist_progress.delete(key);
}
