'use strict';
module.exports = (sequelize, DataTypes) => {
  var Image = sequelize.define('Image', {
    identifier: DataTypes.STRING,
    md5: DataTypes.STRING,
    status: DataTypes.STRING,
    filename: DataTypes.STRING,
    site: DataTypes.STRING,
    tags: DataTypes.STRING,
    artists: DataTypes.STRING,
    characters: DataTypes.STRING,
    copyrights: DataTypes.STRING,
    uploadedAt: DataTypes.DATE,
    downloadedAt: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Image;
};
