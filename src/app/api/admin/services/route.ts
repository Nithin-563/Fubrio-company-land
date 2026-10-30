import { createCrudHandler } from "@/lib/crud-factory";
export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "services",
  model: "service",
  perm: "content.manage",
  slugField: "title",
  jsonFields: ["features"],
});
