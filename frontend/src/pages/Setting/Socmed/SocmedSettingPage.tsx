import { useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { ListIcon, PencilIcon } from "../../../icons";
import TableSocmed from "./TableSocmed";
import { SocmedDetailInterface } from "../../../types/socmed.type";
import FormSocmed from "./FormSocmed";

export default function SocmedSettingPage() {
  const [selectedTab, setSelectedTab] = useState<string>("datas");
  const [selectedSocmed, setSelectedSocmed] = useState<SocmedDetailInterface[]>();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOnEditTags = (data: SocmedDetailInterface[]) => {
    setSelectedSocmed(data);
    setSelectedTab("form");
  };

  return (
    <div>
      <PageMeta
        title="essentialbali Admin Dashboard | Social Media Settings"
        description="This is Social Media Setting Page for essentialbali Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Social Media" />
      <ComponentCard title="" className="mt-12">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
          <div className="space-y-12">
            <nav className="flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
              <button
                onClick={() => setSelectedTab("datas")}
                className={`inline-flex items-center gap-2 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ${
                  selectedTab === "datas"
                    ? "text-brand-500 border-brand-500 dark:text-brand-400 dark:border-brand-400"
                    : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <ListIcon className="size-5" />
                Data Social Media
              </button>
              <button
                onClick={() => setSelectedTab("form")}
                className={`inline-flex items-center gap-2 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ${
                  selectedTab === "form"
                    ? "text-brand-500 border-brand-500 dark:text-brand-400 dark:border-brand-400"
                    : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <PencilIcon className="size-5" />
                Form
              </button>
            </nav>
            {selectedTab === "datas" && (
              <TableSocmed
                onEditSocmed={handleOnEditTags}
                refreshKey={refreshKey}
                onRefresh={handleRefresh}
              />
            )}
            {selectedTab === "form" && (
              <FormSocmed selectedSocmed={selectedSocmed} onRefresh={handleRefresh} />
            )}
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
