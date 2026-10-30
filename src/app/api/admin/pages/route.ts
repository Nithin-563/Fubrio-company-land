import { createCrudHandler } from "@/lib/crud-factory";
export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "pages",
  model: "page",
  perm: "pages.manage",
  slugField: "title",
});
