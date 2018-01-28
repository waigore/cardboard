'use strict';
module.exports = (sequelize, DataTypes) => {
  var SearchTerm = sequelize.define('SearchTerm', {
    name: DataTypes.STRING,
    status: DataTypes.STRING,
    safeOnly: DataTypes.BOOLEAN,
    toExclude: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return SearchTerm;
};
