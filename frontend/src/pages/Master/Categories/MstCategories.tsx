import { useState } from "react";
// import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import FormCategories from "./FormCategories";
import TableCategories from "./TableCategories";
import { Category } from "../../../types/category.type";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";

export default function MstCategories() {
  const [refreshKey, setRefreshKey] = useState(0); // untuk trigger refresh table
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  function handleSaveSuccess() {
    // setiap kali form save sukses → table di-refresh
    setRefreshKey((prev) => prev + 1);
    setSelectedCategory(null); // reset form biar kosong
  }

  return (
    <div>
      <PageMeta
        title="essentialbali Admin Dashboard | Master Categories"
        description="This is Master Categories Dashboard page for essentialbali Admin Dashboard Template"
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        <div className="space-y-12">
          <PageBreadcrumb pageTitle="Master Categories" />
          <FormCategories
            selectedCategory={selectedCategory}
            onSaveSuccess={handleSaveSuccess}
            clearSelected={() => setSelectedCategory(null)}
            refreshKey={refreshKey}
          />
          <TableCategories
            refreshKey={refreshKey}
            onEditCategory={setSelectedCategory}
            onSaveSuccess={handleSaveSuccess}
          />
        </div>
      </div>
    </div>
  );
}
