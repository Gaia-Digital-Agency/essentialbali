// import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
// import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";
// import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
// import RecentOrders from "../../components/ecommerce/RecentOrders";
// import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
// import ChartTotalArticle from "../../components/essentialbaliDash/ChartTotalArticle";
import FirstSection from "../../components/essentialbaliDash/FirstSection";
import PinnedArticles from "../../components/essentialbaliDash/PinnedArticles";
import TrendingArticleTable from "../../components/essentialbaliDash/TrendingArticleTable";

export default function Home() {
  return (
    <>
      <PageMeta
        title="essentialbali - Admin Dashboard"
        description="essentialbali - Admin Dashboard"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-12">
          <FirstSection />
        </div>

        <div className="col-span-12">
          <PinnedArticles />
        </div>

        <div className="col-span-12">
          <TrendingArticleTable />
        </div>

        <div className="col-span-5">
          {/* <ChartTotalArticle /> */}
        </div>

      </div>
    </>
  );
}
