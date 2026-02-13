import db from "../models/index.js";
const { Category } = db;

/**
 * Mengubah string menjadi slug yang valid.
 *
 * @param {string} string - String yang akan diubah menjadi slug
 * @returns {string} - Slug yang valid
 */
export function toSlug(string) {
  try {
    return string
      .toLowerCase() // ubah ke huruf kecil
      .replace(/[^a-z0-9\s-]/g, "") // hapus karakter selain huruf, angka, spasi, dan -
      .trim() // hapus spasi depan & belakang
      .replace(/\s+/g, "-"); // ganti spasi dengan -
  } catch (error) {
    throw error;
  }
}

export async function getParentCategory(categoryID) {
  try {
    const dbCategory = await Category.findByPk(categoryID);
    const is_kategori_child = dbCategory.is_child;
    const parentCategoryID = is_kategori_child
      ? dbCategory.id_parent
      : categoryID;
    return parentCategoryID;
  } catch (error) {
    throw error;
  }
}
