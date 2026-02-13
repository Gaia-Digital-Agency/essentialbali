import React, { ReactElement, useEffect, useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import TextArea from "../../../components/form/input/TextArea";
import Radio from "../../../components/form/input/Radio";

import {
  createCategory,
  editCategory,
  getAllCategory,
  getCategoryDescByLocation,
} from "../../../services/category.service";
import Alert from "../../../components/ui/alert/Alert";
// import toSlug from "../../../services/global.service";
import toSlug from "../../../lib/utils/slugify";
import useTimedMessage from "../../../hooks/useTimedMessage";
import { getAllLocationByType } from "../../../services/location.service";
import { Category, categoryService } from "../../../types/category.type";
import { InfoIcon } from "lucide-react";
import ReactSelect from "react-select";
import { Tag } from "../../../types/tags.type";
import { getAllTags } from "../../../services/tags.service";

const DefaultTooltip: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="relative inline-block group">
      <InfoIcon />
      <div className="invisible absolute w-48 text-wrap z-50 bottom-full left-1/2 mb-2.5 border border-black -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100">
        <div className="relative">
          <div className="drop-shadow-4xl whitespace-nowrap rounded-lg bg-white px-3 py-2 text-md font-medium text-gray-700 dark:bg-[#1E2634] dark:text-white">
            {message}
          </div>
          <div className="absolute -bottom-1 left-1/2 h-3 w-4 -translate-x-1/2 rotate-45 bg-white dark:bg-[#1E2634]"></div>
        </div>
      </div>
    </div>
  );
};

const InputWrapper = ({
  label,
  children,
  tooltip,
}: {
  label: string;
  children: ReactElement;
  tooltip?: string;
}) => {
  return (
    <div className="input-wrapper">
      <div className="label-wrapper mb-4 flex gap-x-2 items-center">
        <p>{label}</p>
        {tooltip && <DefaultTooltip message={tooltip} />}
      </div>
      {children}
    </div>
  );
};

interface FormCategoriesProps {
  selectedCategory: Category | null;
  clearSelected: () => void;
  onSaveSuccess: () => void;
  refreshKey: number;
}

interface optionDataInterface {
  key: string | number;
  value: string | number;
  label: string;
}

// {
//     "id": 1001,
//     "title": "Sit illo quia quia ",
//     "sub_title": "Quo facere enim porr",
//     "slug_title": "dolores-est-cumque-v",
//     "description": "Eligendi qui ratione",
//     "icon": null,
//     "is_child": true,
//     "id_parent": 6,
//     "template_name": "Shafira Singleton",
//     "createdBy": 1,
//     "updatedBy": 1,
//     "createdAt": "2025-11-13T01:44:50.000Z",
//     "updatedAt": "2025-11-13T01:44:50.000Z",
//     "tag": []
// }

export default function FormCategories({
  selectedCategory,
  clearSelected,
  onSaveSuccess,
  refreshKey,
}: FormCategoriesProps) {
  const [categoryTitle, setCategoryTitle] = useState<string>("");
  const [categorySubTitle, setCategorySubTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [optIDParent, setOptIDParent] = useState<
    Array<{ value: string | number; label: string }>
  >([]);
  const [idParent, setIDParent] = useState<number>(0);
  const [templateName, setTemplateName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedLocationType, setSelectedLocationType] =
    useState<string>("global");
  const [vaDataLocation, setDataLocation] = useState<optionDataInterface[]>([]);
  const [idLocation, setIdLocation] = useState(0);
  const [isChild, setIsChild] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCategory) {
      console.log("selectedCategory", typeof selectedCategory.is_child);
      setCategoryTitle(selectedCategory.title);
      setCategorySubTitle(selectedCategory.sub_title);
      setSlug(selectedCategory.slug_title);
      setDescription(selectedCategory.description);
      setIDParent(selectedCategory.id_parent);
      setTemplateName(selectedCategory.template_name);
      setTags(selectedCategory.tag ?? []);
      setIsChild(selectedCategory.is_child);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const fetchDataLocation = async () => {
      try {
        const vaLocBegin = { key: 0, value: 0, label: "Select Bali Scope" };
        let vaData;
        if (selectedLocationType !== "global") {
          vaData = await getAllLocationByType(selectedLocationType);
          const optDataLocation =
            vaData.data?.map((loc) => ({
              key: loc.id,
              value: loc.id,
              label: loc.name,
            })) ?? [];
          setDataLocation([vaLocBegin, ...optDataLocation]);
        } else {
          setDataLocation([vaLocBegin]);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    };
    fetchDataLocation();
  }, [selectedLocationType]);

  useEffect(() => {
    const fetchIDParent = async () => {
      try {
        const response = await getAllCategory();
        const vaOption = response.data.map((item: Category) => ({
          value: item.id,
          label: item.title,
        }));
        setOptIDParent(vaOption);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchIDParent();
  }, [refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    // e: React.FormEvent
    e.preventDefault();
    try {
      const vaData: categoryService = {
        title: categoryTitle,
        sub_title: categorySubTitle,
        slug_title: toSlug(slug),
        description: description,
        id_parent: idParent,
        template_name: templateName,
        tag : tags
      };

      if (selectedLocationType !== "global") {
        if (!idLocation) {
          setError("Please Select Bali Scope");
          return;
        }

        if (selectedLocationType === "country") {
          vaData.id_country = idLocation;
        } else if (selectedLocationType === "city") {
          vaData.id_city = idLocation;
        } else if (selectedLocationType === "region") {
          vaData.id_region = idLocation;
        }
      }

      if (selectedCategory) {
        await editCategory(selectedCategory.id, vaData);
        setSuccess(categoryTitle + " is Updated Successfully");
      } else {
        await createCategory(vaData);
        setSuccess(categoryTitle + " is Created Successfully");
      }

      clearSelected(); 
      setSuccess(categoryTitle + " is Created Successfully");
      setCategoryTitle("");
      setCategorySubTitle("");
      setSlug("");
      setDescription("");
      setIDParent(0);
      setTemplateName("");
      setIdLocation(0);
      setSelectedLocationType("global");
      setTags([]);
      onSaveSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }

      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        setError(errorObj.response?.data?.message ?? "Something went wrong");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCategoryTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cTitle = e.target.value;
    const cSlug = selectedCategory
      ? selectedCategory.slug_title
      : toSlug(cTitle);
    setCategoryTitle(cTitle);
    setSlug(cSlug);
  };

  const handleSelectLocation = async (value: string | number) => {
    setIdLocation(Number(value));

    if (selectedCategory) {
      try {
        const vaResponse = await getCategoryDescByLocation(
          selectedLocationType,
          Number(value),
          selectedCategory.id
        );
        const vaDataDesc = vaResponse.data;
        setDescription(vaDataDesc.description);
        setCategorySubTitle(vaDataDesc.sub_title);
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  };

  const handleSelectIDParent = (value: string | number) => {
    setIDParent(Number(value));
  };

  const handleRadioChange = async (value: string) => {
    setSelectedLocationType(value);
    setIdLocation(0); // reset ke awal
    await handleSelectLocation(0);
  };

  useTimedMessage(success, setSuccess);
  useTimedMessage(error, setError);

  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tags, setTags] = useState<number[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const getTags = await getAllTags();
        setAvailableTags(getTags.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTags();
  }, []);

  const tagsChangeHandler = (e: any) => {
    setTags(
      e.map((tag: { value: string | number; label: string }) => tag.value)
    );
  };

  const renderTags = () => {
    if (!availableTags.length || isChild) return;
    return (
      <InputWrapper label="Related Tags">
        <ReactSelect
          options={availableTags.map((tag) => ({
            label: tag.name,
            value: tag.id,
          }))}
          isMulti={true}
          onChange={tagsChangeHandler}
          value={availableTags
            .filter((tag) => tags.includes(tag.id))
            .map((tag) => ({ value: tag.id, label: tag.name }))}
        />
      </InputWrapper>
    );
  };

  return (
    <>
      <ComponentCard
        title={selectedCategory ? "Edit Category" : "Add Category"}
      >
        {/* Tambahkan pesan error di sini */}
        <div className="mb-5">
          {error && <Alert variant="error" title="Error" message={error} />}
        </div>
        <div className="mb-5">
          {/* //title created successfully */}
          {success && (
            <Alert variant="success" title="Success" message={success} />
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label htmlFor="cCategoryTitle">Category Title</Label>
              <Input
                type="text"
                id="cCategoryTitle"
                onChange={handleCategoryTitle}
                value={categoryTitle}
                placeholder="Acme"
              />
            </div>
            <div>
              <Label htmlFor="cSlug">Slug</Label>
              <Input
                type="text"
                id="cSlug"
                onChange={(e) => setSlug(e.target.value)}
                value={slug}
                placeholder="slug-category"
              />
            </div>
            <div>
              <Label>Bali Scope</Label>
              <div className="flex flex-wrap items-center gap-8">
                <Radio
                  id="optLocationType_global"
                  name="group1"
                  value="global"
                  checked={selectedLocationType === "global"}
                  onChange={handleRadioChange}
                  label="All Bali"
                />
                <Radio
                  id="optLocationType_country"
                  name="group1"
                  value="country"
                  checked={selectedLocationType === "country"}
                  onChange={handleRadioChange}
                  label="Bali Area"
                />
                <Radio
                  id="optLocationType_city"
                  name="group1"
                  value="city"
                  checked={selectedLocationType === "city"}
                  onChange={handleRadioChange}
                  label="Sub Area"
                />
                <Radio
                  id="optLocationType_region"
                  name="group1"
                  value="region"
                  checked={selectedLocationType === "region"}
                  onChange={handleRadioChange}
                  label="Local Zone"
                />
              </div>
            </div>
            <div>
              <Label>Bali Scope</Label>
              <Select
                options={vaDataLocation}
                value={idLocation}
                placeholder="Select Bali Scope"
                onChange={handleSelectLocation}
                className="h-lg dark:bg-dark-900"
              />
            </div>
            <div>
              <Label htmlFor="cCategorySubTitle">Category Sub Title</Label>
              <Input
                type="text"
                id="cCategorySubTitle"
                onChange={(e) => setCategorySubTitle(e.target.value)}
                value={categorySubTitle}
                placeholder="Sub Title..."
              />
            </div>
            <div>
              <Label>Description</Label>
              <TextArea
                value={description}
                onChange={(value) => setDescription(value)}
                rows={6}
                placeholder="Enter Description..."
              />
            </div>
            <div>
              <Label>ID Parent</Label>
              <Select
                options={[{ value: 0, label: "-" }, ...optIDParent]}
                value={idParent}
                placeholder="Select an option"
                onChange={handleSelectIDParent}
                className="h-lg dark:bg-dark-900"
              />
            </div>
            <div>
              <Label>Template Name</Label>
              <Input
                type="text"
                id="cTemplateName"
                onChange={(e) => setTemplateName(e.target.value)}
                value={templateName}
                placeholder="Template Name..."
              />
            </div>
            {renderTags()}
            <div className="flex justify-end">
              <Button className="w-1/3">
                {/* onClick={handleSubmit}  */}
                Save
              </Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </>
  );
}
