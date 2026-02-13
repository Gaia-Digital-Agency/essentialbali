import { GetDataTimezoneResponse } from "../../types/timezone.type";
import { Modal } from "../ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function ModalTimezoneTable({
  isOpen,
  onCLose,
  timezonesData,
}: {
  isOpen: boolean;
  onCLose: () => void;
  timezonesData: GetDataTimezoneResponse[];
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCLose}
      showCloseButton={true}
      className="max-w-[800px] m-4"
    >
      <div className="relative w-full overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Timezone List
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            List of IANA Timezone Reference
          </p>
        </div>
        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
          <Table>
            <TableHeader className="border-gray-100 border-y dark:border-white/[0.05] bg-blue-200">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-blue-800 sm:px-6 text-start text-theme-sm dark:text-gray-400"
                >
                  No
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-blue-800 sm:px-6 text-start text-theme-sm dark:text-gray-400"
                >
                  Timezone Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-blue-800 sm:px-6 text-center text-theme-sm dark:text-gray-400 w-1/4"
                >
                  UTC Offset
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-medium text-blue-800 sm:px-6 text-start text-theme-sm dark:text-gray-400"
                >
                  Description
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timezonesData.map((item: any, index: number) => (
                <TableRow className="border-b-1 border-gray-200" key={index}>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 sm:px-6 dark:text-gray-400">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 sm:px-6 dark:text-gray-400">
                    {item.timezone_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 sm:px-6 dark:text-gray-400 text-center ">
                    {item.utc_offset}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 sm:px-6 dark:text-gray-400">
                    {item.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Modal>
  );
}
