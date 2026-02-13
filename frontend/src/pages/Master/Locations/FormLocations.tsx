import React, { ReactElement, useEffect, useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Button from "../../../components/ui/button/Button";
import Alert from "../../../components/ui/alert/Alert";
import { DownloadIcon } from "../../../icons";
import { CreateLocationDto, Location } from "../../../types/location.type";
import useTimedMessage from "../../../hooks/useTimedMessage";
import Select from "../../../components/form/Select";
import {
  createLocation,
  editLocation,
} from "../../../services/location.service";
// import toSlug from "../../../services/global.service";
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
  country: null, // country nggak punya parent
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
  const [vaDataTimezone, setDataTimezone] = useState<GetDataTimezoneResponse[]>(
    []
  );
  const [vaDataOptTimezone, setDataOptTimezone] = useState<
    optionDataInterface[]
  >([]);

  const [featuredImage, setFeaturedImage] = useState<{
    id: number | undefined;
    url: string | undefined;
  }>();

  const [flagIcon, setFlagIcon] = useState<{
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
    { key: "city", value: "city", label: "Sub Area (City)" },
    { key: "region", value: "region", label: "Sub Area (Region)" },
  ];
  const handleTypeLocation = (value: string | number) => {
    setTypeLocation(`${value}`);
  };

  const handleParentLocation = (value: string | number) => {
    setParentLocation(Number(value));
  };

  const handleOptTimezone = (value: string | number) => {
    setTimezone(String(value));
  };

  const showModalTimezone = () => {
    openModalTimezone();
  };

  useEffect(() => {
    const fetchDataTimezone = async () => {
      try {
        const vaData = await getTimezones();
        const vaTimezones = vaData.data;
        const begin = { key: 0, value: 0, label: "Select Timezone" };
        const optDataTimezone =
          vaTimezones?.map((timezone) => ({
            key: timezone.id,
            value: timezone.timezone_name,
            label: timezone.timezone_name + " - [" + timezone.utc_offset + "]",
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
      // if (!typeLocation) return;

      // const parentType = parentMap[typeLocation];
      // if (!parentType) {
      //   setOptParentLocation([]); // kalau nggak ada parent
      //   return;
      // }

      try {
        // const res = await getAllLocationByType(parentType);
        // if (res.data) {
        //   const vaData = res.data.map((loc) => ({
        //     key: loc.id,
        //     value: loc.id,
        //     label: loc.name,
        //   }));
        //   setOptParentLocation(vaData);
        // }
        // console.log(typeLocation, 'typeLocation')
        const parentType = parentMap[typeLocation] as TaxonomyLocations;
        const data = adminTaxonomies?.[
          PLURAL_TAXONOMY_NAME[parentType] as TaxonomiesLocations
        ]?.map((coun: any) => ({
          key: coun.id,
          value: coun.id,
          label: coun.name,
        }));
        // console.log(adminTaxonomies)
        setOptParentLocation(data ?? []);
      } catch (err) {
        console.error("Failed to fetch parent locations:", err);
        setOptParentLocation([]);
      }
    };

    fetchParentOptions();
  }, [typeLocation]);

  useEffect(() => {
    if (selectedLocations) {
      const vaData = selectedLocations;
      setIdToEdit(vaData.id ?? 0);
      setParentLocation(vaData.id_parent ?? 0);
      setLocationName(vaData.name ?? "");
      setTypeLocation(vaData.typeLoc ?? "");
      setSlug(vaData.slug ?? "");
      setFeaturedImage({ id: vaData.site_logo_id, url: `${API_URL}/${vaData.site_logo}` });
      setFlagIcon({ id: vaData.flag_icon_id, url: `${API_URL}/${vaData.flag_icon}` });
      // setFeaturedImage({ url: `${API_URL}/${vaData.icon}`, id: vaData.id });
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
    setFeaturedImage({ url: "", id: undefined });
    setFlagIcon({ url: "", id: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vaData: CreateLocationDto = {
      id_parent: parentLocation,
      name: locationName,
      slug: toSlug(slug),
      timezone: timezone,
      site_logo: featuredImage?.id,
      flag_icon: flagIcon?.id
    };

    try {
      if (!isEdit) {
        if (!typeLocation) {
          setError("Please select type location");
          return;
        }
        await createLocation(typeLocation, vaData);
        setSuccess(locationName + " is Created Successfully");
      } else {
        await editLocation(idToEdit, typeLocation, vaData);
        setSuccess(locationName + " is Edited Successfully");
      }
      initForm();
      onRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }

      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        setError(errorObj.response?.data?.message ?? "Something went wrong");
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cName = e.target.value;
    const cSlug = isEdit ? slug : toSlug(cName);
    setLocationName(e.target.value);
    setSlug(cSlug);
  };

  const InputWrapper = ({
    label,
    children,
  }: {
    label: string;
    children: ReactElement;
  }) => {
    return (
      <div className="input-wrapper">
        <Label>{label}</Label>
        {children}
      </div>
    );
  };

  const featuredImageHandler = (file: AssetMedia) => {
    setFeaturedImage({ url: `${API_URL}/${file.path}`, id: file.id });
    closeModal();
    setBlock(true);
  };

  const flagIconHandler = (file: AssetMedia) => {
    setFlagIcon({ url: `${API_URL}/${file.path}`, id: file.id });
    closeModal();
    setBlock(true);
  };

  return (
    <>
      <ComponentCard title="Area Form">
        <div className="mb-5">
          {error && <Alert variant="error" title="Error" message={error} />}
        </div>
        <div className="mb-5">
          {success && (
            <Alert variant="success" title="Success" message={success} />
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 space-x-6 grid grid-cols-2">
            <div>
              <Label>Area Type</Label>
              <Select
                options={optTypeLocation}
                value={typeLocation}
                placeholder="Select area type"
                onChange={handleTypeLocation}
                className="dark:bg-dark-900"
              />
            </div>
            <div>
              <Label>Parent</Label>
              <Select
                options={optParentLocation ?? []}
                placeholder="Select Parent"
                value={parentLocation}
                onChange={handleParentLocation}
                className="dark:bg-dark-900"
              />
            </div>
          </div>
          <div className="mb-3">
            <Label htmlFor="cName">Name</Label>
            <Input
              type="text"
              id="cName"
              onChange={handleNameChange}
              value={locationName}
              placeholder="Seminyak"
            />
          </div>
          {typeLocation === "country" && (
            <div className="mb-3">
              <Label>
                <span className="mr-2">Time Zone</span>
                <Badge color="info" onClick={showModalTimezone}>
                  ?
                </Badge>
              </Label>
              <Select
                options={vaDataOptTimezone}
                value={timezone}
                placeholder="Select Timezone..."
                onChange={handleOptTimezone}
                className="dark:bg-dark-900"
              />
            </div>
          )}
          <div className="mb-3">
            <Label htmlFor="cSlug">Slug</Label>
            <Input
              type="text"
              id="cSlug"
              onChange={(e) => setSlug(e.target.value)}
              value={slug}
              placeholder="seminyak"
            />
          </div>
          <div className="w-50 h-50">
            <InputWrapper label="Site Logo">
              <AdminFeaturedImage
                url={featuredImage?.url ? `${featuredImage?.url}` : "#"}
                onClick={openModal}
                onSave={featuredImageHandler}
              ></AdminFeaturedImage>
            </InputWrapper>
          </div>
          
          {typeLocation === "country" && (<div className="w-50 h-50">
            <InputWrapper label="Flag Icon">
              <AdminFeaturedImage
                url={flagIcon?.url ? `${flagIcon?.url}` : "#"}
                onClick={openModal}
                onSave={flagIconHandler}
              ></AdminFeaturedImage>
            </InputWrapper>
          </div>)}

          <div className="space-y-6 space-x-6 flex justify-end">
            <Button
              startIcon={<DownloadIcon className="size-5" />}
              className="w-1/4"
            >
              Save
            </Button>
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
