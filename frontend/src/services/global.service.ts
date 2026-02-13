export default function toSlug(string:string){
  try {
    return string
      .toLowerCase() // ubah ke huruf kecil
      .replace(/[^a-z0-9\s-]/g, "") // hapus karakter selain huruf, angka, spasi, dan -
      .trim() // hilangkan spasi depan & belakang
      .replace(/\s+/g, "-"); // ganti spasi jadi -
  } catch (error) {
    console.error(error)
    throw error
  }
}