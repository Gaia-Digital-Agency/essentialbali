// import { RouteProps } from "../../context/RouteContext";
// import { TemplateFieldsProps } from "../../pages/Master/Templates/LocationTemplateExp";
// import { getArticleByFields } from "../../services/article.service";
// import { ArticleProps } from "../../types/article.type";

// class Template {
//     // static key = ''
//     key: string
//     fields: TemplateFieldsProps = {
//         articles: [] as ArticleProps[],
//         rules: {
//             limit: 3
//         },
//         query: {
//             useRoute: true
//         }
//     }
//     constructor(key: string, fields: TemplateFieldsProps) {
//         this.key = key
//         this.fields = fields
//     }

//     static getKey(key: string) {
//         return key
//     }

//     static async queryArticle(actualRoute: RouteProps) {
//         const get = await getArticleByFields({
//             id_country:
//         })
//     }
// }