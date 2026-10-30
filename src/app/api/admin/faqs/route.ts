import { createCrudHandler } from "@/lib/crud-factory";
export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "faqs",
  model: "faq",
  perm: "content.manage",
});
