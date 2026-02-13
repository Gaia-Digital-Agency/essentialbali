import { useEffect, useMemo, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { PencilIcon } from "../../icons";
import {
  getAllUser,
  getDataDetailUser,
  updateUserStatus,
} from "../../services/auth.service";
import Badge from "../../components/ui/badge/Badge";
import Switch from "../../components/form/switch/Switch";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import PaginationWithButton from "../../components/ui/pagination/PaginationWithButton";
import { User } from "../../types/auth.type";

export default function Users() {
  const [dataUsers, setDataUsers] = useState<User[]>([]);
  const [whoAmI, setWhoAmI] = useState<string>("");

  // Setup For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const initials = (s: string) =>
    s
      .trim()
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");

  const formatUserLevel = (level: string) => {
    if (level === "admin_country") return "admin bali area";
    if (level === "admin_city") return "admin sub area";
    return level.replace("_", " ");
  };

  useEffect(() => {
    const fetchAllUser = async () => {
      try {
        const vaData = await getAllUser();
        const vaDataUser = vaData.data;
        setDataUsers(vaDataUser);
      } catch (error) {
        console.error("Failed to fetch all user:", error);
        // throw error;
      } finally {
        // setLoading(false);
      }
    };

    fetchAllUser();
  }, []);

  useEffect(() => {
    const getWhoAmI = async () => {
      try {
        const vaData = await getDataDetailUser();
        // console.log("setWhoAmI =>" , vaData.data[0]);
        if(vaData) {
          setWhoAmI(vaData.data[0].email ?? "");
        } else {
          setWhoAmI("")
        }
      } catch (error) {
        console.error("Failed to fetch all user:", error);
        // throw error;
      } finally {
        // setLoading(false);
      }
    };

    getWhoAmI();
  }, []);

  const filteredAndSortedData = useMemo(() => {
    return dataUsers.filter((item) =>
      [item.name, item.email].some((value) =>
        value?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [dataUsers, searchTerm]); //sortKey, sortOrder

  const handleAddUserButton = () => {
    window.location.href = "/admin/registration";
  };

  const handleSwitchChange = async (id: number, checked: boolean) => {
    try {
      await updateUserStatus(id, { status: checked });

      // Update di local state
      setDataUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, isActive: checked } : user
        )
      );

      withReactContent(Swal).fire({
        title: `User ${checked ? "Activated" : "Deactivated"}`,
        icon: `${checked ? "success" : "info"}`,
      });
    } catch (error) {
      withReactContent(Swal)
        .fire({
          title: `Error`,
          text: "Failed to update user status",
          icon: "error",
        })
        .then(() => {
          location.reload();
        });
      // refresh page
      console.error("Error updating user status:", error);
    }
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
      <div>
        <PageMeta
          title="essentialbali Admin Dashboard | User List"
          description="This is User List Page for essentialbali Admin Dashboard Template"
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
          <div className="space-y-12">
            <PageBreadcrumb pageTitle="User List" />
            <div className="flex justify-start">
              <Button
                size="sm"
                variant="primary"
                startIcon={<PencilIcon className="size-5" />}
                onClick={handleAddUserButton}
              >
                Add User
              </Button>
            </div>

            <ComponentCard title="Data">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="flex flex-col gap-2 px-4 py-4 border border-b-1 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400">
                      {" "}
                      Show ´
                    </span>
                    <div className="relative z-20 bg-transparent">
                      <select
                        className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        value={itemsPerPage}
                        onChange={(e) =>
                          setItemsPerPage(Number(e.target.value))
                        }
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
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Name
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Email
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Bali Area
                        </TableCell>
                        <TableCell
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {currentData.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 overflow-hidden rounded-full bg-blue-200 text-blue-600 flex items-center justify-center">
                                <h4>{initials(user.name.split(" ")[0])}</h4>
                              </div>
                              <div>
                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                  {user.name}{" "}
                                  {whoAmI === user.email && (
                                    <span className="ml-1">
                                      <Badge size="sm" color="info">
                                        You
                                      </Badge>
                                    </span>
                                  )}
                                </span>
                                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                                  {formatUserLevel(user.user_level)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {user.email}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <span className="block text-gray-950 text-theme-sm dark:text-gray-400">
                              {user.name_city}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {user.name_country}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <Switch
                              label={user.isActive ? "Active" : "Suspended"}
                              defaultChecked={user.isActive}
                              disabled={whoAmI === user.email}
                              onChange={(checked) =>
                                handleSwitchChange(user.id, checked)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="border border-t-1 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
                    {/* Left side: Showing entries */}

                    <PaginationWithButton
                      totalPages={totalPages}
                      initialPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                    <div className="pt-3 xl:pt-0">
                      <p className="pt-3 text-sm font-medium text-center text-gray-500 border-t border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-t-0 xl:pt-0 xl:text-left">
                        Showing {startIndex + 1} to {endIndex} of {totalItems}{" "}
                        entries
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>
      </div>
    </>
  );
}
