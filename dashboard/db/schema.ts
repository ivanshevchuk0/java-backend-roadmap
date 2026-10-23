import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// This application is published with Sites owner-only access. The dispatch layer,
// not a client-supplied identity, authorizes access to this single owner's record.
// Revisit this storage key before ever changing the site's audience to public.
export const progressState = sqliteTable('progress_state', {
  id: text('id').primaryKey(),
  revision: integer('revision').notNull(),
  progressJson: text('progress_json').notNull(),
  updatedAt: text('updated_at').notNull(),
});
