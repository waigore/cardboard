'use strict';
module.exports = (sequelize, DataTypes) => {
  var Image = sequelize.define('Image', {
    identifier: DataTypes.STRING,
    md5: DataTypes.STRING,
    status: DataTypes.STRING,
    filename: DataTypes.STRING,
    site: {
      type: DataTypes.STRING,
      references: {
        model: "Site",
        key: "name"
      }
    },
    fileUrl: DataTypes.STRING,
    tags: DataTypes.STRING,
    artists: DataTypes.STRING,
    characters: DataTypes.STRING,
    copyrights: DataTypes.STRING,
    starred: DataTypes.BOOLEAN,
    uploadedAt: DataTypes.DATE,
    downloadedAt: DataTypes.DATE
  });

  Image.associate = models => {
    console.log("Associating image...")
    Image.belongsTo(models.Site, { foreignKey: "site", targetKey: "name" });
  }

  return Image;
};
