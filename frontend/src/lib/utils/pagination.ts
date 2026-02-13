export const generatePagination = (currentPage: number, totalPage?: number) => {
  if(!totalPage || totalPage < 1) return [1]
  if (totalPage <= 5) {
    return Array.from({ length: totalPage }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPage];
  }
  if (currentPage >= totalPage - 2) {
    return [1, '...', totalPage - 2, totalPage - 1, totalPage];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPage];
}
