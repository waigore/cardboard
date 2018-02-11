'use strict';
module.exports = (sequelize, DataTypes) => {
  var Site = sequelize.define('Site', {
    name: DataTypes.STRING,
    domain: DataTypes.STRING,
    type: DataTypes.STRING,
    apiUser: DataTypes.STRING,
    apiKey: DataTypes.STRING
  });

  Site.associate = models => {
    console.log("Associating site...")
    Site.hasMany(models.Image, { foreignKey: "site", sourceKey: "name;" })
  }

  return Site;
};
