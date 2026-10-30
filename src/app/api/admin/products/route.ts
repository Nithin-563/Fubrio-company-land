import { createCrudHandler } from "@/lib/crud-factory";
export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "products",
  model: "product",
  perm: "content.manage",
  slugField: "title",
  jsonFields: ["gallery", "features", "technologies"],
});
