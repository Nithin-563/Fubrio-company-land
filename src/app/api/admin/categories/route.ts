import { createCrudHandler } from "@/lib/crud-factory";
export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "categories",
  model: "category",
  perm: "content.manage",
  slugField: "name",
});
