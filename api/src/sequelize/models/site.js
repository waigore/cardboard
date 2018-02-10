'use strict';
module.exports = (sequelize, DataTypes) => {
  var Site = sequelize.define('Site', {
    name: DataTypes.STRING,
    domain: DataTypes.STRING,
    type: DataTypes.STRING,
    apiUser: DataTypes.STRING,
    apiKey: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Site;
};
