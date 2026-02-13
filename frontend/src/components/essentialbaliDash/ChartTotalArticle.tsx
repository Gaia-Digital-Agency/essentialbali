import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useEffect, useState } from "react";
import { getTotalArticlesPerCountry } from "../../services/article.service";

export default function ChartTotalArticle() {

  // const [countries , setCountries] = useState<string[]>([]) ;
  // const [totalData, setTotalData] = useState<number[]>([]) ;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vaCountry: string[] = [] ;
        const vaDataCount: number[] = [] ;
        const getData = await getTotalArticlesPerCountry() ;
        if(getData){
          const vaData = getData.data ;
          vaData.map((d) => {
            vaCountry.push(d.name);
            vaDataCount.push(d.jumlah) ;
          })
          // setCountries(vaCountry);
          // setTotalData(vaDataCount);
        }

      } catch (error) {
        console.error(error) ;
        throw error; 
      }
    }

    fetchData()
  },[])

  // const options: ApexOptions = {
  //   colors: ["#3c8dbc"],
  //   chart: {
  //     fontFamily: "Outfit, sans-serif",
  //     type: "bar",
  //     height: 500,
  //     toolbar: {
  //       show: false,
  //     },
  //   },
  //   plotOptions: {
  //     bar: {
  //       horizontal: false,
  //       columnWidth: "39%",
  //       borderRadius: 5,
  //       borderRadiusApplication: "end",
  //     },
  //   },
  //   dataLabels: {
  //     enabled: false,
  //   },
  //   stroke: {
  //     show: true,
  //     width: 4,
  //     colors: ["transparent"],
  //   },
  //   xaxis: {
  //     categories: countries,
  //     axisBorder: {
  //       show: false,
  //     },
  //     axisTicks: {
  //       show: false,
  //     },
  //   },
  //   legend: {
  //     show: true,
  //     position: "top",
  //     horizontalAlign: "left",
  //     fontFamily: "Outfit",
  //   },
  //   yaxis: {
  //     title: {
  //       text: undefined,
  //     },
  //   },
  //   grid: {
  //     yaxis: {
  //       lines: {
  //         show: true,
  //       },
  //     },
  //   },
  //   fill: {
  //     opacity: 1,
  //   },

  //   tooltip: {
  //     x: {
  //       show: false,
  //     },
  //     y: {
  //       formatter: (val: number) => `${val}`,
  //     },
  //   },
  // };
  // const series = [
  //   {
  //     name: "Total Article",
  //     data: totalData,
  //   },
  // ];
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <>
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Total Published Article
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          {/* <Chart options={options} series={series} type="bar" height={500} /> */}
        </div>
      </div>
    </div>
    </>
  );
}
