import slugify from "slugify";
function toSlug(text) {
  return slugify(text, {
    lower: true,
    trim: true,
    remove: /[*+~.,()'"!:@/`]/g
  });
}
export {
  toSlug as t
};
