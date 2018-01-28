'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      identifier: {
        type: Sequelize.STRING
      },
      md5: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      filename: {
        type: Sequelize.STRING
      },
      site: {
        type: Sequelize.STRING
      },
      tags: {
        type: Sequelize.STRING
      },
      artists: {
        type: Sequelize.STRING
      },
      characters: {
        type: Sequelize.STRING
      },
      copyrights: {
        type: Sequelize.STRING
      },
      uploadedAt: {
        type: Sequelize.DATE
      },
      downloadedAt: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Images');
  }
};
