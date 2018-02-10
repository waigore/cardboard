'use strict';
module.exports = (sequelize, DataTypes) => {
  var SearchTerm = sequelize.define('SearchTerm', {
    name: DataTypes.STRING,
    status: DataTypes.STRING,
    safeOnly: DataTypes.BOOLEAN,
    toExclude: DataTypes.BOOLEAN,
    lastDownloadedId: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return SearchTerm;
};
