import { z } from "zod";
import type { InfraiClient, Session } from "./infrai_client.js";

export const inventoryBody = z.object({ user_id: z.string().min(1), keep_session_id: z.string().min(1) });
export type InventoryBody = z.infer<typeof inventoryBody>;

export async function signOutOthers(client: Pick<InfraiClient, "listSessions" | "revokeSession">, raw: unknown) {
  const input = inventoryBody.parse(raw);
  const sessions = await client.listSessions(input.user_id);
  const revoked: string[] = [];
  for (const session of sessions as Session[]) {
    const id = session.id ?? session.session_id;
    if (id && id !== input.keep_session_id && session.active !== false) {
      await client.revokeSession(id);
      revoked.push(id);
    }
  }
  return { user_id: input.user_id, kept_session_id: input.keep_session_id, revoked_session_ids: revoked };
}
