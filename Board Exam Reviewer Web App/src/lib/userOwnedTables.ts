// Central User-Owned Tables Registry (§0.8.2, PHASE_3_IMPLEMENTATION_PLAN.md)
// Single source of truth for user table policies across guest-to-auth merge and remote sync.

export type DataPolicy = 'browser_local_only' | 'merge_on_auth' | 'sync_remote';

export interface UserOwnedTableDefinition {
  name: string;
  policy: DataPolicy;
}

export const USER_OWNED_TABLES: UserOwnedTableDefinition[] = [
  { name: 'attempts', policy: 'merge_on_auth' },
  { name: 'journal_entries', policy: 'merge_on_auth' },
  { name: 'review_state', policy: 'merge_on_auth' },
  { name: 'user_profile', policy: 'merge_on_auth' },
  { name: 'mock_exam_attempts', policy: 'merge_on_auth' },
  { name: 'mock_exam_answers', policy: 'merge_on_auth' },
  { name: 'mock_exam_pauses', policy: 'merge_on_auth' },
  { name: 'mock_exam_injections', policy: 'merge_on_auth' },
  { name: 'error_tags', policy: 'merge_on_auth' },
  { name: 'worry_dumps', policy: 'browser_local_only' },
  { name: 'checklist_progress', policy: 'merge_on_auth' },
  { name: 'entitlements_cache', policy: 'merge_on_auth' },
  { name: 'free_usage', policy: 'merge_on_auth' },
];

export function getTablePolicy(tableName: string): DataPolicy | undefined {
  const def = USER_OWNED_TABLES.find(t => t.name === tableName);
  return def?.policy;
}
