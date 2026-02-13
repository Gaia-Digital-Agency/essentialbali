import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { ArticleProps } from "../../types/article.type";
import { getArticleByKeyword, getArticleByFields } from "../../services/article.service";
import Button from "../ui/button/Button";
import { MultiValue } from "react-select";

type ArticleSearchProps = {
    onSave: (articles: ArticleProps[]) => void
}

const ArticleSearch: React.FC<ArticleSearchProps> = ({onSave}) => {
    const [selectedArticles, setSelectedArticles] = useState<ArticleProps[]>([])
    const changeHandler = (options: MultiValue<{label: string, value: ArticleProps}>) => {
        setSelectedArticles(options.map(option => (option.value)))
    }
    const loadOptions = async (inputValue: string): Promise<{ label: string; value: ArticleProps }[]> => {
        try {
            let articles: ArticleProps[] = [];

            if (inputValue && inputValue.length > 3) {
                const result = await getArticleByKeyword({ keyword: inputValue, limit: 99 });
                if (result?.articles) articles = result.articles;
            } else {
                const result = await getArticleByFields({ limit: 99 });
                if (result?.articles) articles = result.articles;
            }

            return articles.map((article) => ({
                label: article.title,
                value: article,
            }));
        } catch {
            return [];
        }
    };

    return (
        <div className="w-max-1/2">
            <AsyncSelect
                onChange={(options) => {changeHandler(options)}}
                cacheOptions
                defaultOptions
                isMulti
                loadOptions={loadOptions}
                placeholder="Search article..."
            />
            <Button onClick={() => onSave(selectedArticles)}>Embed Article</Button>
        </div>
    );
};

export default ArticleSearch;
