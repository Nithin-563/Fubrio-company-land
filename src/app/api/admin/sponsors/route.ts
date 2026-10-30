import { createCrudHandler } from "@/lib/crud-factory";
export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "sponsors",
  model: "sponsor",
  perm: "content.manage",
  slugField: "name",
  jsonFields: ["socials"],
});
