import { useEffect, useMemo, useState } from "react";
// import Button from "../../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import Badge from "../../../components/ui/badge/Badge";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import PaginationWithButton from "../../../components/ui/pagination/PaginationWithButton";
import {
  deleteSocmed,
  getAllSocmed,
  getSocmedByID,
} from "../../../services/socmed.service";
import { SocmedDetailInterface } from "../../../types/socmed.type";
import { PencilIcon, TrashBinIcon } from "../../../icons";

interface SocmedTableProps {
  onEditSocmed: (data: SocmedDetailInterface[]) => void;
  onRefresh: () => void;
  refreshKey: number;
}

export default function SocmedTable({
  onEditSocmed,
  refreshKey,
  onRefresh,
}: SocmedTableProps) {
  const [dataSocmed, setdataSocmed] = useState<SocmedDetailInterface[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchIDParent = async () => {
      try {
        const response = await getAllSocmed();
        // console.log("PAGI HARI", response?.data);
        setdataSocmed(response?.data ?? []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchIDParent();
  }, [refreshKey]);

  const filteredAndSortedData = useMemo(() => {
    return dataSocmed.filter((item) =>
      [item.platform, item.url].some((value) =>
        value?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [dataSocmed, searchTerm]); //sortKey, sortOrder

  const handleEditButtonClick = async (id: number) => {
    try {
      const vaData = await getSocmedByID(id);
      // console.log(vaData?.data);
      onEditSocmed(vaData?.data as SocmedDetailInterface[]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteButtonClick = async (id: number) => {
    try {
      await deleteSocmed(id);
      onRefresh();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const showSwal = (tagTitle: string, id: number) => {
    withReactContent(Swal)
      .fire({
        title: `Are you sure to Delete ${tagTitle}?`,
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          handleDeleteButtonClick(id);
          withReactContent(Swal).fire({
            title: "Deleted!",
            text: "Data has been deleted.",
            icon: "success",
          });
        }
      });
  };

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
      {/* <ComponentCard title="Tags "> */}
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
            <span className="text-gray-500 dark:text-gray-400"> entries </span>
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
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 max-w-[10px]"
                >
                  #
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 max-w-[10px]"
                >
                  Platform Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Url
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {currentData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.platform}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge variant="light" color="info">
                      {item.url}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap ">
                    <div className="flex items-center w-full gap-2">
                      <button
                        onClick={() => showSwal(item.platform, item.id)}
                        className="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
                      >
                        <TrashBinIcon className="size-5" />
                      </button>
                      <button
                        onClick={() => handleEditButtonClick(item.id)}
                        className="text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-white/90"
                      >
                        <PencilIcon className="size-5" />
                      </button>
                    </div>
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
      {/* </ComponentCard> */}
    </>
  );
}
