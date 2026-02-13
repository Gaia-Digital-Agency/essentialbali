import { useEffect, useState } from "react";
import { AssetMedia, UpdateMediaPayload } from "../../types/media.type";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import TextArea from "../../components/form/input/TextArea";
import { updateAssetMedia } from "../../services/media.service";
import ComponentCard from "../../components/common/ComponentCard";
import Badge from "../../components/ui/badge/Badge";
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;

interface AssetModalProps {
  asset: AssetMedia | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (asset: AssetMedia) => void;
}

export default function AssetModal({
  asset,
  isOpen,
  onClose,
  onUpdated,
}: AssetModalProps) {
  const [form, setForm] = useState<AssetMedia | null>(null);

  // Sync asset -> form setiap kali asset berubah
  useEffect(() => {
    if (asset) {
      setForm(asset);
    }
  }, [asset]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function normalizePayload(asset: AssetMedia): UpdateMediaPayload {
    return {
      // ...asset,
      title: asset.title ?? undefined,
      alt_text: asset.alt_text ?? undefined,
      caption: asset.caption ?? undefined,
      description: asset.description ?? undefined,
      filename: asset.filename ?? undefined,
    };
  }

  const handleSave = async () => {
    if (!form) return;
    const updated = await updateAssetMedia(form.id, normalizePayload(form));
    console.log("updated", updated.data);
    onUpdated(updated.data);
    onClose();
  };

  const handleTextChange = (name: string, value: string) => {
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  return (
    <>
      <div>
        <ComponentCard title="Edit Asset">
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[584px] p-5 lg:p-10"
          >
            {form && (
              <>
                <div>
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Edit Asset Metadata
                  </h5>
                  <div className="custom-scrollbar overflow-y-auto h-[600px] px-2 pb-3">
                    <div className="flex flex-col items-center justify-center pt-5">
                      <div className="inline-flex rounded border border-gray-300 mb-2 mr-2 w-max-full h-50 p-1 box-border">
                        <img
                          src={API_URL + "/" + form.path}
                          alt={form.alt_text || ""}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Uploaded at :{" "}
                        <Badge size="sm" color="success">
                          {form.createdAt}
                        </Badge>
                      </p>
                    </div>

                    <div className="col-span-1 pb-5">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        name="title"
                        value={form.title || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-1 pb-5">
                      <Label>Filename</Label>
                      <Input
                        name="filename"
                        value={form.filename || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-1 pb-5">
                      <Label>Alt Text</Label>
                      <Input
                        name="alt_text"
                        value={form.alt_text || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-1 pb-5">
                      <Label>Caption</Label>
                      <TextArea
                        name="caption"
                        value={form.caption || ""}
                        onChange={(value) => handleTextChange("caption", value)}
                        rows={4}
                      />
                    </div>

                    <div className="col-span-1 pb-5">
                      <Label>Description</Label>
                      <TextArea
                        name="description"
                        value={form.description || ""}
                        onChange={(value) =>
                          handleTextChange("description", value)
                        }
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2 mt-2 lg:justify-end">
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                  </div>
                </div>
              </>
            )}
          </Modal>
        </ComponentCard>
      </div>
    </>
  );
}
