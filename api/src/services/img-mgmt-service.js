const fs = require('fs-extra');
const moment = require('moment');

const Image = require('../sequelize/models').Image;
const SearchTerm = require('../sequelize/models').SearchTerm;
const Op = require('sequelize').Op;

let formatImage = function(image) {
  return {
    identifier: image.identifier,
    status: image.status,
    thumbnail: 'thumbnails/' + image.filename,
    filename: image.filename,
    tags: image.tags.split(' ').splice(0, 3),
    characters: image.characters && image.characters.trim() ? image.characters.split(' ') : [],
    copyrights: image.copyrights && image.copyrights.trim() ? image.copyrights.split(' ') : [],
    uploadedAt: moment(image.uploadedAt)
  }
}

module.exports = {
  getAllSearchTerms: function() {
    return SearchTerm.findAll({
      where: {
        status: 'ACTIVE'
      }
    })
    .then(terms => {
      return terms.map(term => {
        return {
          name: term.name,
          status: term.status,
          safeOnly: term.safeOnly,
          toExclude: term.toExclude
        }
      });
    });
  },

  findImagesForDisplay: function(tag, page, numPerPage=30) {
    let searchTag = '%' + tag.replace(' ', '%') + '%';
    let offset = (page-1)*numPerPage;
    let whereCond = {
      status: 'DOWNLOADED',
      tags: {
        [Op.like]: searchTag
      }
    }
    return Image.findAll({
      where: whereCond,
      offset: offset,
      limit: numPerPage,
      order: [
        ['identifier', 'DESC']
      ]
    })
    .then(images => {
      return images.map(image => formatImage(image))
    })
    .then(displayImages => {
      return Image.count({
        where: whereCond
      }).then(c => { return {total: c, images: displayImages}})
    })
  },

  deleteImage: function(identifier) {
    return Image.findOne({
      where: {
        identifier: identifier
      }
    })
    .then(image => {
      return Image.update(
        { status: 'DELETED' },
        { where: {
            identifier: identifier
          }
        }
      ).then(affectedRows => image);
    })
    /*
    .then(image => {
      let fullImagePath = util.getOutputFolderPath() + '/' + image.filename;
      let fullThumbnailPath = util.getThumbnailFolderPath() + '/' + image.filename;
      return
        fs.unlink(fullImagePath)
        .then(() => fs.unlink(fullThumbnailPath))
        .catch(err => console.log("Error deleting file on disk!", err));
    })*/
    .then(() => {
      return {identifier: identifier, status: 'OK'}
    });
  }
}
