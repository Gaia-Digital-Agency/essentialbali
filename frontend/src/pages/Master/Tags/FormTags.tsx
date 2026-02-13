import React, { ReactElement, useEffect, useState } from "react";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Button from "../../../components/ui/button/Button";
import Alert from "../../../components/ui/alert/Alert";
import { DownloadIcon } from "../../../icons";
import { createTag, editTag } from "../../../services/tags.service";
import { CreateTagDto, GetTagByIdResponse } from "../../../types/tags.type";
import useTimedMessage from "../../../hooks/useTimedMessage";
// import toSlug from "../../../services/global.service";
import toSlug from "../../../lib/utils/slugify";
import { AdminFeaturedImage } from "../../../components/ui/featured-image/FeaturedImage";
import { AssetMedia } from "../../../types/media.type";
import { useModal } from "../../../hooks/useModal";
import { useNavigationPrompt } from "../../../hooks/useNavigationPrompt";

const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;

interface TagsFormProps {
  selectedTags?: GetTagByIdResponse;
  onRefresh: () => void;
}

export default function FormTags({ selectedTags, onRefresh }: TagsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tagTitle, setTagTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [idToEdit, setIdToEdit] = useState<number>(0);
  const [featuredImage, setFeaturedImage] = useState<{
    id: number | undefined;
    url: string | undefined;
  }>();

  const { closeModal, openModal } = useModal(false);
  const { setBlock } = useNavigationPrompt();

  useEffect(() => {
    if (selectedTags?.data?.length) {
      const vaData = selectedTags.data[0];
      setTagTitle(vaData.name ?? "");
      setSlug(vaData.slug ?? "");
      setFeaturedImage({ url: `${API_URL}/${vaData.icon}`, id: vaData.id });
      setIdToEdit(vaData.id ?? 0);
      setIsEdit(true);
    }
  }, [selectedTags]);

  useTimedMessage(success, setSuccess);
  useTimedMessage(error, setError);

  const initForm = () => {
    setTagTitle("");
    setSlug("");
    setFeaturedImage({ url: "", id: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vaData: CreateTagDto = {
      name: tagTitle,
      slug: toSlug(slug),
      icon: featuredImage?.id
    };

    try {
      console.log(vaData);
      console.log(featuredImage); 
      if (!isEdit) {
        await createTag(vaData);
        setSuccess(tagTitle + " is Created Successfully");
      } else {
        await editTag(idToEdit, vaData);
        setSuccess(tagTitle + " is Created Successfully");
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

  const handleTagTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cTitle = e.target.value;
    const cSlug = isEdit ? slug : toSlug(cTitle);
    setTagTitle(cTitle);
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

  return (
    <>
      {/* <ComponentCard title="Form Tags"> */}
      <div className="mb-5">
        {error && <Alert variant="error" title="Error" message={error} />}
      </div>
      <div className="mb-5">
        {success && (
          <Alert variant="success" title="Success" message={success} />
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 space-x-6 grid grid-cols-2">
          <div>
            <Label htmlFor="cTagTitle">Tag Title</Label>
            <Input
              type="text"
              id="cTagTitle"
              onChange={handleTagTitle}
              value={tagTitle}
              placeholder="Dog Friendly"
            />
          </div>
          <div>
            <Label htmlFor="cTagTitle">Slug</Label>
            <Input
              type="text"
              id="cTagTitle"
              onChange={(e) => setSlug(e.target.value)}
              value={slug}
              placeholder="dog-friendly"
            />
          </div>
        </div>
        <div className="w-50 h-50">
          <InputWrapper label="Icon">
            <AdminFeaturedImage
              url={featuredImage?.url ? `${featuredImage?.url}` : "#"}
              onClick={openModal}
              onSave={featuredImageHandler}
            ></AdminFeaturedImage>
          </InputWrapper>
        </div>
        <div className="flex justify-end">
          <Button
            startIcon={<DownloadIcon className="size-5" />}
            className="w-1/4"
          >
            Save
          </Button>
        </div>
      </form>
      {/* </ComponentCard> */}
    </>
  );
}
