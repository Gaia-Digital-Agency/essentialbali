"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const existing = await queryInterface.sequelize.query(
        "SELECT COUNT(*) AS count FROM asset_media",
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (Number(existing[0]?.count || 0) > 0) {
        return;
      }

      // Actual images from GCS bucket gs://gda_p01_storage/gda_wna_images/
      const images = [
        { filename: "04-Marina-One-en.webp", mimetype: "image/webp" },
        { filename: "1-1.webp", mimetype: "image/webp" },
        { filename: "1-2.webp", mimetype: "image/webp" },
        { filename: "1-3.webp", mimetype: "image/webp" },
        { filename: "1-4.webp", mimetype: "image/webp" },
        { filename: "1.1-1-1.webp", mimetype: "image/webp" },
        { filename: "1.1-1.webp", mimetype: "image/webp" },
        { filename: "1.1.webp", mimetype: "image/webp" },
        { filename: "1.2.webp", mimetype: "image/webp" },
        { filename: "1.3.webp", mimetype: "image/webp" },
        { filename: "1.webp", mimetype: "image/webp" },
        { filename: "1130-x-600-facade.webp", mimetype: "image/webp" },
        { filename: "13-hotels-in-vietnam-debut-on-the-prestigious-michelin-key-list-1.webp", mimetype: "image/webp" },
        { filename: "13-hotels-in-vietnam-debut-on-the-prestigious-michelin-key-list-2.webp", mimetype: "image/webp" },
        { filename: "13-hotels-in-vietnam-debut-on-the-prestigious-michelin-key-list-3.webp", mimetype: "image/webp" },
        { filename: "1759905158622-459857971.png", mimetype: "image/png" },
        { filename: "1759905700340-788795651.jpg", mimetype: "image/jpeg" },
        { filename: "1759905700343-602037448.png", mimetype: "image/png" },
        { filename: "1759905700350-883995497.png", mimetype: "image/png" },
        { filename: "1759905700353-268353729.png", mimetype: "image/png" },
        { filename: "1759905700359-2907115.png", mimetype: "image/png" },
        { filename: "1759905700375-861009907.png", mimetype: "image/png" },
        { filename: "1759905700377-205214609.png", mimetype: "image/png" },
        { filename: "1759905898251-821166066.png", mimetype: "image/png" },
        { filename: "1759905914912-805363674.jpg", mimetype: "image/jpeg" },
        { filename: "1759905972456-457642604.jpg", mimetype: "image/jpeg" },
        { filename: "1759978232153-575378675.png", mimetype: "image/png" },
        { filename: "1759990702042-162203170.png", mimetype: "image/png" },
        { filename: "1759990755426-70267399.png", mimetype: "image/png" },
        { filename: "1760606702826-438287488.png", mimetype: "image/png" },
        { filename: "1760606772370-860417873.png", mimetype: "image/png" },
        { filename: "1760666711162-387658657.jpg", mimetype: "image/jpeg" },
        { filename: "1760666711173-583762767.jpg", mimetype: "image/jpeg" },
        { filename: "1760667319117-774806760.jpg", mimetype: "image/jpeg" },
        { filename: "1760667319144-769152474.webp", mimetype: "image/webp" },
        { filename: "1760667319145-749467580.jpg", mimetype: "image/jpeg" },
        { filename: "1760667319150-93507341.jpg", mimetype: "image/jpeg" },
        { filename: "1760667319176-811357546.jpg", mimetype: "image/jpeg" },
        { filename: "1760667319178-45697549.jpg", mimetype: "image/jpeg" },
        { filename: "1760667319194-476636975.jpg", mimetype: "image/jpeg" },
        { filename: "1760667319220-493703850.jpg", mimetype: "image/jpeg" },
        { filename: "1760667702326-339170852.jpg", mimetype: "image/jpeg" },
        { filename: "1760667702347-168565394.jpg", mimetype: "image/jpeg" },
        { filename: "1760667702360-141870064.jpg", mimetype: "image/jpeg" },
        { filename: "1760667702375-788713786.jpg", mimetype: "image/jpeg" },
        { filename: "1760667702439-395513598.jpg", mimetype: "image/jpeg" },
        { filename: "1760667702461-822671949.jpg", mimetype: "image/jpeg" },
        { filename: "1760668557804-359006634.webp", mimetype: "image/webp" },
        { filename: "1760682323887-43430203.jpg", mimetype: "image/jpeg" },
        { filename: "1760683110193-512811764.png", mimetype: "image/png" },
        { filename: "1760683110197-958312927.png", mimetype: "image/png" },
        { filename: "1760683110201-45222818.png", mimetype: "image/png" },
        { filename: "1760683110204-685286322.png", mimetype: "image/png" },
        { filename: "1760683110206-432206248.png", mimetype: "image/png" },
        { filename: "1760683132741-130909905.png", mimetype: "image/png" },
        { filename: "1760683132745-451033024.png", mimetype: "image/png" },
        { filename: "1760683132749-252489456.png", mimetype: "image/png" },
        { filename: "1760683132751-989630557.png", mimetype: "image/png" },
        { filename: "1760683132755-829682638.png", mimetype: "image/png" },
        { filename: "1760683362988-867319341.png", mimetype: "image/png" },
      ];

      const assetMediaEntries = images.map((img, index) => ({
        id: index + 1,
        title: img.filename.replace(/\.[^/.]+$/, "").replace(/-/g, " "),
        alt_text: `Image ${index + 1}`,
        caption: null,
        description: null,
        filename: img.filename,
        mimetype: img.mimetype,
        size: 100000, // approximate size
        path: img.filename,
        createdBy: 1,
        updatedBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queryInterface.bulkInsert("asset_media", assetMediaEntries, {});
    } catch (error) {
      console.error(error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await queryInterface.bulkDelete("asset_media", null, {
      truncate: true,
      restartIdentity: true,
      cascade: true,
    });
    await queryInterface.sequelize.query(
      "ALTER TABLE asset_media AUTO_INCREMENT = 1"
    );
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
  },
};
