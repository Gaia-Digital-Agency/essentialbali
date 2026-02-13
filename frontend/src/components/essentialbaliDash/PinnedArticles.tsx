import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getArticleByFields } from "../../services/article.service";
import { ArticleApiResponseProps } from "../../types/article.type";
import Badge from "../ui/badge/Badge";
import Avatar from "../ui/avatar/Avatar";
import useArticle from "../../hooks/useArticle";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/button/Button";
import { Link } from "react-router";
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;

const PinnedArticles: React.FC = () => {
  const [dataArticle, setDataArticle] = useState<ArticleApiResponseProps[]>([]);
  const { userDetails } = useAuth();
  const { getPermalink, getFeaturedImageUrl } = useArticle();
  useEffect(() => {
    const fetchDataArticles = async () => {
      const urlParams = new URLSearchParams();
      urlParams.append("pinned", "1");
      try {
        const vaData = await getArticleByFields(
          {
            id_country: userDetails?.id_country,
            id_city: userDetails?.id_city,
            // pinned: true,
          },
          urlParams
        );
        if (vaData) {
          const vaArticle = vaData.articles;
          console.log(vaArticle);
          setDataArticle(vaArticle);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDataArticles();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

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

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Pinned Articles
          </h3>
        </div>
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
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Actions
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
                        src={getFeaturedImageUrl(article)}
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
                  <div className="gap-3">
                    <div className="mb-2 flex items-center justify-center">
                      <Avatar
                        src={generateImageUrl(
                          article.country_flag,
                          true,
                          article.id
                        )}
                        size="xsmall"
                        alt={article.name_country}
                      />
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {article.name_country}
                      </span>
                    </div>
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
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {/* <Badge size="sm" color="success"> */}
                  <div className="flex gap-2 justify-center">
                    <Button size="sm">
                      <Link to={getPermalink(article)}>View</Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      <Link to={`/admin/mst_article/edit/${article.id}`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                  {/* </Badge> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PinnedArticles;
