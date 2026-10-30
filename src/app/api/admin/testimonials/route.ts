import { createCrudHandler } from "@/lib/crud-factory";
export const { GET, POST, PUT, DELETE } = createCrudHandler({
  section: "testimonials",
  model: "testimonial",
  perm: "content.manage",
});
