import "dotenv/config";
import { Op } from "sequelize";
import slugify from "slugify";
import db from "../src/models/index.js";

const BALI_AREAS = [
  "Canggu",
  "Seminyak",
  "Kuta",
  "Legian",
  "Ubud",
  "Uluwatu",
  "Jimbaran",
  "Sanur",
  "Nusa Dua",
  "Ungasan",
  "Pecatu",
  "Kutuh",
  "Sawangan",
  "Kerobokan",
  "Umalas",
  "Denpasar",
  "Candidasa",
  "Amed",
  "Tulamben",
  "Padangbai",
  "Sidemen",
  "Amlapura",
  "Klungkung",
  "Tirta Gangga",
  "Bedugul",
  "Kintamani",
  "Munduk",
  "Lovina",
  "Singaraja",
  "Baturiti",
  "Bangli",
  "Jatiluwih",
  "Pemuteran",
  "Medewi",
  "Negara",
  "Gilimanuk",
  "Menjangan Island",
  "Tabanan",
  "Nusa Penida",
  "Nusa Lembongan",
  "Nusa Ceningan",
  "Serangan Island",
];

const toSlug = (value) =>
  slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });

const TARGET_CATEGORIES = [
  { slug: "events", title: "Events", description: "Bali events and happenings." },
  { slug: "deals", title: "Deals", description: "Bali deals and savings." },
  { slug: "featured", title: "Featured", description: "Featured Bali stories and highlights." },
  { slug: "ultimate-guide", title: "Ultimate Guide", description: "Comprehensive Bali area guides." },
  { slug: "health-wellness", title: "Health & Wellness", description: "Health and wellness in Bali." },
  { slug: "directory", title: "Directory", description: "Bali services, venues, and directories." },
  { slug: "nature-adventure", title: "Nature Adventure", description: "Nature and adventure experiences in Bali." },
  { slug: "most-popular", title: "Most Popular", description: "Most popular picks in Bali." },
  { slug: "area-highlights", title: "Area Highlights", description: "Highlights from other Bali areas." },
];

const main = async () => {
  await db.sequelize.authenticate();
  const transaction = await db.sequelize.transaction();

  try {
    const actor = await db.User.findOne({
      attributes: ["id"],
      order: [["id", "ASC"]],
      transaction,
    });

    if (!actor) {
      throw new Error("No users found. Run user seed first so createdBy/updatedBy can be set.");
    }

    const sampleImage = await db.AssetMedia.findOne({
      attributes: ["id"],
      order: [["id", "ASC"]],
      transaction,
    });

    const sourceArticles = await db.Articles.findAll({
      where: {
        status: "published",
        article_post: { [Op.ne]: null },
      },
      attributes: ["id", "title", "sub_title", "article_post", "meta_data", "featured_image", "tags", "author"],
      order: [["id", "ASC"]],
      transaction,
    });
    const sourceArticle = sourceArticles[0];

    let createdCountries = 0;
    let createdCities = 0;
    let createdRegions = 0;
    let createdArticles = 0;
    let createdCategories = 0;
    let createdTemplates = 0;

    const categoriesBySlug = new Map();
    for (const targetCategory of TARGET_CATEGORIES) {
      let category = await db.Category.findOne({
        where: { slug_title: targetCategory.slug },
        transaction,
      });

      if (!category) {
        category = await db.Category.create(
          {
            title: targetCategory.title,
            sub_title: targetCategory.title,
            slug_title: targetCategory.slug,
            description: targetCategory.description,
            template_name: "template_name",
            createdBy: actor.id,
            updatedBy: actor.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { transaction },
        );
        createdCategories += 1;
      }

      categoriesBySlug.set(targetCategory.slug, category);
    }

    const usedSlugs = new Set(
      (
        await db.Articles.findAll({
          attributes: ["slug_title"],
          transaction,
        })
      ).map((row) => row.slug_title),
    );
    const assetRows = await db.AssetMedia.findAll({
      attributes: ["id", "path"],
      transaction,
    });
    const assetMap = new Map(assetRows.map((asset) => [asset.id, asset.path]));
    const toTemplateArticle = (article) => ({
      id: article.id,
      slug: article.slug_title,
      slug_title: article.slug_title,
      title: article.title,
      sub_title: article.sub_title,
      article_post: article.article_post,
      id_country: article.id_country,
      id_city: article.id_city,
      id_region: article.id_region,
      category_id: article.category,
      meta_data: article.meta_data,
      tags: article.tags,
      featured_image_url: article.featured_image ? assetMap.get(article.featured_image) || null : null,
      featured_image_4_3_url: article.featured_image_4_3 ? assetMap.get(article.featured_image_4_3) || null : null,
      featured_image_16_9_url: article.featured_image_16_9 ? assetMap.get(article.featured_image_16_9) || null : null,
      featured_image_alt: article.title,
      status: article.status,
      publishedAt: article.publishedAt,
      author_name: article.author,
      updatedAt: article.updatedAt,
      createdAt: article.createdAt,
    });
    const buildTemplateArticles = async (where, limit) => {
      const rows = await db.Articles.findAll({
        where,
        order: [["publishedAt", "DESC"], ["id", "DESC"]],
        limit,
        transaction,
      });
      const mapped = rows.map(toTemplateArticle);
      while (mapped.length < limit) mapped.push(0);
      return mapped;
    };

    let sourceIndex = 0;
    const sourceLength = sourceArticles.length || 1;

    for (const areaName of BALI_AREAS) {
      const areaSlug = toSlug(areaName);

      let country = await db.Country.findOne({
        where: { slug: areaSlug },
        transaction,
      });

      if (!country) {
        country = await db.Country.create(
          {
            name: areaName,
            slug: areaSlug,
            timezone: "Asia/Makassar",
          },
          { transaction },
        );
        createdCountries += 1;
      } else {
        await country.update(
          {
            name: areaName,
            timezone: "Asia/Makassar",
          },
          { transaction },
        );
      }

      let city = await db.City.findOne({
        where: { id_country: country.id },
        order: [["id", "ASC"]],
        transaction,
      });

      if (!city) {
        city = await db.City.create(
          {
            id_country: country.id,
            name: `${areaName} Center`,
            slug: `${areaSlug}-center`,
          },
          { transaction },
        );
        createdCities += 1;
      }

      let region = await db.Region.findOne({
        where: { id_city: city.id },
        order: [["id", "ASC"]],
        transaction,
      });

      if (!region) {
        region = await db.Region.create(
          {
            id_city: city.id,
            name: `${areaName} Core`,
            slug: `${areaSlug}-core`,
          },
          { transaction },
        );
        createdRegions += 1;
      }

      for (const targetCategory of TARGET_CATEGORIES) {
        const category = categoriesBySlug.get(targetCategory.slug);
        if (!category) continue;

        const existing = await db.Articles.count({
          where: {
            id_country: country.id,
            category: category.id,
            status: "published",
          },
          transaction,
        });
        if (existing > 0) continue;

        const source = sourceArticles[sourceIndex % sourceLength] ?? sourceArticle;
        sourceIndex += 1;

        const sourceTitle = source?.title ? source.title.replace(/\s+/g, " ").trim() : "Area Guide";
        const articleTitle = `${areaName} ${targetCategory.title}: ${sourceTitle}`;

        let articleSlug = `${areaSlug}-${targetCategory.slug}-${toSlug(sourceTitle)}`;
        let suffix = 2;
        while (usedSlugs.has(articleSlug)) {
          articleSlug = `${areaSlug}-${targetCategory.slug}-${toSlug(sourceTitle)}-${suffix}`;
          suffix += 1;
        }
        usedSlugs.add(articleSlug);

        const starterBody = source?.article_post
          ? `${source.article_post}<p>This content has been localized for ${areaName}, Bali by essentialbali.</p>`
          : `<p>${areaName} is one of Bali's key areas. This starter page was generated for essentialbali and should be refined in CMS.</p>`;

        const metaData = {
          seo_title: `${articleTitle} | essentialbali`,
          seo_desc: `${targetCategory.title} in ${areaName}, Bali on essentialbali.`,
        };

        const article = await db.Articles.create(
          {
            slug_title: articleSlug,
            title: articleTitle,
            sub_title: source?.sub_title || `Starter ${targetCategory.title.toLowerCase()} page for ${areaName}, Bali.`,
            article_post: starterBody,
            tags: source?.tags || [],
            featured_image: source?.featured_image || sampleImage?.id || null,
            meta_data: metaData,
            status: "published",
            author: source?.author || "essentialbali Editorial",
            category: category.id,
            parent_category_id: null,
            id_country: country.id,
            id_city: city.id,
            id_region: region.id,
            createdBy: actor.id,
            updatedBy: actor.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            publishedby: actor.id,
            publishedAt: new Date(),
            pinned: targetCategory.slug === "featured" ? 1 : 0,
          },
          { transaction },
        );

        const version = await db.ArticleVersion.create(
          {
            article_id: article.id,
            title: article.title,
            sub_title: article.sub_title,
            article_post: article.article_post,
            tags: article.tags,
            featured_image: article.featured_image,
            meta_data: article.meta_data,
            status: "published",
            publishedAt: new Date(),
            scheduledAt: null,
            createdAt: new Date(),
            createdBy: actor.id,
            updatedAt: new Date(),
            updatedBy: actor.id,
          },
          { transaction },
        );

        await article.update(
          {
            current_version_id: version.id,
          },
          { transaction },
        );

        createdArticles += 1;
      }

      const getArticlesByCategory = async (slug, limit) => {
        const category = categoriesBySlug.get(slug);
        if (!category) return Array.from({ length: limit }).map(() => 0);
        return buildTemplateArticles(
          {
            id_country: country.id,
            category: category.id,
            status: "published",
          },
          limit,
        );
      };

      const getTrendingArticles = async (limit) => {
        const excluded = ["most-popular", "ultimate-guide", "events"].map((slug) => categoriesBySlug.get(slug)?.id).filter(Boolean);
        return buildTemplateArticles(
          {
            id_country: country.id,
            status: "published",
            ...(excluded.length ? { category: { [Op.notIn]: excluded } } : {}),
          },
          limit,
        );
      };

      const getAreaHighlightsArticles = async (limit) => {
        return buildTemplateArticles(
          {
            id_country: { [Op.ne]: country.id },
            status: "published",
          },
          limit,
        );
      };

      const templateContent = {
        heroImage: { articles: await getArticlesByCategory("featured", 3) },
        trending: { articles: await getTrendingArticles(5) },
        mostPopular: { articles: await getArticlesByCategory("most-popular", 8) },
        events: { articles: await getArticlesByCategory("events", 4) },
        ultimateGuide: { articles: await getArticlesByCategory("ultimate-guide", 6) },
        overseas: { articles: await getAreaHighlightsArticles(8) },
      };

      const templateUrl = `/v2/${areaSlug}`;
      const existingTemplate = await db.ArticleTemplating.findOne({
        where: { url: templateUrl },
        transaction,
      });

      if (existingTemplate) {
        await existingTemplate.update(
          {
            content: JSON.stringify(templateContent),
            template: "Home",
            isActive: true,
            updatedBy: actor.id,
          },
          { transaction },
        );
      } else {
        await db.ArticleTemplating.create(
          {
            url: templateUrl,
            content: JSON.stringify(templateContent),
            template: "Home",
            isActive: true,
            createdBy: actor.id,
            updatedBy: actor.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { transaction },
        );
        createdTemplates += 1;
      }
    }

    const globalTemplateContent = {
      heroImage: { articles: await buildTemplateArticles({ status: "published", pinned: 1 }, 3) },
      trending: { articles: await buildTemplateArticles({ status: "published" }, 5) },
      mostPopular: {
        articles: await buildTemplateArticles(
          { status: "published", category: categoriesBySlug.get("most-popular")?.id || -1 },
          8,
        ),
      },
      events: { articles: await buildTemplateArticles({ status: "published", category: categoriesBySlug.get("events")?.id || -1 }, 4) },
      ultimateGuide: {
        articles: await buildTemplateArticles(
          { status: "published", category: categoriesBySlug.get("ultimate-guide")?.id || -1 },
          6,
        ),
      },
      overseas: {
        articles: await buildTemplateArticles(
          { status: "published", category: categoriesBySlug.get("area-highlights")?.id || -1 },
          8,
        ),
      },
    };

    const existingGlobalTemplate = await db.ArticleTemplating.findOne({
      where: { url: "/v2/" },
      transaction,
    });
    if (existingGlobalTemplate) {
      await existingGlobalTemplate.update(
        {
          content: JSON.stringify(globalTemplateContent),
          template: "Home",
          isActive: true,
          updatedBy: actor.id,
        },
        { transaction },
      );
    } else {
      await db.ArticleTemplating.create(
        {
          url: "/v2/",
          content: JSON.stringify(globalTemplateContent),
          template: "Home",
          isActive: true,
          createdBy: actor.id,
          updatedBy: actor.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { transaction },
      );
      createdTemplates += 1;
    }

    await transaction.commit();
    console.table({
      createdCategories,
      createdCountries,
      createdCities,
      createdRegions,
      createdArticles,
      createdTemplates,
      totalAreas: BALI_AREAS.length,
    });
    console.log("Bali bootstrap complete.");
  } catch (error) {
    await transaction.rollback();
    console.error("Bali bootstrap failed:", error);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
};

main();
