import { createCrudHandler } from "@/lib/crud-factory";
export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "pages",
  model: "navItem",
  perm: "navigation.manage",
});
