import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UserMetaCard from "./UserMetaCard";
import PageMeta from "../../components/common/PageMeta";

export default function UserProfiles() {
  return (
    <>
      <PageMeta
        title="essentialbali Admin Dashboard | User Profile"
        description="This is User Profile Dashboard page for essentialbali Admin Dashboard Template"
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        <PageBreadcrumb pageTitle="Profile" />
        <div className="space-y-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
              Profile
            </h3>
            <div className="space-y-6">
              <UserMetaCard />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
