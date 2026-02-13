import { useEffect, useMemo, useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  getAllCategory,
  getCategoryByID,
  deleteCategory,
} from "../../../services/category.service";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Category } from "../../../types/category.type";
import PaginationWithButton from "../../../components/ui/pagination/PaginationWithButton";

interface TableCategoriesProps {
  refreshKey: number;
  onEditCategory: (cat: Category) => void;
  onSaveSuccess: () => void;
}

export default function TableCategories({
  refreshKey,
  onEditCategory,
  onSaveSuccess,
}: TableCategoriesProps) {
  const [dataCategories, setDataCategories] = useState<Category[]>([]);
  // const [dataSelectedCategory, setDataSelectedCategory] = useState<Category>();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchIDParent = async () => {
      try {
        const response = await getAllCategory();
        setDataCategories(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchIDParent();
  }, [refreshKey]);

  async function handleEditButtonClick(id: number) {
    try {
      const response = await getCategoryByID(id);
      onEditCategory(response.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
    }
  }

  async function handleDeleteButtonClick(id: number) {
    try {
      await deleteCategory(id);
      onSaveSuccess();
      withReactContent(Swal).fire({
        title: "Deleted!",
        text: "Category has been deleted.",
        icon: "success",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error deleting category:", error);

      // Ambil pesan error dari API kalau ada
      let message = "Failed to delete category";
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      withReactContent(Swal).fire({
        title: "Error",
        text: message,
        icon: "error",
      });
    }
  }

  const showSwal = (categoryTitle: string, id: number) => {
    withReactContent(Swal)
      .fire({
        title: `Are you sure to Delete ${categoryTitle}?`,
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          handleDeleteButtonClick(id);
        }
      });
  };

  const filteredAndSortedData = useMemo(() => {
    return dataCategories.filter((item) =>
      [item.title, item.slug_title, item.sub_title].some((value) =>
        value?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [dataCategories, searchTerm]); //sortKey, sortOrder

  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  return (
    <>
      <ComponentCard title="Category Datas">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex flex-col gap-2 px-4 py-4 border border-b-1 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 dark:text-gray-400"> Show </span>
              <div className="relative z-20 bg-transparent">
                <select
                  className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  {[5, 10].map((value) => (
                    <option
                      key={value}
                      value={value}
                      className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                    >
                      {value}
                    </option>
                  ))}
                </select>
                <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
                  <svg
                    className="stroke-current"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                      stroke=""
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                {" "}
                entries{" "}
              </span>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-l-amber-800 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[10px]"
                  >
                    Title
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Sub Title
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Slug
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Parent Category
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Edit?
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Delete
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {currentData.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-lg dark:text-gray-400">
                      {cat.title}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-lg dark:text-gray-400">
                      {cat.sub_title}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-lg dark:text-gray-400">
                      {cat.slug_title}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-lg dark:text-gray-400">
                      {cat.parent}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-lg dark:text-gray-400">
                      <Button
                        onClick={() => handleEditButtonClick(cat.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-lg dark:text-gray-400">
                      <Button
                        onClick={() => showSwal(cat.title, cat.id)}
                        size="sm"
                        className="bg-red-400 hover:bg-red-700"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border border-t-1 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
              {/* Left side: Showing entries */}

              <div className="pt-3 xl:pt-0">
                <p className="pt-3 text-sm font-medium text-center text-gray-500 border-t border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-t-0 xl:pt-0 xl:text-left">
                  Showing {startIndex + 1} to {endIndex} of {totalItems} entries
                </p>
              </div>
              <PaginationWithButton
                totalPages={totalPages}
                initialPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
