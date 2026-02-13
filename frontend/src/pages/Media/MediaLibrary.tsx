import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import EditMediaModal from "./AssetModal";
import { AssetMedia } from "../../types/media.type";
import { getAllMedia } from "../../services/media.service";
import AssetModal from "./AssetModal";
import PageMeta from "../../components/common/PageMeta";
// cara akses nilai di .env
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;

export default function MediaLibrary() {
  const [assets, setAssets] = useState<AssetMedia[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetMedia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllAssetMedia = async () => {
      try {
        const response = await getAllMedia();
        if (response) {
          const vaData = response.data;
          setAssets(vaData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchAllAssetMedia();
  }, []);

  const handleClick = (asset: AssetMedia) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleUpdated = (updated: AssetMedia) => {
    console.log("update handled =>", updated);
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  return (
    <>
      <PageMeta
        title="essentialbali Admin Dashboard | Media Library"
        description="This is Media Library Dashboard page for essentialbali Admin Dashboard Template"
      />
      <div className="pb-5 grid grid-cols-1 gap-6 xl:grid-cols-1">
        <div className="space-y-12">
          <PageBreadcrumb pageTitle="Media Library" />
        </div>
      </div>
      <ComponentCard title="Media Library">
        {assets.map((file) => (
          <div
            key={file.id}
            onClick={() => handleClick(file)}
            className="inline-flex rounded border border-gray-300 mb-2 mr-2 w-45 h-45 p-1 box-border"
          >
            <div className="flex min-w-0 overflow-hidden items-center justify-center align-middle">
              <img
                src={API_URL + `/${file.path}`}
                className="block w-auto h-full object-cover hover:scale-110 transition duration-500 ease-in-out"
                onLoad={() => {
                  URL.revokeObjectURL(API_URL + "/" + file.path);
                }}
              />
            </div>
          </div>
        ))}
      </ComponentCard>

      <AssetModal
        asset={selectedAsset}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdated={handleUpdated}
      />
    </>
  );
}
