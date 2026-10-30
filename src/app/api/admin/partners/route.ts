import { createCrudHandler } from "@/lib/crud-factory";
export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "partners",
  model: "partner",
  perm: "content.manage",
  slugField: "name",
  jsonFields: ["socials"],
});
