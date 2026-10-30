import { createCrudHandler } from "@/lib/crud-factory";

export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "donators",
  model: "donator",
  perm: "content.manage",
  canReorder: true,
} as any);
