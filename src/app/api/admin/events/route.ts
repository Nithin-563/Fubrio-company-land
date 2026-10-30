import { createCrudHandler } from "@/lib/crud-factory";
export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "events",
  model: "event",
  perm: "content.manage",
});
