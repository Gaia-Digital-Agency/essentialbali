import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import FormLocations from "./FormLocations";
import TableLocations from "./TableLocations";
import { Location } from "../../../types/location.type";
// import FormLocations from "./FormLocations";
// import TableLocations from "./TableLocations";
// import { GetTagByIdResponse } from "../../../types/Locations.type";

export default function MstLocations() {
  const [selectedLocations, setSelectedLocations] = useState<Location>();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <PageMeta
        title="essentialbali Admin Dashboard | Bali Areas"
        description="Manage Bali areas and their CMS pages."
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        <div className="space-y-12">
          <PageBreadcrumb pageTitle="Bali Areas" />
          <FormLocations
            selectedLocations={selectedLocations}
            onRefresh={handleRefresh}
          />
          <TableLocations
            onEditLocation={setSelectedLocations}
            refreshKey={refreshKey}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </div>
  );
}
