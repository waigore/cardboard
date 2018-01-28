'use strict';
module.exports = (sequelize, DataTypes) => {
  var SiteTag = sequelize.define('SiteTag', {
    name: DataTypes.STRING,
    site: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return SiteTag;
};