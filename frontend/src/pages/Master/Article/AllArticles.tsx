import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { getArticleByKeyword, getArticleByFields, deleteArticle } from "../../../services/article.service";
import { ArticleApiResponseProps, ArticleStatusProps } from "../../../types/article.type";
import { useTaxonomies } from "../../../context/TaxonomyContext";
import ComponentCard from "../../../components/common/ComponentCard";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Button from "../../../components/ui/button/Button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../components/ui/table";
import { useNotification } from "../../../context/NotificationContext";
import { generatePagination } from "../../../lib/utils/pagination";

const AllArticles: React.FC = () => {
  const [articles, setArticles] = useState<ArticleApiResponseProps[]>([]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<number>(0);
  const [country, setCountry] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const { adminTaxonomies } = useTaxonomies();
  const { setNotification } = useNotification();

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let result;
      const limit = 10;
      
      const params: any = {
        page,
        limit,
        status: status ? [status as ArticleStatusProps] : "",
        category: category || "",
        id_country: country || "",
      };

      if (keyword.length >= 3) {
        result = await getArticleByKeyword({ keyword, ...params });
      } else {
        result = await getArticleByFields(params);
      }

      if (result) {
        setArticles(result.articles);
        setTotalPages(result.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error(error);
      setNotification({ message: "Failed to fetch articles", type: "fail" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, status, category, country]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        const success = await deleteArticle(id);
        if (success) {
          setNotification({ message: "Article deleted successfully", type: "neutral" });
          fetchArticles();
        }
      } catch (error) {
        console.error(error);
        setNotification({ message: "Failed to delete article", type: "fail" });
      }
    }
  };

  const pagination = generatePagination(page, totalPages);

  return (
    <div className="space-y-6 p-4">
      <ComponentCard>
        <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">All Articles</h2>
                <Link
                    to="/admin/mst_article/add"
                    className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 text-sm font-medium transition-colors shadow-sm"
                >
                    Add Article
                </Link>
            </div>
            <form onSubmit={handleSearch} className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-12 md:col-span-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">Keyword</label>
                <Input
                placeholder="Search by title..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                />
            </div>
            <div className="col-span-12 md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">Bali Area</label>
                <Select
                placeholder="All Areas"
                options={[
                    ...(adminTaxonomies.countries?.map((c) => ({ label: c.name, value: c.id })) || []),
                ]}
                value={country}
                onChange={(val) => setCountry(Number(val))}
                />
            </div>
            <div className="col-span-12 md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
                <Select
                placeholder="All Categories"
                options={[
                    ...(adminTaxonomies.categories?.map((c) => ({ label: c.title, value: c.id })) || []),
                ]}
                value={category}
                onChange={(val) => setCategory(Number(val))}
                />
            </div>
            <div className="col-span-12 md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
                <Select
                placeholder="All Status"
                options={[
                    { label: "Published", value: "published" },
                    { label: "Draft", value: "draft" },
                    { label: "Archived", value: "archived" },
                    { label: "Bin", value: "bin" },
                ]}
                value={status}
                onChange={(val) => setStatus(String(val))}
                />
            </div>
            <div className="col-span-12 md:col-span-2">
                <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Searching..." : "Search"}
                </Button>
            </div>
            </form>
        </div>

        <div className="overflow-x-auto">
          <Table className="text-left border border-gray-200 rounded-lg">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableCell isHeader className="px-4 py-3 font-semibold text-gray-900 border-b">Title</TableCell>
                <TableCell isHeader className="px-4 py-3 font-semibold text-gray-900 border-b">Category</TableCell>
                <TableCell isHeader className="px-4 py-3 font-semibold text-gray-900 border-b">Bali Area</TableCell>
                <TableCell isHeader className="px-4 py-3 font-semibold text-gray-900 border-b">Status</TableCell>
                <TableCell isHeader className="px-4 py-3 font-semibold text-gray-900 border-b text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles && articles.length > 0 ? (
                articles.map((article) => (
                  <TableRow key={article.id} className="border-b hover:bg-gray-50 transition-colors">
                    <TableCell className="px-4 py-3 max-w-xs truncate">{article.title}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-600">{article.category_name}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-600">{article.name_country}</TableCell>
                    <TableCell className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        article.status === 'published' ? 'bg-green-100 text-green-800 border border-green-200' :
                        article.status === 'draft' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {article.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          to={`/admin/mst_article/edit/${article.id}`}
                          className="px-3 py-1.5 bg-brand-500 text-white rounded-md hover:bg-brand-600 text-sm font-medium transition-colors shadow-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium transition-colors shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-center py-10 text-gray-500" colSpan={5}>
                    {loading ? "Loading articles..." : "No articles found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
                Previous
            </button>
            <div className="flex gap-1">
                {pagination.map((p, i) => (
                <button
                    key={i}
                    onClick={() => typeof p === 'number' && setPage(p)}
                    disabled={p === page || typeof p !== 'number'}
                    className={`min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    p === page ? 'bg-brand-500 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    } ${typeof p !== 'number' ? 'cursor-default border-none' : ''}`}
                >
                    {p}
                </button>
                ))}
            </div>
            <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
                Next
            </button>
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default AllArticles;
