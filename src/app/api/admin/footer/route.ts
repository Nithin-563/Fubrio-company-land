import { createCrudHandler } from "@/lib/crud-factory";
export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "pages",
  model: "footerColumn",
  perm: "navigation.manage",
  jsonFields: ["links"],
});
