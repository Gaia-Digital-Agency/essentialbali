import db from "../models/index.js";
import { decodeToken, decodeTokenFromCookie } from "../helpers/jwtoken.js";

const {
  Property,
  PropertyLocation,
  PropertyImage,
  PropertyAmenity,
  PropertyAmenityItem,
  AssetMedia,
  Region,
  City,
  Country,
  sequelize,
} = db;

export default {
  async test() {
    const vaData = await Property.findAll();
    return vaData;
  },

  async addPropertyLocation(vaData) {
    try {
      const vaNewData = await PropertyLocation.create(vaData);
      return vaNewData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getAllPropertyLocation() {
    try {
      const vaData = await PropertyLocation.findAll();
      return vaData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async addAmenityItem(vaData) {
    try {
      const vaNewData = await PropertyAmenityItem.create(vaData);
      return vaNewData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getAllAmenityItem() {
    try {
      const [vaData, metadata] = await sequelize.query(
        `SELECT i.id, i.name, m.path as icon from property_amenity_item i LEFT JOIN asset_media m ON m.id = i.icon ;`
      );

      return vaData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async addNewProperty(req) {
    try {
      const vaBody = req.body;
      const vaCookies = req.cookies;
      const decodedToken = await decodeTokenFromCookie(vaCookies.token);

      const vaData = {
        name: vaBody.name,
        description: vaBody.description,
        type: vaBody.type,
        bedrooms: vaBody.bedrooms,
        bathrooms: vaBody.bathrooms,
        capacity: vaBody.capacity,
        // amenities: vaBody.amenities,
        location_id: vaBody.id_region,
        id_country: vaBody.id_country,
        id_city: vaBody.id_city,
        id_region: vaBody.id_region,
        //rent_type: vaBody.rent_type,
        //price: vaBody.price,
        featured_image: vaBody.featured_image,
        created_by: decodedToken.user_id,
        created_at: new Date(),
        //images: vaBody.images,
      };

      const cRentType = vaBody.rent_type;
      if (cRentType == "daily") {
        vaData.price_daily = vaBody.price;
      } else if (cRentType == "monthly") {
        vaData.price_monthly = vaBody.price;
      } else if (cRentType == "yearly") {
        vaData.price_yearly = vaBody.price;
      }

      const cIDCountryBody = vaBody.id_country;
      const cIDCityBody = vaBody.id_city;
      const cIDRegionBody = vaBody.id_region;

      const region = await Region.findByPk(cIDRegionBody);
      if (!region) {
        throw new Error("Region tidak ditemukan");
      }

      if (region.id_city !== cIDCityBody) {
        throw new Error("Region tidak sesuai dengan kota");
      }

      vaData.id_country = cIDCountryBody;
      vaData.id_city = cIDCityBody;
      vaData.id_region = cIDRegionBody;

      // masukkan data ke tabel properti
      const vaDataProperty = await Property.create(vaData);
      const dbPropertyId = vaDataProperty.id;

      const featured_image = vaBody.featured_image; // 1
      const vaBodyImages = vaBody.images; // [ 2, 3, 4 ]
      if (!vaBodyImages.includes(featured_image)) {
        vaBodyImages.push(featured_image);
      }

      const vaDataImageProperty = await Promise.all(
        vaBodyImages.map(async (image) => {
          const dbImage = await AssetMedia.findByPk(image);
          const is_primary = image == featured_image ? true : false;
          const vaDetailImageProperty = {
            property_id: dbPropertyId,
            image_url: dbImage.path,
            is_primary: is_primary,
          };
          return vaDetailImageProperty;
        })
      );

      const bulkInsertImage = PropertyImage.bulkCreate(vaDataImageProperty);

      const vaInputAmenity = vaBody.amenities; // isinya adalah id dari property_amenity_item, lalu bulk insert ke tabel property_amenity
      const vaDataPropertyAmenities = await Promise.all(
        vaInputAmenity.map(async (amenity) => {
          const vaPropertyAmenity = {
            property_id: dbPropertyId,
            amenity_id: amenity,
          };
          return vaPropertyAmenity;
        })
      );

      const bulkInsertAmenity = PropertyAmenity.bulkCreate(
        vaDataPropertyAmenities
      );

      const promBulk = await Promise.all([bulkInsertImage, bulkInsertAmenity]);
      return [vaData, ...promBulk];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getAllProperty() {
    try {
      const result = await Property.findAll({
        where: { is_active: 1 },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: PropertyImage,
            attributes: ["id", "image_url", "is_primary"],
          },
          {
            model: PropertyAmenityItem,
            as: "amenity",
            attributes: ["id", "name", "icon"],
            through: { attributes: [] }, // agar bidang tabel pivot (property_amenities) tidak ditampilkan
            include: [
              {
                model: AssetMedia,
                as: "iconMedia", // pastikan Anda telah mendefinisikan alias ini di model Anda
                attributes: ["path"], // atau ["id", "filename", "path"] jika detail diperlukan
              },
            ],
          },
          {
            model: Region,
            attributes: ["name"],
          },
          {
            model: City,
            attributes: ["name"],
          },
          {
            model: Country,
            attributes: ["name"],
          },
        ],
      });

      const formattedData = result.map((item) => {
        const plain = item.get({ plain: true });

        return {
          ...plain,
          amenity: plain.amenity.map((am) => ({
            id: am.id,
            name: am.name,
            icon: am.iconMedia?.path || null, // dapatkan dari asset_media
          })),
          location: {
            region: plain.Region?.name || null,
            city: plain.City?.name || null,
            country: plain.Country?.name || null,
          },
          // hapus bidang default agar tidak diduplikasi
          Region: undefined,
          City: undefined,
          Country: undefined,
        };
      });

      return formattedData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getAllPropertyByRentTypePerCity(
    rent_type,
    id_country,
    id_city,
    filtered_tags = [],
    limit = 10,
    offset = 0
  ) {
    try {
      let vaData = await Property.findAll({
        where: {
          id_country: id_country,
          id_city: id_city,
          is_active: 1,
        },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: PropertyImage,
            attributes: ["id", "image_url", "is_primary"],
          },
          {
            model: PropertyAmenityItem,
            as: "amenity",
            attributes: ["id", "name", "icon"],
            through: { attributes: [] }, // agar bidang tabel pivot (property_amenities) tidak ditampilkan
          },
          {
            model: Region,
            attributes: ["name"],
          },
          {
            model: City,
            attributes: ["name"],
          },
          {
            model: Country,
            attributes: ["name"],
          },
        ],
      });

      if (rent_type) {
        if (rent_type == "daily") {
          // filter data yang memiliki nilai > 0 di bidang price_daily
          vaData = vaData.filter((item) => item.price_daily > 0);
        } else if (rent_type == "monthly") {
          // filter data yang memiliki nilai > 0 di bidang price_monthly
          vaData = vaData.filter((item) => item.price_monthly > 0);
        } else if (rent_type == "yearly") {
          // filter data yang memiliki nilai > 0 di bidang price_yearly
          vaData = vaData.filter((item) => item.price_yearly > 0);
        }
      }

      const formattedData = vaData.map((item) => {
        const plain = item.get({ plain: true });

        return {
          ...plain,
          location: {
            region: plain.Region?.name || null,
            city: plain.City?.name || null,
            country: plain.Country?.name || null,
          },
          // hapus bidang default agar tidak diduplikasi
          Region: undefined,
          City: undefined,
          Country: undefined,
        };
      });

      const count = formattedData.length;
      const totalPages = Math.ceil(count / limit);
      const page = Math.floor(offset / limit) + 1;

      const paginatedData = formattedData.slice(offset, offset + limit);

      return {
        pagination: {
          total: count,
          page,
          limit,
          totalPages,
        },
        articles: paginatedData,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getPropertyByID(cIDProperty) {
    try {
      const result = await Property.findAll({
        where: { id: cIDProperty, is_active: 1 },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: PropertyImage,
            attributes: ["id", "image_url", "is_primary"],
          },
          {
            model: PropertyAmenityItem,
            as: "amenity",
            attributes: ["id", "name", "icon"],
            through: { attributes: [] }, // agar bidang tabel pivot (property_amenities) tidak ditampilkan
          },
          {
            model: Region,
            attributes: ["name"],
          },
          {
            model: City,
            attributes: ["name"],
          },
          {
            model: Country,
            attributes: ["name"],
          },
        ],
      });

      const formattedData = result.map((item) => {
        const plain = item.get({ plain: true });

        return {
          ...plain,
          location: {
            region: plain.Region?.name || null,
            city: plain.City?.name || null,
            country: plain.Country?.name || null,
          },
          // hapus bidang default agar tidak diduplikasi
          Region: undefined,
          City: undefined,
          Country: undefined,
        };
      });

      return formattedData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
