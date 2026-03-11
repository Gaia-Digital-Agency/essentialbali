import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import searchIcon from "../../icons/search.svg";
import arrowRight from "../../icons/arrow-right.svg";
import { useTaxonomies } from "../../context/TaxonomyContext";

interface SearchEmptyStateProps {
  keyword: string;
}

const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({ keyword }) => {
  const { taxonomies } = useTaxonomies();

  const randomCategories = useMemo(() => {
    if (!taxonomies?.categories || taxonomies.categories.length === 0) {
      return [
        { title: 'Dining', slug_title: 'dining' },
        { title: 'Events', slug_title: 'events' },
        { title: 'Travel', slug_title: 'travel' }
      ];
    }

    // Filter only main categories (not children) if possible, or just shuffle all
    const availableCategories = taxonomies.categories.filter(c => !c.is_child);
    const source = availableCategories.length >= 3 ? availableCategories : taxonomies.categories;
    
    return [...source]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
  }, [taxonomies]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-in fade-in duration-700 col-span-12">
      {/* Icon Section */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gray-200 rounded-full blur-2xl opacity-40 scale-150"></div>
        <div className="relative bg-white p-8 rounded-full shadow-sm border border-gray-100 flex items-center justify-center">
          <img src={searchIcon} alt="Search" className="w-16 h-16 opacity-20" />
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center max-w-lg mx-auto mb-12">
        <h2 className="text-3xl font-serif text-gray-900 mb-4">
          No articles found
        </h2>
        <p className="text-gray-500 font-sans text-lg leading-relaxed">
          We couldn't find any articles matching <span className="font-semibold text-gray-800 italic">"{keyword}"</span>. 
          Maybe try checking for typos or using broader keywords.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-sans font-medium rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          Back to Home
        </Link>
      </div>

      {/* Suggested Categories */}
      <div className="mt-24 w-full max-w-3xl">
        <div className="flex items-center justify-center space-x-4 mb-10">
          <div className="h-px w-16 bg-gray-200"></div>
          <span className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-gray-400">Popular Categories</span>
          <div className="h-px w-16 bg-gray-200"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {randomCategories.map((cat) => (
            <Link 
              key={cat.slug_title}
              to={`/category/${cat.slug_title}`}
              className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                <img src={arrowRight} alt="Go" className="w-4 h-4" />
              </div>
              <h4 className="font-serif text-xl text-gray-900 group-hover:text-gray-700 transition-colors">
                {cat.title}
              </h4>
              <p className="text-xs text-gray-400 mt-2 font-sans uppercase tracking-widest">Explore More</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchEmptyState;
