import slugify from "slugify";

export default function toSlug(text: string) {
  return slugify(text, {
    lower: true,
    trim: true,
    remove: /[*+~.,()'"!:@/`]/g,
  });
}
