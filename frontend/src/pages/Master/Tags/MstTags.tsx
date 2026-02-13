import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import FormTags from "./FormTags";
import TableTags from "./TableTags";
import { GetTagByIdResponse } from "../../../types/tags.type";
import ComponentCard from "../../../components/common/ComponentCard";
import { PencilIcon, ListIcon } from "../../../icons";


export default function MstTags() {
  const [selectedTab, setSelectedTab] = useState<string>("datas");
  const [selectedTags, setSelectedTags] = useState<GetTagByIdResponse>();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOnEditTags = (tag: GetTagByIdResponse) => {
    setSelectedTags(tag);
    setSelectedTab("form");
  };

  return (
    <div>
      <PageMeta
        title="essentialbali Admin Dashboard | Master Tags"
        description="This is Master Tags Dashboard page for essentialbali Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Tags" />
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
                Data Tags
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
              <TableTags
                onEditTags={handleOnEditTags}
                refreshKey={refreshKey}
                onRefresh={handleRefresh}
              />
            )}

            {selectedTab === "form" && (
              <FormTags selectedTags={selectedTags} onRefresh={handleRefresh} />
            )}
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
