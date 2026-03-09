import React, { useEffect, useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Button from "../../../components/ui/button/Button";
import Alert from "../../../components/ui/alert/Alert";
import { DownloadIcon, InfoIcon } from "../../../icons";
import { CreateLocationDto, Location } from "../../../types/location.type";
import useTimedMessage from "../../../hooks/useTimedMessage";
import Select from "../../../components/form/Select";
import {
  createLocation,
  editLocation,
} from "../../../services/location.service";
import toSlug from "../../../lib/utils/slugify";
import { useModal } from "../../../hooks/useModal";
import Badge from "../../../components/ui/badge/Badge";
import { GetDataTimezoneResponse } from "../../../types/timezone.type";
import { getTimezones } from "../../../services/timezone.service";
import ModalTimezoneTable from "../../../components/modal/ModalTimezoneTable";
import { useTaxonomies } from "../../../context/TaxonomyContext";
import { AssetMedia } from "../../../types/media.type";
import { useNavigationPrompt } from "../../../hooks/useNavigationPrompt";
import { AdminFeaturedImage } from "../../../components/ui/featured-image/FeaturedImage";

const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;

interface LocationsFormProps {
  selectedLocations?: Location;
  onRefresh: () => void;
}

const parentMap: Record<string, string | null> = {
  country: null,
  city: "country",
  region: "city",
};

interface optionDataInterface {
  key: string | number;
  value: string | number;
  label: string;
}

type TaxonomyLocations = "country" | "city" | "region";
type TaxonomiesLocations = "countries" | "cities" | "regions";

export default function FormLocations({
  selectedLocations,
  onRefresh,
}: LocationsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [idToEdit, setIdToEdit] = useState<number>(0);

  const [locationName, setLocationName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [typeLocation, setTypeLocation] = useState<string>("");
  const [optParentLocation, setOptParentLocation] = useState<
    Array<{ key: number; value: string | number; label: string }>
  >([]);
  const [parentLocation, setParentLocation] = useState<number | undefined>();

  const [timezone, setTimezone] = useState<string>("");
  const [vaDataTimezone, setDataTimezone] = useState<GetDataTimezoneResponse[]>([]);
  const [vaDataOptTimezone, setDataOptTimezone] = useState<optionDataInterface[]>([]);

  const [featuredImage, setFeaturedImage] = useState<{
    id: number | undefined;
    url: string | undefined;
  }>();

  const { closeModal, openModal } = useModal(false);
  const { setBlock } = useNavigationPrompt();
  const { adminTaxonomies } = useTaxonomies();

  const PLURAL_TAXONOMY_NAME = {
    country: "countries",
    city: "cities",
    region: "regions",
  } as Record<TaxonomyLocations, TaxonomiesLocations>;

  const {
    isOpen: isOpenModalTimezone,
    openModal: openModalTimezone,
    closeModal: closeModalTimezone,
  } = useModal();

  const optTypeLocation = [
    { key: "country", value: "country", label: "Area" },
  ];

  useEffect(() => {
    const fetchDataTimezone = async () => {
      try {
        const vaData = await getTimezones();
        const vaTimezones = vaData.data;
        const begin = { key: 0, value: 0, label: "Select Timezone" };
        const optDataTimezone =
          vaTimezones?.map((tz) => ({
            key: timezone.id,
            value: tz.timezone_name,
            label: `${tz.timezone_name} - [${tz.utc_offset}]`,
          })) ?? [];
        setDataOptTimezone([begin, ...optDataTimezone]);
        setDataTimezone(vaTimezones);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDataTimezone();
  }, []);

  useEffect(() => {
    const fetchParentOptions = async () => {
      try {
        const parentType = parentMap[typeLocation] as TaxonomyLocations;
        if (!parentType) {
          setOptParentLocation([]);
          return;
        }
        const data = adminTaxonomies?.[
          PLURAL_TAXONOMY_NAME[parentType] as TaxonomiesLocations
        ]?.map((coun: any) => ({
          key: coun.id,
          value: coun.id,
          label: coun.name,
        }));
        setOptParentLocation(data ?? []);
      } catch (err) {
        console.error("Failed to fetch parent locations:", err);
        setOptParentLocation([]);
      }
    };
    fetchParentOptions();
  }, [typeLocation, adminTaxonomies]);

  useEffect(() => {
    if (selectedLocations) {
      const vaData = selectedLocations;
      setIdToEdit(vaData.id ?? 0);
      setParentLocation(vaData.id_parent ?? 0);
      setLocationName(vaData.name ?? "");
      setTypeLocation(vaData.typeLoc ?? "");
      setSlug(vaData.slug ?? "");
      setFeaturedImage({ id: vaData.site_logo_id, url: vaData.site_logo ? `${API_URL}/${vaData.site_logo}` : undefined });
      setTimezone(vaData.timezone ?? "");
      setIsEdit(true);
    }
  }, [selectedLocations]);

  useTimedMessage(success, setSuccess);
  useTimedMessage(error, setError);

  const initForm = () => {
    setLocationName("");
    setSlug("");
    setTimezone("");
    setFeaturedImage(undefined);
    setTypeLocation("");
    setParentLocation(undefined);
    setIsEdit(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vaData: CreateLocationDto = {
      id_parent: parentLocation,
      name: locationName,
      slug: toSlug(slug),
      timezone: timezone,
      site_logo: featuredImage?.id,
    };

    try {
      if (!isEdit) {
        if (!typeLocation) {
          setError("Please select type location");
          return;
        }
        await createLocation(typeLocation, vaData);
        setSuccess(`${locationName} Created Successfully`);
      } else {
        await editLocation(idToEdit, typeLocation, vaData);
        setSuccess(`${locationName} Updated Successfully`);
      }
      initForm();
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cName = e.target.value;
    setLocationName(cName);
    if (!isEdit) setSlug(toSlug(cName));
  };

  return (
    <>
      <ComponentCard title={isEdit ? "Edit Area" : "Add New Area"}>
        <div className="space-y-4">
          {error && <Alert variant="error" title="Error" message={error} />}
          {success && <Alert variant="success" title="Success" message={success} />}
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Left Column: Basic Info */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Area Type</Label>
                  <Select
                    options={optTypeLocation}
                    value={typeLocation}
                    placeholder="Select type"
                    onChange={(v) => setTypeLocation(`${v}`)}
                  />
                </div>
                <div>
                  <Label>Parent</Label>
                  <Select
                    options={optParentLocation ?? []}
                    placeholder="Select Parent"
                    value={parentLocation}
                    onChange={(v) => setParentLocation(Number(v))}
                    disabled={!typeLocation || typeLocation === 'country'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cName">Area Name</Label>
                <Input
                  type="text"
                  id="cName"
                  onChange={handleNameChange}
                  value={locationName}
                  placeholder="e.g. Seminyak"
                />
              </div>

              <div>
                <Label htmlFor="cSlug">URL Slug</Label>
                <Input
                  type="text"
                  id="cSlug"
                  onChange={(e) => setSlug(e.target.value)}
                  value={slug}
                  placeholder="e.g. seminyak"
                />
              </div>

              {typeLocation === "country" && (
                <div>
                  <Label className="flex items-center gap-2">
                    Time Zone
                    <Badge color="info" className="cursor-pointer" onClick={openModalTimezone}>
                      <InfoIcon className="size-3" />
                    </Badge>
                  </Label>
                  <Select
                    options={vaDataOptTimezone}
                    value={timezone}
                    placeholder="Select Timezone..."
                    onChange={(v) => setTimezone(String(v))}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Visual Assets */}
            <div className="space-y-5">
              <div>
                <Label>Site Logo</Label>
                <p className="text-xs text-gray-500 mb-2">This logo will be displayed on the area's specific landing page.</p>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                  <AdminFeaturedImage
                    url={featuredImage?.url || ""}
                    onSave={(file) => {
                      setFeaturedImage({ url: `${API_URL}/${file.path}`, id: file.id });
                      setBlock(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
            <p className="text-sm text-gray-400 italic">
              {isEdit ? "* Editing existing area" : "* Creating new area"}
            </p>
            <div className="flex gap-3">
              {isEdit && (
                <Button type="secondary" onClick={initForm}>
                  Cancel
                </Button>
              )}
              <Button
                startIcon={<DownloadIcon className="size-5" />}
                className="px-10"
              >
                {isEdit ? "Update Area" : "Save Area"}
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>

      <ModalTimezoneTable
        isOpen={isOpenModalTimezone}
        onCLose={closeModalTimezone}
        timezonesData={vaDataTimezone}
      />
    </>
  );
}
