import { createCrudHandler } from "@/lib/crud-factory";
export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "blog",
  model: "blogPost",
  perm: "content.manage",
  slugField: "title",
});
