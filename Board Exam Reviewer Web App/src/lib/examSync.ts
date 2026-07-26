import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import type { LocalSyncQueueItem } from './db';

const lastSyncTimeMap = new Map<string, number>();

export async function enqueueCoalescedSync(
  attemptId: string,
  kind: 'state' | 'answer' | 'pause' | 'final',
  payload: any
): Promise<void> {
  const now = Date.now();
  const lastSync = lastSyncTimeMap.get(attemptId) || 0;
  const is30sElapsed = now - lastSync >= 30000;

  // INV-018: 'state' and 'pause' syncs coalesced (at most 1 write / 30s)
  if ((kind === 'state' || kind === 'pause') && !is30sElapsed) {
    // Delete existing un-flushed 'mock_exam_attempts' entries for this attempt
    const existingQueueItems = await db.sync_queue
      .where('entity_name')
      .equals('mock_exam_attempts')
      .toArray();

    const idsToDelete = existingQueueItems
      .filter(item => item.payload && item.payload.id === attemptId)
      .map(item => item.id);

    if (idsToDelete.length > 0) {
      await db.sync_queue.bulkDelete(idsToDelete);
    }
  }

  // Create new queue item
  const queueItem: LocalSyncQueueItem = {
    id: uuidv4(),
    entity_name: kind === 'answer' ? 'mock_exam_answers' : 'mock_exam_attempts',
    action: kind === 'final' ? 'update' : 'insert',
    payload: { attemptId, kind, ...payload },
    created_at: new Date().toISOString(),
  };

  await db.sync_queue.add(queueItem);

  if (kind === 'final' || is30sElapsed) {
    lastSyncTimeMap.set(attemptId, now);
  }
}
