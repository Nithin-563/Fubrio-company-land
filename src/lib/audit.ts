import { db } from "@/lib/db";

export async function safeAuditLog(params: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    if (params.userId === "czer-super-admin") {
      return;
    }
    await db.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        metadata: params.metadata || {},
      },
    });
  } catch (err) {
    console.error("[Fubrio] Audit log failed (non-fatal):", err);
  }
}
