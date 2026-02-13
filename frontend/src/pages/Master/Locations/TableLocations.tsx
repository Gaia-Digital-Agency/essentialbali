import { useEffect, useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  deleteLocation,
  getLocationByID,
} from "../../../services/location.service";
import { Location } from "../../../types/location.type";
import Button from "../../../components/ui/button/Button";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import {
  CityProps,
  CountryProps,
  RegionProps,
  useTaxonomies,
} from "../../../context/TaxonomyContext";
import { deleteTemplate } from "../../../services/template.service";

interface TableLocationProps {
  onEditLocation: (loc: Location) => void;
  onRefresh: () => void;
  refreshKey: number;
}

type TaxonomyLocations = "country" | "city" | "region";
type TaxonomiesLocations = "countries" | "cities" | "regions";

export default function TableLocations({
  onEditLocation,
  onRefresh,
  refreshKey,
}: TableLocationProps) {
  const [locType, setLocType] = useState<string>("");
  const [dataLocation, setDataLocation] = useState<
    CountryProps[] | CityProps[] | RegionProps[] | undefined
  >([]);
  const { adminTaxonomies, generateUrlLocations } = useTaxonomies();

  const PLURAL_TAXONOMY_NAME = {
    country: "countries",
    city: "cities",
    region: "regions",
  } as Record<TaxonomyLocations, TaxonomiesLocations>;

  const optTypeLocation = [
    { key: "country", value: "country", label: "Area" },
    { key: "city", value: "city", label: "Sub Area (City)" },
    { key: "region", value: "region", label: "Sub Area (Region)" },
  ];
  const handleTypeLocation = (value: string | number) => {
    setLocType(String(value));
  };

  const handleEditButtonClick = async (type: string, id: number) => {
    const vaData = await getLocationByID(type, id);
    
    if (id === 999) {
      withReactContent(Swal).fire({
        title: "Oops",
        text: "This is a default location, you can't edit it",
        icon: "info",
      });
    } else {
      onEditLocation(vaData.data as Location);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDeleteButtonClick = async (id: number, locType: string) => {
    try {
      await deleteLocation(id, locType);
      await deleteTemplate(
        `/${generateUrlLocations(id, locType as TaxonomyLocations)}`
      );
      onRefresh();
      return true;
    } catch (error) {
      console.error(error);
      return false;
      // throw error;
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
      .then(async (result) => {
        if (result.isConfirmed) {
          const doHandle = await handleDeleteButtonClick(id, locType);
          if (doHandle) {
            withReactContent(Swal).fire({
              title: "Deleted!",
              text: "Tag has been deleted.",
              icon: "success",
            });
          } else {
            withReactContent(Swal).fire({
              title: "Warning",
              text: "Sorry, you can not delete this data",
              icon: "warning",
            });
          }
        }
      });
  };

  useEffect(() => {
    const getDataLocations = async () => {
      if (!locType) setLocType("country");
      // const data = await getAllLocationByType(locType);
      // setDataLocation(data.data ?? []);
      setDataLocation(
        adminTaxonomies[
          PLURAL_TAXONOMY_NAME[
            locType as TaxonomyLocations
          ] as TaxonomiesLocations
        ] ?? []
      );
    };
    getDataLocations();
  }, [locType, refreshKey]);
  // console.log(adminTaxonomies, adminTaxonomies[(PLURAL_TAXONOMY_NAME[(locType as TaxonomyLocations)] as TaxonomiesLocations)], dataLocation)
  return (
    <>
      <ComponentCard title="Bali Areas">
        <div className="space-y-3 space-x-6 grid grid-cols-2">
          <div>
            <Label>Area Type</Label>
            <Select
              options={optTypeLocation}
              placeholder="Filter area type..."
              onChange={handleTypeLocation}
              className="dark:bg-dark-900"
            />
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-l-amber-800 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[10px]"
                  >
                    #
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[10px]"
                  >
                    Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Parent
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
                {dataLocation?.map((loc, index) => (
                  <TableRow key={loc.id}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400">
                      {loc.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400">
                      {loc.name_parent ? loc.name_parent : "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400">
                      {loc.slug ? loc.slug : "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400">
                      <Button
                        onClick={() => handleEditButtonClick(locType, loc.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400">
                      <Button
                        onClick={() => showSwal(loc.name, loc.id)}
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
        </div>
      </ComponentCard>
    </>
  );
}
