import { createCrudHandler } from "@/lib/crud-factory";

export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "team",
  model: "teamMember",
  perm: "content.manage",
} as any);
