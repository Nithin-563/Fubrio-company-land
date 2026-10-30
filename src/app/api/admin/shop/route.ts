import { createCrudHandler } from "@/lib/crud-factory";

export const { GET, POST, PUT, DELETE } = createCrudHandler({
  model: "shopItem",
  perm: "content.manage",
  section: "shop",
} as any);
