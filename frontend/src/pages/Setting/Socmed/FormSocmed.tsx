import React, { ReactElement, useEffect, useState } from "react";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Button from "../../../components/ui/button/Button";
import Alert from "../../../components/ui/alert/Alert";
import { DownloadIcon } from "../../../icons";
import { SocmedDetailInterface, SocmedEntryDataInterface } from "../../../types/socmed.type";
import useTimedMessage from "../../../hooks/useTimedMessage";
import { AdminFeaturedImage } from "../../../components/ui/featured-image/FeaturedImage";
import { AssetMedia } from "../../../types/media.type";
import { useModal } from "../../../hooks/useModal";
import { useNavigationPrompt } from "../../../hooks/useNavigationPrompt";
import { createSocmed, editSocmed } from "../../../services/socmed.service";

const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;

interface SocmedFormProps {
  selectedSocmed?: SocmedDetailInterface[];
  onRefresh: () => void;
}

export default function FormSocmed({ selectedSocmed, onRefresh }: SocmedFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [platformName, setPlatformName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [idToEdit, setIdToEdit] = useState<number>(0);
  const [featuredImage, setFeaturedImage] = useState<{
    id: number | undefined;
    url: string | undefined;
  }>();

  const { closeModal, openModal } = useModal(false);
  const { setBlock } = useNavigationPrompt();

  useEffect(() => {
    if (selectedSocmed) {
      const vaData = selectedSocmed[0];
      setPlatformName(vaData.platform ?? "");
      setUrl(vaData.url ?? "");
      setFeaturedImage({ url: `${API_URL}/${vaData.icon}`, id: vaData.id });
      setIdToEdit(vaData.id ?? 0);
      setIsEdit(true);
    }
  }, [selectedSocmed]);

  useTimedMessage(success, setSuccess);
  useTimedMessage(error, setError);

  const initForm = () => {
    setPlatformName("");
    setUrl("");
    setFeaturedImage({ url: "", id: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vaData: SocmedEntryDataInterface = {
      platform_name: platformName,
      icon: featuredImage?.id,
      url: url
    };

    try {
      if (!isEdit) {
        await createSocmed(vaData);
        setSuccess(platformName + " is Created Successfully");
      } else {
        // console.log("edit true");
        await editSocmed(idToEdit, vaData);
        setSuccess(platformName + " is Created Successfully");
      }
      initForm();
      onRefresh();
    } catch (err: unknown) {
      console.error("OPO IKI ??", err);
      if (err instanceof Error) {
        setError(err.message);
      }

      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        setError(errorObj.response?.data?.message ?? "Something went wrong");
      }
    }
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
      {/* <ComponentCard title="Form Socmed"> */}
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
            <Label htmlFor="cPlatformName">Platform Name</Label>
            <Input
              type="text"
              id="cPlatformName"
              onChange={(e) => setPlatformName(e.target.value)}
              value={platformName}
              placeholder="Acme"
            />
          </div>
          <div>
            <Label htmlFor="cSocmedUrl">Url</Label>
            <Input
              type="url"
              id="cSocmedUrl"
              onChange={(e) => setUrl(e.target.value)}
              value={url}
              placeholder="https://www.example.com/username"
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
