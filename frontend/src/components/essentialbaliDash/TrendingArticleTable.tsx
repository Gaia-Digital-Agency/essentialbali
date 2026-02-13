import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getTop10TrendingArticle } from "../../services/article.service";
import { ArticleApiResponseProps } from "../../types/article.type";
import Badge from "../ui/badge/Badge";
import Avatar from "../ui/avatar/Avatar";
// import Select from "../form/Select";
// import { useTaxonomies } from "../../context/TaxonomyContext";
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;
// type SelectInputProps = { label: string; value: number | string };

// const FilterDropdown: React.FC<{
//   // showFilter: boolean;
//   setShowFilter: (show: boolean) => void;
// }> = ({
//   // showFilter,
//   setShowFilter,
// }) => {
//   const ref = React.useRef<HTMLDivElement>(null);

//   // const [availableCountries, setAvailableCountries] = useState<
//   // SelectInputProps[]
//   // >([]);
//   // const {taxonomies, adminTaxonomies } = useTaxonomies();
//   // const [country, setBali Area] = useState<number>(0);
//   // const [selectedBali Area, setSelectedBali Area] = useState<number>();

//   React.useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (ref.current && !ref.current.contains(event.target as Node)) {
//         setShowFilter(false);
//       }
//     };
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, [setShowFilter]);

//   // useEffect(() => {
//   //   if (!adminTaxonomies) return;
//   //   try {
//   //     setAvailableCountries(
//   //       adminTaxonomies.countries?.map((coun) => ({
//   //         value: coun.id,
//   //         label: coun.name,
//   //       })) ?? []
//   //     );
//   //   } catch (e) {
//   //     console.log(e);
//   //   }
//   // }, [adminTaxonomies]);

//   // const countryChangeHandler = (value: string | number) => {
//   //   if (value != country) {
//   //     setBali Area(typeof value == "string" ? parseInt(value) : value);
//   //   }
//   // };

//   // const applyFilter = () => {
//   //   setShowFilter(false);
//   //   setSelectedBali Area(country);
//   // };

//   return (
//     <></>
//     // <div className="relative" ref={ref}>
//     //   <button
//     //     className="shadow-theme-xs flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 sm:w-auto sm:min-w-[100px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
//     //     onClick={() => setShowFilter(!showFilter)}
//     //     type="button"
//     //   >
//     //     <svg
//     //       xmlns="http://www.w3.org/2000/svg"
//     //       width="20"
//     //       height="20"
//     //       viewBox="0 0 20 20"
//     //       fill="none"
//     //     >
//     //       <path
//     //         d="M14.6537 5.90414C14.6537 4.48433 13.5027 3.33331 12.0829 3.33331C10.6631 3.33331 9.51206 4.48433 9.51204 5.90415M14.6537 5.90414C14.6537 7.32398 13.5027 8.47498 12.0829 8.47498C10.663 8.47498 9.51204 7.32398 9.51204 5.90415M14.6537 5.90414L17.7087 5.90411M9.51204 5.90415L2.29199 5.90411M5.34694 14.0958C5.34694 12.676 6.49794 11.525 7.91777 11.525C9.33761 11.525 10.4886 12.676 10.4886 14.0958M5.34694 14.0958C5.34694 15.5156 6.49794 16.6666 7.91778 16.6666C9.33761 16.6666 10.4886 15.5156 10.4886 14.0958M5.34694 14.0958L2.29199 14.0958M10.4886 14.0958L17.7087 14.0958"
//     //         stroke="currentColor"
//     //         strokeWidth="1.5"
//     //         strokeLinecap="round"
//     //         strokeLinejoin="round"
//     //       />
//     //     </svg>
//     //     Filter
//     //   </button>
//     //   {showFilter && (
//     //     <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
//     //       <div className="mb-5">
//     //         <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
//     //           Bali Area
//     //         </label>
//     //         {/* <input
//     //           type="text"
//     //           className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
//     //           placeholder="Search category..."
//     //         /> */}
//     //         <Select
//     //           options={availableCountries}
//     //           placeholder="Select an option"
//     //           onChange={countryChangeHandler}
//     //           defaultValue=""
//     //           className="bg-gray-50 dark:bg-gray-800"
//     //         />
//     //       </div>
//     //       <button onClick={applyFilter} className="bg-brand-500 hover:bg-brand-600 h-10 w-full rounded-lg px-3 py-2 text-sm font-medium text-white">
//     //         Apply
//     //       </button>
//     //     </div>
//     //   )}
//     // </div>
//   );
// };

export default function TrendingArticleTable() {
  // const [showFilter, setShowFilter] = useState(false);
  const [dataArticle, setDataArticle] = useState<ArticleApiResponseProps[]>([]);

  useEffect(() => {
    const fetchDataArticles = async () => {
      try {
        const vaData = await getTop10TrendingArticle();
        if (vaData) {
          const vaArticle = vaData.articles;
          setDataArticle(vaArticle);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDataArticles();
  }, []);

  const generateImageUrl = (image: string | undefined, isFlag: boolean = false, id: number = 0) => {
    if (image) {
      return `${API_URL}/${image}`;
    }

    if(isFlag) {
      return`/images/country/flag.svg`;
    }else{
      return `https://picsum.photos/id/${id * 10}/1920/1080`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Trending Articles
          </h3>
        </div>

        {/**
        <div className="flex items-center gap-3">
             
        <FilterDropdown
          // showFilter={showFilter}
          // setShowFilter={setShowFilter}
        />
      </div>
             */}
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                #
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Title
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Category
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Bali Area
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Author
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Date of Publish
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {dataArticle?.map((article, index) => (
              <TableRow key={article.id} className="">
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {++index}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <img
                        src={generateImageUrl(
                          article.featured_image_url,
                          false,
                          article.id
                        )}
                        className="h-[50px] w-[50px]"
                        alt={article.title}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {article.title}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {article.sub_title}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                  {article.category_name}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <div className="mb-2 flex items-center justify-center">
                    <Avatar
                      // src={`/images/country/${getBali AreaFlag(
                      //   article.name_country
                      // )}`}

                      src={generateImageUrl(article.country_flag,true)}
                      size="xsmall"
                      alt={article.name_country}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {article.name_country}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color="primary">
                    {article.author_name}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color="success">
                    {formatDate(article.publishedAt)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
